import os
from kaggle.api.kaggle_api_extended import KaggleApi

api = KaggleApi()
api.authenticate()

def download_kaggle_dataset(dataset_ref: str):
    """
    Downloads and unzips a Kaggle dataset locally
    """
    base_dir = "data"
    os.makedirs(base_dir, exist_ok=True)

    api.dataset_download_files(
        dataset_ref,
        path=base_dir,
        unzip=True
    )

    return base_dir
def find_csv_files(root_dir):
    csv_files = []

    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".csv"):
                csv_files.append(os.path.join(root, file))

    if not csv_files:
        raise RuntimeError("No CSV files found")

    return csv_files
import pandas as pd

def detect_target_from_s3(s3_path: str, task: str):
    """
    Try to infer target column using simple EDA rules
    """
    df = pd.read_csv(s3_path)

    # Common target names (priority)
    COMMON_TARGETS = [
        "target", "label", "class", "outcome",
        "y", "response", "result"
    ]

    for col in df.columns:
        if col.lower() in COMMON_TARGETS:
            return col

    # Heuristic rules
    if task == "classification":
        for col in df.columns:
            if df[col].dtype == "object" or df[col].nunique() < 20:
                return col

    if task == "regression":
        for col in df.columns[::-1]:  # often last column
            if df[col].dtype != "object":
                return col

    return None
