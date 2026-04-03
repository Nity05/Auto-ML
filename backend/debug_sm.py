
import boto3
import uuid
import os

def run_debug_job():
    region = "eu-north-1"
    sm = boto3.client("sagemaker", region_name=region)
    
    # Use the Admin role found in .env and sm_local/run_sm.py
    role_arn = "arn:aws:iam::008458900897:role/service-role/AmazonSageMakerAdminIAMExecutionRole"
    
    # Use the same bucket as in env (hardcoded for debug)
    bucket = "automl-datasets-nithish-001"
    
    job_name = f"debug-sm-{uuid.uuid4().hex[:8]}"
    print(f"Attempting to create job: {job_name}")

    # using the Image URI from sagemaker_runner.py
    image_uri = "966458181534.dkr.ecr.eu-north-1.amazonaws.com/sagemaker-scikit-learn:1.2-1-cpu-py3"
    
    print(f"Using Image URI: {image_uri}")
    print(f"Using Role ARN: {role_arn}")

    try:
        response = sm.create_training_job(
            TrainingJobName=job_name,
            AlgorithmSpecification={
                "TrainingImage": image_uri,
                "TrainingInputMode": "File"
            },
            RoleArn=role_arn,
            InputDataConfig=[
                {
                    "ChannelName": "train",
                    "DataSource": {
                        "S3DataSource": {
                            "S3DataType": "S3Prefix",
                            "S3Uri": f"s3://{bucket}/datasets/uploaded/",
                            "S3DataDistributionType": "FullyReplicated"
                        }
                    }
                }
            ],
            OutputDataConfig={
                "S3OutputPath": f"s3://{bucket}/datasets/output/"
            },
            ResourceConfig={
                "InstanceType": "ml.m5.large",
                "InstanceCount": 1,
                "VolumeSizeInGB": 30
            },
            StoppingCondition={
                "MaxRuntimeInSeconds": 3600
            },
            HyperParameters={
                "sagemaker_program": "train.py",
                "sagemaker_submit_directory": f"s3://{bucket}/datasets/code/"
            }
        )
        print("Success! Job ARN:", response["TrainingJobArn"])
    except Exception as e:
        print("Failed to create training job.")
        print(e)

if __name__ == "__main__":
    run_debug_job()
