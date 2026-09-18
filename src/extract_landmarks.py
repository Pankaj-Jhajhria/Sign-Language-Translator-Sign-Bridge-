import os
import cv2
import pandas as pd
import mediapipe as mp
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm
import numpy as np

DATA_DIR = "data"
OUTPUT_FILE = "landmarks_2hand.csv"
MODEL_PATH = "models/hand_landmarker.task"

NUM_WORKERS = 8

landmarker = None


def init_worker():
    global landmarker

    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    RunningMode = mp.tasks.vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=MODEL_PATH
        ),
        running_mode=RunningMode.IMAGE,
        num_hands=2,
        min_hand_detection_confidence=0.5
    )

    landmarker = HandLandmarker.create_from_options(options)


def normalize_hand(hand):
    """
    Normalize landmarks so hand position and size
    have less effect on classification.
    """

    points = np.array(
        [[lm.x, lm.y, lm.z] for lm in hand],
        dtype=np.float32
    )

    # Wrist becomes origin
    points = points - points[0]

    # Normalize by hand size
    distances = np.linalg.norm(points, axis=1)

    scale = np.max(distances)

    if scale > 0:
        points = points / scale

    return points.flatten().tolist()


def process_image(task):

    image_path, label = task

    image = cv2.imread(image_path)

    if image is None:
        return None

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=image_rgb
    )

    result = landmarker.detect(mp_image)

    # Default: no hands
    left_features = [0.0] * 63
    right_features = [0.0] * 63

    if result.hand_landmarks:

        for hand_landmarks, handedness in zip(
            result.hand_landmarks,
            result.handedness
        ):

            normalized = normalize_hand(hand_landmarks)

            hand_type = handedness[0].category_name

            if hand_type == "Left":
                left_features = normalized

            elif hand_type == "Right":
                right_features = normalized

    features = left_features + right_features

    return features + [label]


if __name__ == "__main__":

    tasks = []

    for label in sorted(os.listdir(DATA_DIR)):

        folder = os.path.join(DATA_DIR, label)

        if not os.path.isdir(folder):
            continue

        for filename in os.listdir(folder):

            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):

                path = os.path.join(
                    folder,
                    filename
                )

                tasks.append((path, label))

    print(f"Total images: {len(tasks)}")
    print(f"Workers: {NUM_WORKERS}")
    print("Starting 2-hand normalized extraction...\n")

    rows = []

    with ProcessPoolExecutor(
        max_workers=NUM_WORKERS,
        initializer=init_worker
    ) as executor:

        results = executor.map(
            process_image,
            tasks,
            chunksize=25
        )

        for result in tqdm(
            results,
            total=len(tasks)
        ):

            if result is not None:
                rows.append(result)

    # Create column names
    columns = []

    for hand in ["left", "right"]:

        for i in range(21):

            columns.extend([
                f"{hand}_x{i+1}",
                f"{hand}_y{i+1}",
                f"{hand}_z{i+1}"
            ])

    columns.append("label")

    df = pd.DataFrame(
        rows,
        columns=columns
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n========== DONE ==========")
    print(f"Successful: {len(rows)}")
    print(f"Failed: {len(tasks) - len(rows)}")
    print(f"Features: {len(columns) - 1}")
    print(f"Saved: {OUTPUT_FILE}")