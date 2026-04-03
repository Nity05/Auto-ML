import boto3
import time
import os
from dotenv import load_dotenv

load_dotenv()

REGION = os.getenv("AWS_REGION", "eu-north-1")
logs_client = boto3.client("logs", region_name=REGION)
sm_client = boto3.client("sagemaker", region_name=REGION)

LOG_GROUP = "/aws/sagemaker/TrainingJobs"

def get_latest_training_job():
    """
    Finds the most recent SageMaker training job.
    """
    response = sm_client.list_training_jobs(
        SortBy="CreationTime",
        SortOrder="Descending",
        MaxResults=1
    )
    
    if not response["TrainingJobSummaries"]:
        return None
    
    return response["TrainingJobSummaries"][0]["TrainingJobName"]

def fetch_logs(job_name, stream_name="algo-1", start_time=0):
    """
    Fetches logs from CloudWatch for a specific job and stream.
    """
    log_stream_name = f"{job_name}/{stream_name}"
    
    try:
        response = logs_client.get_log_events(
            logGroupName=LOG_GROUP,
            logStreamName=log_stream_name,
            startTime=start_time,
            startFromHead=True
        )
        
        events = response.get("events", [])
        next_token = response.get("nextForwardToken")
        
        log_messages = [e["message"].strip() for e in events]
        last_timestamp = events[-1]["timestamp"] if events else start_time
        
        return log_messages, last_timestamp, next_token
    except logs_client.exceptions.ResourceNotFoundException:
        return [f"Waiting for logs for {job_name}..."], start_time, None
    except Exception as e:
        return [f"Error fetching logs: {str(e)}"], start_time, None
