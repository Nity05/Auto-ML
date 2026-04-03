import boto3
import os
from dotenv import load_dotenv

load_dotenv()

REGION = os.getenv("AWS_REGION", "eu-north-1")
BUCKET = os.getenv("S3_BUCKET", "automl-datasets-nithish-001")

s3 = boto3.client("s3", region_name=REGION)

def test_s3_connection():
    test_file = "test_connection.txt"
    with open(test_file, "w") as f:
        f.write("AWS S3 Connection Test Successful!")
    
    s3_key = "test_connection/test_connection.txt"
    
    print(f"Attempting to upload to bucket: {BUCKET}...")
    try:
        s3.upload_file(test_file, BUCKET, s3_key)
        print("✅ SUCCESS: File uploaded to S3.")
        
        # Verify by listing
        print("Listing test folder...")
        response = s3.list_objects_v2(Bucket=BUCKET, Prefix="test_connection/")
        if 'Contents' in response:
            for obj in response['Contents']:
                print(f"Found in S3: {obj['Key']}")
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    test_s3_connection()
