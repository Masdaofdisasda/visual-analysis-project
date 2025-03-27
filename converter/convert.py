import subprocess
from pathlib import Path

def convert_saved_model_to_tfjs(input_dir: Path, output_dir: Path):
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    command = [
        "tensorflowjs_converter",
        "--input_format=tf_saved_model",
        "--output_format=tfjs_graph_model",
        str(input_dir),
        str(output_dir)
    ]

    print(f"🔁 Converting {input_dir} → {output_dir}")
    try:
        subprocess.run(command, check=True)
        print(f"TF.js model saved to {output_dir}")
    except subprocess.CalledProcessError as e:
        print("Conversion failed:", e)

if __name__ == "__main__":
    # Resolve paths relative to project root
    project_root = Path(__file__).resolve().parents[1]

    input_dir = project_root / "training" / "models" / "tf_model"
    output_dir = project_root / "client" / "public" / "tfjs_model"

    convert_saved_model_to_tfjs(input_dir, output_dir)