import boto3
import os
from dotenv import load_dotenv

load_dotenv()
REGION = os.getenv("AWS_REGION", "eu-north-1")
logs_client = boto3.client("logs", region_name=REGION)
LOG_GROUP = "/aws/sagemaker/TrainingJobs"

def get_full_logs(job_name):
    print(f"Searching for all streams for job: {job_name}")
    try:
        streams = logs_client.describe_log_streams(
            logGroupName=LOG_GROUP,
            logStreamNamePrefix=job_name
        ).get('logStreams', [])
        
        if not streams:
            print(f"No streams found for {job_name}")
            return

        with open("final_logs.txt", "w", encoding="utf-8") as f:
            for stream in streams:
                f.write(f"--- Stream: {stream['logStreamName']} ---\n")
                events = logs_client.get_log_events(
                    logGroupName=LOG_GROUP,
                    logStreamName=stream['logStreamName'],
                    startFromHead=True
                ).get('events', [])
                for event in events:
                    safe_msg = event['message'].strip().encode('ascii', errors='replace').decode('ascii')
                    f.write(safe_msg + "\n")
        print("Logs successfully written to final_logs.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    from cloudwatch_service import get_latest_training_job
    job = get_latest_training_job()
    if job:
        get_full_logs(job)
    else:
        print("No job found")
