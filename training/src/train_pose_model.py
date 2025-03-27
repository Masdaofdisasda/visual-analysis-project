import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def main():
    df = pd.read_csv('../data/pose_data.csv')

    X = df.drop('label', axis=1).values
    y = df['label'].values

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(label_encoder.classes_), activation='softmax')
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=15, batch_size=32)

    model.save('../models/model.keras')

    # Save label mapping for the browser later
    import json
    with open('../models/label_map.json', 'w') as f:
        json.dump({i: label for i, label in enumerate(label_encoder.classes_)}, f)

if __name__ == "__main__":
    main()