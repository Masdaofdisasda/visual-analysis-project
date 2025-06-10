
## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/Masdaofdisasda/visual-analysis-project.git
```

2. **Train a model for pose detection**

```bash
cd visual-analysis-project/training
# assuming you have conda
conda env create --file=environment.yml
conda activate humanmotion
```
You can now add training data in training/data/raw/. The pipeline expects the videos in th form [labelname]_n.mp4.
Then run the pose_training_pipeline.ipynb and then a tensorflow model should be saved in training/models together with a label map.

3. **Convert**

To use this in a web application the model needs to be converted to a tensorflowjs model.

setup the enviroment with:
```bash
cd ../converter
# assuming you have conda
conda env create --file=environment.yml
conda activate converter

```
then run the converter:
```bash
python convert.py
```

this should create a tfjs model in client/public/tfjs_model

4. **Run the particle simulation**

install dependencies with:
```bash
cd ../client
# assuming you have node
npm install
```

then you can serve the app locally:
```bash
npm dev
```

or create an Electron App:
```bash
npm run electron:build
```