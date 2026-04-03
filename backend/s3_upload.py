import boto3
import os
import json
import tarfile
import shutil
from dataset_manager import detect_target_from_s3

s3 = boto3.client("s3")

def upload_data_folder_to_s3(bucket, prefix, data_dir="data"):
    """
    Uploads all CSV files from data/ folder and subfolders to S3
    """
    if not os.path.exists(data_dir):
        raise RuntimeError("data/ folder not found")

    s3_paths = []

    for root, _, files in os.walk(data_dir):
        for file in files:
            if file.endswith(".csv"):
                local_path = os.path.join(root, file)
                
                # Keep the folder structure when uploading to S3
                rel_path = os.path.relpath(local_path, data_dir)
                s3_key = f"{prefix}/{rel_path.replace(os.sep, '/')}"

                print(f"Uploading {local_path} to s3://{bucket}/{s3_key}")
                s3.upload_file(local_path, bucket, s3_key)
                s3_paths.append(f"s3://{bucket}/{s3_key}")

    if not s3_paths:
        raise RuntimeError(f"No CSV files found in {data_dir}")

    return s3_paths
def upload_data_code(bucket, prefix, data_dir="runs/run_001"):
    """
    Creates source.tar.gz using tarfile.open with explicit GNU_FORMAT for SageMaker.
    Includes a local magic-byte verification check.
    """
    if not os.path.exists(data_dir):
        raise RuntimeError(f"{data_dir} folder not found")

    tar_path = "source.tar.gz"
    print(f"Creating {tar_path} bundle (GNU_FORMAT)...")
    
    with tarfile.open(tar_path, "w:gz", format=tarfile.GNU_FORMAT) as tar:
        for root, _, files in os.walk(data_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, data_dir)
                tar.add(full_path, arcname=rel_path)

    # Magic-byte verification
    with open(tar_path, "rb") as f:
        header = f.read(2)
        if header != b"\x1f\x8b":
            raise RuntimeError(f"GZIP header verification FAILED: found {header.hex()}")
    print("GZIP header verified: 1f 8b")

    s3_key_tar = f"{prefix}/source.tar.gz"
    print(f"Uploading bundle to s3://{bucket}/{s3_key_tar}")
    
    try:
        s3.upload_file(tar_path, bucket, s3_key_tar)
        return [f"s3://{bucket}/{s3_key_tar}"]
    finally:
        if os.path.exists(tar_path):
            os.remove(tar_path)
import pandas as pd

def create_context(s3_path: str, task: str, user_target: str | None):
    df = pd.read_csv(s3_path)

    detected_target = detect_target_from_s3(s3_path, task)

    target = detected_target if detected_target else user_target

    if not target:
        raise ValueError("Target column could not be determined")

    if target not in df.columns:
        raise ValueError(f"Target column '{target}' not found in dataset")

    context = {
        "dataset_path": s3_path,
        "task": task,
        "rows": len(df),
        "columns": df.columns.tolist(),
        "dtypes": {},
        "numeric_features": [],
        "categorical_features": [],
        "missing_values": {},
        "target": target,
        "target_source": "auto" if detected_target else "user"
    }

    for col in df.columns:
        dtype = str(df[col].dtype)
        context["dtypes"][col] = dtype
        context["missing_values"][col] = int(df[col].isna().sum())

        if "int" in dtype or "float" in dtype:
            context["numeric_features"].append(col)
        else:
            context["categorical_features"].append(col)

    return context

def upload_dataset_context(bucket, prefix, context):
    """
    Saves context dictionary as JSON and uploads to S3
    """
    local_path = "context.json"
    with open(local_path, "w") as f:
        json.dump(context, f, indent=4)
    
    s3_key = f"{prefix}/context.json"
    s3.upload_file(local_path, bucket, s3_key)
    
    return f"s3://{bucket}/{s3_key}"
