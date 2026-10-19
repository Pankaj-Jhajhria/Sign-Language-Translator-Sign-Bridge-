import os
import cv2
import pandas as pd
import mediapipe as mp
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm

DATA_DIR = "data2"
OUTPUT_FILE = "landmarks_data2.csv"
MODEL_PATH = "models/hand_landmarker.task"

NUM_WORKERS = 8

landmarker = None


def init_worker():
    global landmarker

    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(
            model_asset_path=MODEL_PATH
        ),
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        num_hands=2,
        min_hand_detection_confidence=0.5
    )

    landmarker = mp.tasks.vision.HandLandmarker.create_from_options(
        options
    )


def process_image(task):
    image_path, label = task

    image = cv2.imread(image_path)

    if image is None:
        return None

    rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = landmarker.detect(mp_image)

    # 63 + 63 = 126
    left_features = [0.0] * 63
    right_features = [0.0] * 63

    left_detected = 0
    right_detected = 0

    if result.hand_landmarks:

        for hand, handedness in zip(
            result.hand_landmarks,
            result.handedness
        ):

            features = []

            for landmark in hand:
                features.extend([
                    landmark.x,
                    landmark.y,
                    landmark.z
                ])

            hand_type = handedness[0].category_name

            if hand_type == "Left":
                left_features = features
                left_detected = 1

            elif hand_type == "Right":
                right_features = features
                right_detected = 1

    hand_count = left_detected + right_detected

    return (
        left_features
        + right_features
        + [left_detected, right_detected, hand_count, label]
    )


if __name__ == "__main__":

    tasks = []

    for label in sorted(os.listdir(DATA_DIR)):

        folder = os.path.join(
            DATA_DIR,
            label
        )

        if not os.path.isdir(folder):
            continue

        for filename in os.listdir(folder):

            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):

                tasks.append(
                    (
                        os.path.join(folder, filename),
                        label
                    )
                )

    print(f"Total images: {len(tasks)}")
    print(f"Workers: {NUM_WORKERS}")
    print("Starting full data2 extraction...\n")

    rows = []
    failed = 0

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
            else:
                failed += 1

    columns = []

    for hand in ["left", "right"]:

        for i in range(1, 22):

            columns.extend([
                f"{hand}_x{i}",
                f"{hand}_y{i}",
                f"{hand}_z{i}"
            ])

    columns.extend([
        "left_detected",
        "right_detected",
        "hand_count",
        "label"
    ])

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
    print(f"Failed: {failed}")
    print(f"Features: 126")
    print(f"Saved: {OUTPUT_FILE}")