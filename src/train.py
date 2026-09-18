import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


DATASET = "landmarks_2hand.csv"
MODEL_DIR = "Model"


def canonicalize_hand(features, hand_type):
    """Make hand position, scale, rotation and handedness invariant."""

    points = np.array(features, dtype=np.float32).reshape(21, 3)

    # Wrist -> origin
    points = points - points[0]

    # Mirror left hand so both hands use the same canonical orientation
    if hand_type == "Left":
        points[:, 0] *= -1

    wrist = points[0]
    index_mcp = points[5]
    pinky_mcp = points[17]

    x_axis = pinky_mcp - index_mcp
    y_axis = ((index_mcp + pinky_mcp) / 2) - wrist

    x_axis /= np.linalg.norm(x_axis) + 1e-8

    z_axis = np.cross(x_axis, y_axis)
    z_axis /= np.linalg.norm(z_axis) + 1e-8

    y_axis = np.cross(z_axis, x_axis)
    y_axis /= np.linalg.norm(y_axis) + 1e-8

    scale = (
        np.linalg.norm(x_axis * 0 + (pinky_mcp - index_mcp))
        + np.linalg.norm(y_axis * 0 + y_axis)
    )

    # Better palm scale
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


def get_hand(row, hand):
    cols = [
        f"{hand}_x{i}"
        for i in range(1, 22)
    ] + [
        f"{hand}_y{i}"
        for i in range(1, 22)
    ] + [
        f"{hand}_z{i}"
        for i in range(1, 22)
    ]

    # Rebuild x,y,z correctly
    points = []

    for i in range(1, 22):
        points.extend([
            row[f"{hand}_x{i}"],
            row[f"{hand}_y{i}"],
            row[f"{hand}_z{i}"]
        ])

    points = np.array(points, dtype=np.float32)

    present = np.any(np.abs(points) > 1e-8)

    return points, present


print("Loading dataset...")

df = pd.read_csv(DATASET)

one_X = []
one_y = []

two_X = []
two_y = []

print(f"Total samples: {len(df)}")

for _, row in df.iterrows():

    label = str(row["label"])

    left, has_left = get_hand(row, "left")
    right, has_right = get_hand(row, "right")

    # -------------------------
    # ONE HAND
    # -------------------------

    if has_left and not has_right:

        features = canonicalize_hand(left, "Left")

        one_X.append(features)
        one_y.append(label)

    elif has_right and not has_left:

        features = canonicalize_hand(right, "Right")

        one_X.append(features)
        one_y.append(label)

    # -------------------------
    # TWO HANDS
    # -------------------------

    elif has_left and has_right:

        left_features = canonicalize_hand(left, "Left")
        right_features = canonicalize_hand(right, "Right")

        # Normal order
        two_X.append(
            np.concatenate([
                left_features,
                right_features
            ])
        )
        two_y.append(label)

        # Swapped order
        two_X.append(
            np.concatenate([
                right_features,
                left_features
            ])
        )
        two_y.append(label)


print(f"One-hand samples: {len(one_X)}")
print(f"Two-hand samples: {len(two_X)}")


# ==========================================================
# ONE-HAND MODEL
# ==========================================================

X1 = np.array(one_X)
y1 = np.array(one_y)

from sklearn.model_selection import train_test_split

# Classes with at least 2 samples
counts = pd.Series(y1).value_counts()

normal_mask = np.array([
    counts[label] >= 2
    for label in y1
])

rare_mask = ~normal_mask

X1_normal = X1[normal_mask]
y1_normal = y1[normal_mask]

X1_rare = X1[rare_mask]
y1_rare = y1[rare_mask]

X1_train, X1_test, y1_train, y1_test = train_test_split(
    X1_normal,
    y1_normal,
    test_size=0.2,
    random_state=42,
    stratify=y1_normal
)

# Always keep rare classes in training
X1_train = np.vstack([X1_train, X1_rare])
y1_train = np.concatenate([y1_train, y1_rare])

print("\nTraining one-hand model...")

one_model = RandomForestClassifier(
    n_estimators=200,
    n_jobs=-1,
    random_state=42
)

one_model.fit(X1_train, y1_train)

pred1 = one_model.predict(X1_test)

acc1 = accuracy_score(y1_test, pred1)

print(f"One-hand accuracy: {acc1 * 100:.2f}%")


# ==========================================================
# TWO-HAND MODEL
# ==========================================================

X2 = np.array(two_X)
y2 = np.array(two_y)

X2_train, X2_test, y2_train, y2_test = train_test_split(
    X2,
    y2,
    test_size=0.2,
    random_state=42,
    stratify=y2
)

print("\nTraining two-hand model...")

two_model = RandomForestClassifier(
    n_estimators=200,
    n_jobs=-1,
    random_state=42
)

two_model.fit(X2_train, y2_train)

pred2 = two_model.predict(X2_test)

acc2 = accuracy_score(y2_test, pred2)

print(f"Two-hand accuracy: {acc2 * 100:.2f}%")


# ==========================================================
# SAVE
# ==========================================================

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(
    one_model,
    os.path.join(MODEL_DIR, "one_hand_classifier.pkl")
)

joblib.dump(
    two_model,
    os.path.join(MODEL_DIR, "two_hand_classifier.pkl")
)

print("\n========== DONE ==========")
print("Saved one-hand model.")
print("Saved two-hand model.")