# import boto3

# sm = boto3.client("sagemaker", region_name="eu-north-1")

# jobs = sm.list_training_jobs(
#     SortBy="CreationTime",
#     SortOrder="Descending",
#     MaxResults=5
# )

# for j in jobs["TrainingJobSummaries"]:
#     print(j["TrainingJobName"], j["TrainingJobStatus"])
# job = sm.describe_training_job(
#     TrainingJobName="automl-d7dfa2"

# )

# print("Status:", job["TrainingJobStatus"])
# print("FailureReason:", job.get("FailureReason"))
import boto3

sm = boto3.client("sagemaker", region_name="eu-north-1")
print(sm.describe_training_job(TrainingJobName="automl-d7dfa2"))
