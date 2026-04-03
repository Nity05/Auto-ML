import os

if __name__ == "__main__":
    print("🔥 SageMaker training started 🔥")

    output_dir = "/opt/ml/model"
    os.makedirs(output_dir, exist_ok=True)

    with open(os.path.join(output_dir, "done.txt"), "w") as f:
        f.write("Training ran successfully")

    print("✅ Model artifact written")
