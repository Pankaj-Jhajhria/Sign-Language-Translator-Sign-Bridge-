import cv2
import joblib
import mediapipe as mp
import numpy as np


# =========================================================
# PATHS
# =========================================================

ONE_MODEL = "Model/one_hand_structure.pkl"
TWO_MODEL = "Model/two_hand_structure.pkl"
HAND_MODEL = "models/hand_landmarker.task"

CONFIDENCE_THRESHOLD = 0.40


# =========================================================
# LOAD MODELS
# =========================================================

one_model = joblib.load(ONE_MODEL)
two_model = joblib.load(TWO_MODEL)


# =========================================================
# LANDMARK FUNCTIONS
# EXACTLY SAME AS WORKING webcam_test.py
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
# MEDIAPIPE INFERENCE ENGINE
# =========================================================

class SignLanguageInference:

    def __init__(self):

        options = mp.tasks.vision.HandLandmarkerOptions(

            base_options=mp.tasks.BaseOptions(
                model_asset_path=HAND_MODEL
            ),

            running_mode=mp.tasks.vision.RunningMode.VIDEO,

            num_hands=2,

            min_hand_detection_confidence=0.5,

            min_hand_presence_confidence=0.5,

            min_tracking_confidence=0.5
        )

        self.landmarker = (
            mp.tasks.vision.HandLandmarker
            .create_from_options(options)
        )

        self.timestamp = 0


    # =====================================================
    # PROCESS ONE FRAME
    # =====================================================

    def predict(self, frame):

        # frame = OpenCV BGR image

        rgb = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb
        )

        self.timestamp += 1

        result = self.landmarker.detect_for_video(
            mp_image,
            self.timestamp
        )

        hands = []
        landmarks = []

        # -------------------------------------------------
        # Extract hands
        # -------------------------------------------------

        if result.hand_landmarks:

            for hand in result.hand_landmarks:

                points = get_points(
                    hand
                )

                hands.append(points)

                # Save normalized landmarks for frontend
                hand_landmarks = []

                for lm in hand:

                    hand_landmarks.append({
                        "x": float(lm.x),
                        "y": float(lm.y)
                    })

                landmarks.append(
                    hand_landmarks
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

            features = two_hand_structure(
                hands[0],
                hands[1]
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


        return {
            "prediction": prediction,
            "confidence": confidence,
            "hands": len(hands),
            "landmarks": landmarks
        }


    # =====================================================
    # CLOSE
    # =====================================================

    def close(self):

        self.landmarker.close()