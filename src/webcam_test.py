import cv2
import joblib
import mediapipe as mp
import numpy as np

ONE_MODEL = "Model/one_hand_classifier.pkl"
TWO_MODEL = "Model/two_hand_classifier.pkl"
HAND_MODEL = "models/hand_landmarker.task"

one_model = joblib.load(ONE_MODEL)
two_model = joblib.load(TWO_MODEL)


def canonicalize_hand(hand, hand_type):
    points = np.array(
        [[lm.x, lm.y, lm.z] for lm in hand],
        dtype=np.float32
    )

    # Wrist -> origin
    points = points - points[0]

    # Make left/right representation consistent
    if hand_type == "Left":
        points[:, 0] *= -1

    index_mcp = points[5]
    pinky_mcp = points[17]
    wrist = points[0]

    x_axis = pinky_mcp - index_mcp
    y_axis = ((index_mcp + pinky_mcp) / 2) - wrist

    x_axis /= np.linalg.norm(x_axis) + 1e-8

    z_axis = np.cross(x_axis, y_axis)
    z_axis /= np.linalg.norm(z_axis) + 1e-8

    y_axis = np.cross(z_axis, x_axis)
    y_axis /= np.linalg.norm(y_axis) + 1e-8

    palm_width = np.linalg.norm(pinky_mcp - index_mcp)

    if palm_width < 1e-8:
        palm_width = 1.0

    relative = points - wrist

    canonical = np.stack([
        relative @ x_axis,
        relative @ y_axis,
        relative @ z_axis
    ], axis=1)

    canonical /= palm_width

    return canonical.flatten()


BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
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

cap = cv2.VideoCapture(0)
timestamp = 0

with HandLandmarker.create_from_options(options) as landmarker:

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        # Keep original frame for MediaPipe
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

        predictions = []
        display = cv2.flip(frame, 1)

        if result.hand_landmarks:

            for hand, handedness in zip(
                result.hand_landmarks,
                result.handedness
            ):

                hand_type = handedness[0].category_name

                features = canonicalize_hand(
                    hand,
                    hand_type
                )

                predictions.append(
                    (hand_type, features)
                )

                # Draw landmarks
                for lm in hand:
                    x = int(lm.x * frame.shape[1])
                    y = int(lm.y * frame.shape[0])

                    # Mirror only for display
                    x = frame.shape[1] - x

                    cv2.circle(
                        display,
                        (x, y),
                        4,
                        (0, 255, 0),
                        -1
                    )

        prediction = "NO SIGN"
        confidence = 0.0

        # =========================
        # ONE HAND
        # =========================
        if len(predictions) == 1:

            _, features = predictions[0]

            probabilities = one_model.predict_proba(
                [features]
            )[0]

            index = np.argmax(probabilities)
            confidence = probabilities[index]

            if confidence >= 0.40:
                prediction = one_model.classes_[index]

        # =========================
        # TWO HANDS
        # =========================
        elif len(predictions) == 2:

            features1 = predictions[0][1]
            features2 = predictions[1][1]

            combined = np.concatenate([
                features1,
                features2
            ])

            probabilities = two_model.predict_proba(
                [combined]
            )[0]

            index = np.argmax(probabilities)
            confidence = probabilities[index]

            if confidence >= 0.40:
                prediction = two_model.classes_[index]

        # =========================
        # DISPLAY
        # =========================

        cv2.putText(
            display,
            f"Prediction: {prediction}",
            (30, 55),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.3,
            (0, 255, 0),
            3
        )

        cv2.putText(
            display,
            f"Confidence: {confidence:.2f}",
            (30, 95),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.imshow(
            "Sign Language Translator",
            display
        )

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()