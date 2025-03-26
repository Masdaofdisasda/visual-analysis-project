import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

num_actions = len(y.unique())  # Number of distinct actions
input_dim = 132                # x,y,z,visibility for 33 landmarks

model = keras.Sequential([
    layers.Input(shape=(input_dim,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(32, activation='relu'),
    layers.Dense(num_actions, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Convert labels to numeric if they’re strings
label_to_index = {label: idx for idx, label in enumerate(sorted(y_train.unique()))}
y_train_idx = y_train.map(label_to_index).values
y_test_idx  = y_test.map(label_to_index).values

model.fit(
    X_train.values, y_train_idx,
    validation_split=0.2,
    epochs=10,
    batch_size=32
)

test_loss, test_acc = model.evaluate(X_test.values, y_test_idx)
print("Test Accuracy:", test_acc)

# Save the label mapping for future reference
import json
with open("label_map.json", "w") as f:
    json.dump(label_to_index, f)