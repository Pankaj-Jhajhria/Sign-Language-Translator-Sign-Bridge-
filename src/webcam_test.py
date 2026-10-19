import cv2
import joblib
import mediapipe as mp
import numpy as np
import asyncio
import edge_tts
import pygame

from collections import deque, Counter


# =========================================================
# CONFIG
# =========================================================

ONE_MODEL = "Model/one_hand_structure.pkl"
TWO_MODEL = "Model/two_hand_structure.pkl"
HAND_MODEL = "models/hand_landmarker.task"

CONFIDENCE_THRESHOLD = 0.40

STABLE_FRAMES = 5
RELEASE_FRAMES = 6

# Natural Indian English voice
VOICE = "en-IN-PrabhatNeural"


# =========================================================
# LOAD MODELS
# =========================================================

one_model = joblib.load(ONE_MODEL)
two_model = joblib.load(TWO_MODEL)

print("One-hand features:", 19)
print("Two-hand features:", 74)


# =========================================================
# TEXT TO SPEECH
# =========================================================

async def generate_speech(text):
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate="+0%",
        volume="+0%"
    )

    await communicate.save("speech.mp3")


def speak(text):

    if not text.strip():
        return

    try:
        asyncio.run(
            generate_speech(text)
        )

        pygame.mixer.init()

        pygame.mixer.music.load(
            "speech.mp3"
        )

        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy():

            pygame.time.Clock().tick(10)

        pygame.mixer.music.stop()
        pygame.mixer.quit()

    except Exception as e:

        print("TTS Error:", e)


# =========================================================
# LANDMARK FUNCTIONS
# =========================================================

def get_points(hand):

    return np.array(
        [
            [lm.x, lm.y, lm.z]
            for lm in hand
        ],
        dtype=np.float32
    )


def angle(a, b, c):

    v1 = a - b
    v2 = c - b

    n1 = np.linalg.norm(v1)
    n2 = np.linalg.norm(v2)

    if n1 < 1e-8 or n2 < 1e-8:
        return 0.0

    cosine = np.dot(
        v1,
        v2
    ) / (n1 * n2)

    cosine = np.clip(
        cosine,
        -1.0,
        1.0
    )

    return np.arccos(cosine) / np.pi


# =========================================================
# ONE-HAND STRUCTURE
# EXACTLY SAME AS TRAINING
# =========================================================

def hand_structure(hand):

    features = []

    palm_width = np.linalg.norm(
        hand[5] - hand[17]
    )

    if palm_width < 1e-8:
        palm_width = 1.0

    finger_chains = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [17, 18, 19, 20]
    ]

    # Finger bend angles
    for chain in finger_chains:

        p0, p1, p2, p3 = [
            hand[i]
            for i in chain
        ]

        features.append(
            angle(p0, p1, p2)
        )

        features.append(
            angle(p1, p2, p3)
        )

    # Finger spread
    fingertips = [
        hand[4],
        hand[8],
        hand[12],
        hand[16],
        hand[20]
    ]

    wrist = hand[0]

    rays = [
        tip - wrist
        for tip in fingertips
    ]

    for i in range(4):

        n1 = np.linalg.norm(
            rays[i]
        )

        n2 = np.linalg.norm(
            rays[i + 1]
        )

        if n1 < 1e-8 or n2 < 1e-8:

            features.append(0.0)
            continue

        cosine = np.dot(
            rays[i],
            rays[i + 1]
        ) / (n1 * n2)

        cosine = np.clip(
            cosine,
            -1.0,
            1.0
        )

        features.append(
            np.arccos(cosine) / np.pi
        )

    # Relative finger lengths
    for tip_index in [
        4, 8, 12, 16, 20
    ]:

        length = np.linalg.norm(
            hand[tip_index] - wrist
        )

        features.append(
            length / palm_width
        )

    return np.array(
        features,
        dtype=np.float32
    )


# =========================================================
# TWO-HAND STRUCTURE
# EXACTLY SAME AS TRAINING
# =========================================================

def two_hand_structure(left, right):

    left_features = hand_structure(
        left
    )

    right_features = hand_structure(
        right
    )

    important = [
        0, 4, 8, 12, 16, 20
    ]

    left_points = left[
        important
    ]

    right_points = right[
        important
    ]

    palm_scale = (
        np.linalg.norm(
            left[5] - left[17]
        )
        +
        np.linalg.norm(
            right[5] - right[17]
        )
    ) / 2.0

    if palm_scale < 1e-8:
        palm_scale = 1.0

    cross_features = []

    for p1 in left_points:

        for p2 in right_points:

            distance = np.linalg.norm(
                p1 - p2
            )

            cross_features.append(
                distance / palm_scale
            )

    cross_features = np.array(
        cross_features,
        dtype=np.float32
    )

    feature_a = np.concatenate(
        [
            left_features,
            right_features,
            cross_features
        ]
    )

    feature_b = np.concatenate(
        [
            right_features,
            left_features,
            cross_features
                .reshape(6, 6)
                .T
                .flatten()
        ]
    )

    if tuple(feature_a) <= tuple(feature_b):

        return feature_a

    return feature_b


