import os
import boto3
from s3_upload import upload_data_code
from dotenv import load_dotenv

load_dotenv()

def debug_trigger():
    bucket = os.getenv("S3_BUCKET")
    region = os.getenv("AWS_REGION")
    
    print(f"🔍 DEBUG: Target Bucket: {bucket}")
    print(f"🔍 DEBUG: Region: {region}")

    # Prepare dummy run folder
    run_dir = "runs/run_001"
    os.makedirs(run_dir, exist_ok=True)
    with open(os.path.join(run_dir, "train.py"), "w") as f:
        f.write("print('Hello SageMaker')\n")
    with open(os.path.join(run_dir, "requirements.txt"), "w") as f:
        f.write("pandas\n")

    print("\n🚀 Starting Upload...")
    try:
        s3_paths = upload_data_code(
            bucket=bucket,
            prefix="datasets/code",
            data_dir=run_dir
        )
        print(f"\n✅ UPLOAD SUCCESSFUL: {s3_paths}")
        print("\n📢 NEXT STEP: Check your AWS Lambda 'Monitor' tab for a new execution.")
        print("   If no execution appears, check your S3 Trigger prefix/suffix settings.")
        
    except Exception as e:
        print(f"\n❌ UPLOAD FAILED: {str(e)}")

if __name__ == "__main__":
    debug_trigger()
