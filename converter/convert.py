import os
import subprocess

DATA_DIR = "data"
OUTPUT_DIR = "output"
MODEL_FILE = "model.h5"

model_path = os.path.join(DATA_DIR, MODEL_FILE)
output_path = os.path.join(OUTPUT_DIR)

# Create output dir if it doesn't exist
os.makedirs(output_path, exist_ok=True)

# Build the command
cmd = [
    "tensorflowjs_converter",
    "--input_format=keras",
    model_path,
    output_path
]

print(f"🔄 Converting {model_path} to TensorFlow.js format in {output_path}...")
subprocess.run(cmd, check=True)
print("✅ Conversion complete.")