# =========================================================
# MEDIAPIPE
# =========================================================

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = (
    mp.tasks.vision.HandLandmarkerOptions
)
RunningMode = mp.tasks.vision.RunningMode


options = HandLandmarkerOptions(

    base_options=BaseOptions(
        model_asset_path=HAND_MODEL
    ),

    running_mode=RunningMode.VIDEO,

    num_hands=2,

    min_hand_detection_confidence=0.5,

    min_hand_presence_confidence=0.5,

    min_tracking_confidence=0.5
)


# =========================================================
# CAMERA
# =========================================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():

    print("Could not open webcam.")
    raise SystemExit


timestamp = 0


# =========================================================
# STATE
# =========================================================

prediction_history = deque(
    maxlen=STABLE_FRAMES
)

sentence = ""

character_locked = False

no_sign_count = 0


# =========================================================
# MAIN LOOP
# =========================================================

with HandLandmarker.create_from_options(
    options
) as landmarker:

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        # -------------------------------------------------
        # MediaPipe input
        # -------------------------------------------------

        rgb = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb
        )

        timestamp += 1

        result = landmarker.detect_for_video(
            mp_image,
            timestamp
        )

        # Mirror display only
        display = cv2.flip(
            frame,
            1
        )

        hands = []


        # =================================================
        # DETECT HANDS
        # =================================================

        if result.hand_landmarks:

            for hand in result.hand_landmarks:

                points = get_points(
                    hand
                )

                hands.append(points)

                # Draw landmarks
                for lm in hand:

                    x = int(
                        lm.x *
                        frame.shape[1]
                    )

                    y = int(
                        lm.y *
                        frame.shape[0]
                    )

                    x = (
                        frame.shape[1]
                        - x
                    )

                    cv2.circle(
                        display,
                        (x, y),
                        4,
                        (0, 255, 0),
                        -1
                    )


        prediction = "NO SIGN"
        confidence = 0.0


        # =================================================
        # ONE HAND
        # =================================================

        if len(hands) == 1:

            features = hand_structure(
                hands[0]
            )

            probabilities = (
                one_model.predict_proba(
                    [features]
                )[0]
            )

            index = np.argmax(
                probabilities
            )

            confidence = float(
                probabilities[index]
            )

            if (
                confidence
                >= CONFIDENCE_THRESHOLD
            ):

                prediction = str(
                    one_model.classes_[index]
                )


        # =================================================
        # TWO HANDS
        # =================================================

        elif len(hands) == 2:

            features = (
                two_hand_structure(
                    hands[0],
                    hands[1]
                )
            )

            probabilities = (
                two_model.predict_proba(
                    [features]
                )[0]
            )

            index = np.argmax(
                probabilities
            )

            confidence = float(
                probabilities[index]
            )

            if (
                confidence
                >= CONFIDENCE_THRESHOLD
            ):

                prediction = str(
                    two_model.classes_[index]
                )


        # =================================================
        # CHARACTER STABILIZATION
        # =================================================

        if prediction == "NO SIGN":

            no_sign_count += 1

            prediction_history.clear()

            if (
                no_sign_count
                >= RELEASE_FRAMES
            ):

                character_locked = False

        else:

            no_sign_count = 0

            prediction_history.append(
                prediction
            )

            if (
                len(prediction_history)
                == STABLE_FRAMES
                and not character_locked
            ):

                stable_label, count = (
                    Counter(
                        prediction_history
                    ).most_common(1)[0]
                )

                if count >= STABLE_FRAMES:

                    sentence += stable_label

                    character_locked = True

                    prediction_history.clear()


        # =================================================
        # DISPLAY
        # =================================================

        cv2.putText(
            display,
            f"Prediction: {prediction}",
            (25, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.05,
            (0, 255, 0),
            3
        )

        cv2.putText(
            display,
            f"Confidence: {confidence:.2f}",
            (25, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 0),
            2
        )

        cv2.putText(
            display,
            f"Text: {sentence}",
            (25, 125),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 255, 255),
            2
        )

        cv2.putText(
            display,
            "SPACE | BACKSPACE | C:clear | S:speak | Q:quit",
            (20, display.shape[0] - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            (255, 0, 255),
            1
        )


        cv2.imshow(
            "Indian Sign Language Translator",
            display
        )


        # =================================================
        # KEYBOARD
        # =================================================

        key = cv2.waitKey(1) & 0xFF


        if key == ord("q"):

            break


        elif key == ord("c"):

            sentence = ""

            prediction_history.clear()

            character_locked = False


        elif key == ord("s"):

            # Speak EXACTLY what was recognized.
            # No aggressive spell correction.
            speak(sentence)


        elif key == 32:

            sentence += " "

            character_locked = False


        elif key == 8:

            sentence = sentence[:-1]


# =========================================================
# CLEANUP
# =========================================================

cap.release()

cv2.destroyAllWindows()