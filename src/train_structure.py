import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


DATASET = "landmarks_strict.csv"
MODEL_DIR = "Model"


ONE_HAND_CLASSES = {
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "C", "I", "L", "O", "U", "V"
}

TWO_HAND_CLASSES = {
    "A", "B", "D", "E", "F", "G", "H", "J", "K", "M",
    "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"
}


# =========================================================
# LANDMARKS
# =========================================================

def get_hand(row, side):
    points = []

    for i in range(1, 22):
        points.append([
            row[f"{side}_x{i}"],
            row[f"{side}_y{i}"],
            row[f"{side}_z{i}"]
        ])

    return np.array(points, dtype=np.float32)


# =========================================================
# GEOMETRY
# =========================================================

def angle(a, b, c):
    """
    Angle ABC.
    """
    v1 = a - b
    v2 = c - b

    n1 = np.linalg.norm(v1)
    n2 = np.linalg.norm(v2)

    if n1 < 1e-8 or n2 < 1e-8:
        return 0.0

    cos_value = np.dot(v1, v2) / (n1 * n2)

    cos_value = np.clip(
        cos_value,
        -1.0,
        1.0
    )

    return np.arccos(cos_value)


def hand_structure(hand):
    """
    Create scale/rotation/translation-resistant
    structural features for one hand.
    """

    features = []

    # -----------------------------------------------------
    # Palm scale
    # -----------------------------------------------------

    palm_width = np.linalg.norm(
        hand[5] - hand[17]
    )

    if palm_width < 1e-8:
        palm_width = 1.0

    # -----------------------------------------------------
    # Finger bend angles
    #
    # Thumb: 1,2,3,4
    # Index: 5,6,7,8
    # Middle: 9,10,11,12
    # Ring: 13,14,15,16
    # Pinky: 17,18,19,20
    # -----------------------------------------------------

    finger_chains = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [17, 18, 19, 20]
    ]

    for chain in finger_chains:

        p0, p1, p2, p3 = [
            hand[i] for i in chain
        ]

        features.append(
            angle(p0, p1, p2) / np.pi
        )

        features.append(
            angle(p1, p2, p3) / np.pi
        )

    # -----------------------------------------------------
    # Finger spread / direction angles
    # -----------------------------------------------------

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

        n1 = np.linalg.norm(rays[i])
        n2 = np.linalg.norm(rays[i + 1])

        if n1 < 1e-8 or n2 < 1e-8:
            features.append(0.0)
            continue

        value = np.dot(
            rays[i],
            rays[i + 1]
        ) / (n1 * n2)

        value = np.clip(
            value,
            -1.0,
            1.0
        )

        features.append(
            np.arccos(value) / np.pi
        )

    # -----------------------------------------------------
    # Relative finger lengths
    # -----------------------------------------------------

    for tip_index in [4, 8, 12, 16, 20]:

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
# TWO-HAND FEATURES
# =========================================================

def two_hand_structure(left, right):
    """
    Structural features for two hands.

    Invariant to:
    - translation
    - global rotation
    - overall scale
    - switching which hand is first
    """

    left_features = hand_structure(left)
    right_features = hand_structure(right)

    # -----------------------------------------------------
    # Cross-hand geometry
    #
    # Use important structural points rather than every
    # raw landmark.
    # -----------------------------------------------------

    important = [0, 4, 8, 12, 16, 20]

    left_points = left[important]
    right_points = right[important]

    palm_scale = (
        np.linalg.norm(left[5] - left[17]) +
        np.linalg.norm(right[5] - right[17])
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

    # -----------------------------------------------------
    # Make left/right interchangeable
    # -----------------------------------------------------

    feature_a = np.concatenate([
        left_features,
        right_features,
        cross_features
    ])

    feature_b = np.concatenate([
        right_features,
        left_features,
        cross_features.reshape(6, 6).T.flatten()
    ])

    if tuple(feature_a) <= tuple(feature_b):
        return feature_a

    return feature_b


# =========================================================
# LOAD DATA
# =========================================================

print("Loading dataset...")

df = pd.read_csv(DATASET)

df["label"] = df["label"].astype(str)

one_X = []
one_y = []

two_X = []
two_y = []


# =========================================================
# FEATURE GENERATION
# =========================================================

for _, row in df.iterrows():

    label = row["label"]

    left = get_hand(row, "left")
    right = get_hand(row, "right")

    left_detected = int(row["left_detected"])
    right_detected = int(row["right_detected"])

    # ---------------------------------------------
    # ONE HAND
    # ---------------------------------------------

    if label in ONE_HAND_CLASSES:

        if left_detected + right_detected != 1:
            continue

        if left_detected:

            features = hand_structure(left)

        else:

            features = hand_structure(right)

        one_X.append(features)
        one_y.append(label)

    # ---------------------------------------------
    # TWO HANDS
    # ---------------------------------------------

    elif label in TWO_HAND_CLASSES:

        if left_detected + right_detected != 2:
            continue

        features = two_hand_structure(
            left,
            right
        )

        two_X.append(features)
        two_y.append(label)


one_X = np.array(one_X)
one_y = np.array(one_y, dtype=str)

two_X = np.array(two_X)
two_y = np.array(two_y, dtype=str)


print()
print("One-hand samples:", len(one_X))
print("One-hand features:", one_X.shape[1])

print("Two-hand samples:", len(two_X))
print("Two-hand features:", two_X.shape[1])


# =========================================================
# ONE HAND MODEL
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    one_X,
    one_y,
    test_size=0.20,
    random_state=42,
    stratify=one_y
)

print()
print("Training one-hand structure model...")

one_model = RandomForestClassifier(
    n_estimators=300,
    n_jobs=-1,
    random_state=42,
)

one_model.fit(
    X_train,
    y_train
)

pred = one_model.predict(X_test)

print(
    "One-hand accuracy:",
    f"{accuracy_score(y_test, pred) * 100:.2f}%"
)


# =========================================================
# TWO HAND MODEL
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    two_X,
    two_y,
    test_size=0.20,
    random_state=42,
    stratify=two_y
)

print()
print("Training two-hand structure model...")

two_model = RandomForestClassifier(
    n_estimators=300,
    n_jobs=-1,
    random_state=42,
)

two_model.fit(
    X_train,
    y_train
)

pred = two_model.predict(X_test)

print(
    "Two-hand accuracy:",
    f"{accuracy_score(y_test, pred) * 100:.2f}%"
)


# =========================================================
# SAVE
# =========================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

joblib.dump(
    one_model,
    os.path.join(
        MODEL_DIR,
        "one_hand_structure.pkl"
    )
)

joblib.dump(
    two_model,
    os.path.join(
        MODEL_DIR,
        "two_hand_structure.pkl"
    )
)

print()
print("========== DONE ==========")
print("Saved:")
print("Model/one_hand_structure.pkl")
print("Model/two_hand_structure.pkl")