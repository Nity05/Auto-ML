from fastapi import FastAPI
from models import Questionnaire, DatasetSelection
from kaggle_service import search_kaggle
from dataset_manager import download_kaggle_dataset, find_csv_files
from models import resolve_algorithm
from prompts import build_prompt
from gemini_service import generate_code, analyze_results
from s3_upload import upload_data_folder_to_s3, create_context, upload_data_code, upload_dataset_context
from cloudwatch_service import fetch_logs, get_latest_training_job
import os
import boto3
import json

app = FastAPI()
s3 = boto3.client("s3")

def generate_training_code(preferred_algorithm, dataset_context):
        algo = resolve_algorithm(
            preferred_algorithm,
            dataset_context["task"],
            dataset_context
        )

        prompt = build_prompt(algo, dataset_context)
        code = generate_code(prompt)
        print("Generated Code:")
        print(code)
        
        # Write the generated code to the local run directory
        run_dir = "runs/run_001"
        os.makedirs(run_dir, exist_ok=True)
        with open(os.path.join(run_dir, "train.py"), "w") as f:
            f.write(code)
            
        return {
            "algorithm_used": algo,
            "code": code
        }    
@app.post("/datasets/select")
def select_dataset(payload: dict):
    try:
        print(payload)
        task = payload.get("task")
        if not task:
            raise ValueError("Task not provided by frontend")

        user_target = payload.get("target")

        # Clear old results from S3 before starting new training
        try:
            bucket = os.getenv("S3_BUCKET")
            if bucket:
                s3.delete_object(Bucket=bucket, Key="datasets/output/output.json")
                print("Cleared old results from S3")
                import time
                time.sleep(2) # Ensure S3 propagation
        except Exception as e:
            print(f"No old results to clear: {e}")

        # Download from Kaggle to "data" folder
        download_kaggle_dataset(payload.get("ds").get("ref"))

        # Find the local CSV to read its structure
        local_files = find_csv_files("data")
        if not local_files:
            raise FileNotFoundError("No CSV files found in downloaded dataset")
        local_csv_path = local_files[0]

        # upload to S3 for remote training
        s3_paths = upload_data_folder_to_s3(
            bucket=os.getenv("S3_BUCKET"),
            prefix="datasets/uploaded"
        )
        s3_path = s3_paths[0]

        # Create context using local file for analysis
        dataset_context = create_context(
            local_path=local_csv_path,
            s3_path=s3_path,
            task=task,
            user_target=user_target,
            bucket=os.getenv("S3_BUCKET")
        )

        # 1. Generate Training Code
        code_results = generate_training_code("auto", dataset_context)
        
        # 2. Create requirements.txt
        run_dir = "runs/run_001"
        os.makedirs(run_dir, exist_ok=True)
        with open(os.path.join(run_dir, "requirements.txt"), "w") as f:
            f.write("pandas\nscikit-learn\njoblib\ns3fs\n")
            
        # 3. Final Step: Bundle and Upload
        code_s3_paths = upload_data_code(
            bucket=os.getenv("S3_BUCKET"),
            prefix="datasets/code",
            data_dir=run_dir
        )
        code_s3_path = code_s3_paths[0]

        # 4. EXTREMELY IMPORTANT: SageMaker Job is now triggered by S3 Upload (Lambda)
        # No manual call to launch_sagemaker_job is needed here.
        # The frontend will poll for the latest job automatically.

        return {
            "status": "success",
            "task": task,
            "target": dataset_context["target"],
            "target_source": dataset_context["target_source"],
            "generated_code": code_results["code"],
            "code_path": code_s3_path
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/training/status")
def training_status(job_name: str = None):
    """
    Returns the latest training logs for the current job.
    """
    if not job_name:
        job_name = get_latest_training_job()
    
    if not job_name:
        return {"status": "no_job", "logs": []}
    
    log_messages, _, _ = fetch_logs(job_name)
    
    return {
        "status": "running",
        "job_name": job_name,
        "logs": log_messages
    }



@app.post("/datasets/search")
def dataset_search(q: Questionnaire):
    search_query = f"{q.domain} {q.task}"

    kaggle_results = search_kaggle(search_query)

    ranked = []
    for ds in kaggle_results:
        # usability = round(ds["kaggle_usability"] * 10, 2)

        ranked.append({
            "name": ds["name"],
            "ref": ds["ref"],
            "source": "Kaggle",
            "url": f"https://www.kaggle.com/{ds['ref']}",
            "usability": ds["kaggle_usability"],
            "votes": ds["votes"],
            "downloads": ds["downloads"],
            "desc": ds["subtitle"],
            "dc": ds["description"]
        })

    ranked.sort(key=lambda x: x["usability"], reverse=True)
    return ranked[:5]
    
@app.get("/results")
def get_results():
    """
    Fetches the latest training results from S3.
    """
    bucket = os.getenv("S3_BUCKET")
    key = "datasets/output/output.json"
    print(f"DEBUG: Fetching from S3 bucket={bucket}, key={key}")
    
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        data = json.loads(obj['Body'].read())
        print(f"DEBUG: Successfully fetched JSON data: {data}")
        return data
    except Exception as e:
        print(f"DEBUG: Error fetching S3: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.post("/training/analysis")
def training_analysis(payload: dict):
    """
    Analyzes the training results using Gemini.
    """
    metrics = payload.get("metrics")
    task = payload.get("task", "classification")
    
    if not metrics:
        return {"status": "error", "message": "No metrics provided"}
        
    try:
        analysis = analyze_results(metrics, task)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        return {"status": "error", "message": str(e)}
