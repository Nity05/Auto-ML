import sagemaker
from sagemaker.estimator import Estimator
from sagemaker.image_uris import retrieve
import uuid

ROLE = "arn:aws:iam::008458900897:role/service-role/AmazonSageMakerAdminIAMExecutionRole"
BUCKET = "automl-datasets-nithish-001"
REGION = "eu-north-1"

session = sagemaker.Session()

# 🔹 Let AWS resolve the correct sklearn image
image_uri = retrieve(
    framework="sklearn",
    region=REGION,
    version="1.2-1",
    py_version="py3",
    instance_type="ml.m5.large"
)

job_name = f"core-sm-{uuid.uuid4().hex[:6]}"
print("Starting job:", job_name)
print("Using image:", image_uri)

estimator = Estimator(
    image_uri=image_uri,
    role=ROLE,
    instance_count=1,
    instance_type="ml.m5.large",
    volume_size=30,
    max_run=600,
    output_path=f"s3://{BUCKET}/datasets/output/",
    sagemaker_session=session
)

estimator.fit(
    inputs={
        "train": f"s3://{BUCKET}/datasets/uploaded/"
    },
    job_name=job_name
)
