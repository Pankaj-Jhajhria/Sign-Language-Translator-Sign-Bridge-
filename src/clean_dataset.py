import os
import cv2
import shutil
import mediapipe as mp
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm

DATA_DIR = "data2"
OUTPUT_DIR = "data2_clean"
MODEL_PATH = "models/hand_landmarker.task"

NUM_WORKERS = 8
MIN_LANDMARKS = 20


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
    image_path, label, filename = task

    image = cv2.imread(image_path)

    if image is None:
        return False

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = landmarker.detect(mp_image)

    if not result.hand_landmarks:
        return False

    valid_hands = 0

    for hand in result.hand_landmarks:
        valid_landmarks = 0

        for lm in hand:
            if (
                0.0 <= lm.x <= 1.0
                and 0.0 <= lm.y <= 1.0
                and -1.0 <= lm.z <= 1.0
            ):
                valid_landmarks += 1

        if valid_landmarks >= MIN_LANDMARKS:
            valid_hands += 1

    # Keep image if at least one good hand exists
    if valid_hands >= 1:
        return True

    return False


if __name__ == "__main__":

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    tasks = []

    for label in sorted(os.listdir(DATA_DIR)):

        folder = os.path.join(DATA_DIR, label)

        if not os.path.isdir(folder):
            continue

        os.makedirs(
            os.path.join(OUTPUT_DIR, label),
            exist_ok=True
        )

        for filename in os.listdir(folder):

            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):
                tasks.append(
                    (
                        os.path.join(folder, filename),
                        label,
                        filename
                    )
                )

    print(f"Total images: {len(tasks)}")
    print(f"Workers: {NUM_WORKERS}")
    print("Checking dataset...\n")

    kept = 0
    rejected = 0

    with ProcessPoolExecutor(
        max_workers=NUM_WORKERS,
        initializer=init_worker
    ) as executor:

        results = executor.map(
            process_image,
            tasks,
            chunksize=25
        )

        for task, valid in tqdm(
            zip(tasks, results),
            total=len(tasks)
        ):

            if valid:

                _, label, filename = task

                shutil.copy2(
                    os.path.join(DATA_DIR, label, filename),
                    os.path.join(OUTPUT_DIR, label, filename)
                )

                kept += 1

            else:
                rejected += 1

    print("\n========== DONE ==========")
    print(f"Kept:     {kept}")
    print(f"Rejected: {rejected}")
    print(f"Saved to: {OUTPUT_DIR}")