import pandas as pd
import tensorflow as tf
import json
from sklearn.preprocessing import LabelEncoder
from typing import Tuple


def load_pose_data(csv_path: str) -> Tuple[pd.DataFrame, pd.Series]:
    df = pd.read_csv(csv_path)
    X = df.drop('label', axis=1)
    y = df['label']
    return X, y


def encode_labels(y: pd.Series) -> Tuple[pd.Series, LabelEncoder]:
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    return y_encoded, label_encoder


def build_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def save_model(model: tf.keras.Model, export_path: str):
    tf.saved_model.save(model, export_path)


def save_label_map(label_encoder: LabelEncoder, path: str):
    label_map = {i: label for i, label in enumerate(label_encoder.classes_)}
    with open(path, 'w') as f:
        json.dump(label_map, f)
