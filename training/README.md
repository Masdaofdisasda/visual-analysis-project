
## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/Masdaofdisasda/visual-analysis-project.git
cd visual-analysis-project/training
```

2. **Active Virtual Environment**
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# OR
source venv/bin/activate  # On macOS/Linux
```

3 **Install Dependencies**
```bash
pip install -r requirements.txt
```

## Project Structure:

```bash
training/
│
├── venv/                  # Python virtual environment
├── data/                  # Input videos or extracted pose CSVs
├── models/                # Trained models
├── src/                   # Source code scripts
├── requirements.txt       # Python dependencies
└── README.md              # Project setup instructions
```