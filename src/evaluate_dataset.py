import os
import cv2
import joblib
import mediapipe as mp
import numpy as np
from tqdm import tqdm
from sklearn.metrics import accuracy_score, classification_report
import pandas as pd
DATA_DIR = "data"
MODEL_PATH = "Model/sign_classifier_2hand.pkl"
MODEL_FILE = "models/hand_landmarker.task"


def normalize_hand(hand):
    points = np.array(
        [[lm.x, lm.y, lm.z] for lm in hand],
        dtype=np.float32
    )

    points = points - points[0]

    scale = np.max(np.linalg.norm(points, axis=1))

    if scale > 0:
        points = points / scale

    return points.flatten().tolist()


# Load model
model = joblib.load(MODEL_PATH)

# MediaPipe
BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
RunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(
        model_asset_path=MODEL_FILE
    ),
    running_mode=RunningMode.IMAGE,
    num_hands=2,
    min_hand_detection_confidence=0.5
)

y_true = []
y_pred = []

with HandLandmarker.create_from_options(options) as landmarker:

    for label in sorted(os.listdir(DATA_DIR)):

        folder = os.path.join(DATA_DIR, label)

        if not os.path.isdir(folder):
            continue

        files = [
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ]

        for filename in tqdm(
            files,
            desc=f"Class {label}",
            leave=False
        ):

            path = os.path.join(folder, filename)

            image = cv2.imread(path)

            if image is None:
                continue

            rgb = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2RGB
            )

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb
            )

            result = landmarker.detect(mp_image)

            left_features = [0.0] * 63
            right_features = [0.0] * 63

            if result.hand_landmarks:

                for hand, handedness in zip(
                    result.hand_landmarks,
                    result.handedness
                ):

                    features = normalize_hand(hand)

                    hand_type = handedness[0].category_name

                    if hand_type == "Left":
                        left_features = features

                    elif hand_type == "Right":
                        right_features = features

            features = left_features + right_features

            prediction = model.predict(
                pd.DataFrame([features], columns=model.feature_names_in_)
            )[0]

            y_true.append(str(label))
            y_pred.append(str(prediction))


print("\n========== DATASET EVALUATION ==========")

accuracy = accuracy_score(y_true, y_pred)

print(f"\nTotal images tested: {len(y_true)}")
print(f"Correct: {sum(a == b for a, b in zip(y_true, y_pred))}")
print(f"Wrong:   {sum(a != b for a, b in zip(y_true, y_pred))}")
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_true, y_pred))