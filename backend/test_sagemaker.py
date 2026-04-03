import boto3
import uuid

sm = boto3.client("sagemaker", region_name="eu-north-1")

ROLE_ARN = "arn:aws:iam::008458900897:role/SageMakerExecutionRole-AutoML"
BUCKET = "automl-datasets-nithish-001"

# ✅ OFFICIAL AWS SKLEARN IMAGE
IMAGE_URI = (
    "662702820516.dkr.ecr.eu-north-1.amazonaws.com/"
    "sagemaker-scikit-learn:1.2-1-cpu-py3"
)

job_name = f"sklearn-test-{uuid.uuid4().hex[:6]}"
print("Starting job:", job_name)

sm.create_training_job(
    TrainingJobName=job_name,
    RoleArn=ROLE_ARN,

    AlgorithmSpecification={
        "TrainingImage": IMAGE_URI,
        "TrainingInputMode": "File"
    },

    InputDataConfig=[{
        "ChannelName": "train",
        "DataSource": {
            "S3DataSource": {
                "S3DataType": "S3Prefix",
                "S3Uri": f"s3://{BUCKET}/datasets/uploaded/",
                "S3DataDistributionType": "FullyReplicated"
            }
        }
    }],

    OutputDataConfig={
        "S3OutputPath": f"s3://{BUCKET}/datasets/output/"
    },

    ResourceConfig={
        "InstanceType": "ml.m5.large",
        "InstanceCount": 1,
        "VolumeSizeInGB": 30
    },

    StoppingCondition={
        "MaxRuntimeInSeconds": 1800
    },

    HyperParameters={
        # train.py must be inside source.tar.gz
        "sagemaker_program": "train.py",

        # tar.gz with train.py + requirements.txt
        "sagemaker_submit_directory":
            f"s3://{BUCKET}/datasets/code/source.tar.gz"
    }
)

print("Training job submitted!")
