import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def main():
    print("===== TRAINING STARTED =====")

    # SageMaker mounts training data here
    data_dir = "/opt/ml/input/data/train"
    print("Looking for data in:", data_dir)

    files = os.listdir(data_dir)
    print("Files found:", files)

    if not files:
        raise RuntimeError("❌ No files found in training directory")

    # Use your same file name
    file_name = "loan_sanction_test.csv"
    data_path = os.path.join(data_dir, file_name)

    if not os.path.exists(data_path):
        raise RuntimeError(f"❌ Dataset not found: {data_path}")

    print("Using dataset:", data_path)

    # Load dataset
    df = pd.read_csv(data_path)
    print("Dataset shape:", df.shape)

    # Use LAST column as target to avoid mismatch
    target_column = df.columns[-1]
    print("Target column:", target_column)

    X = df.drop(columns=[target_column])
    y = df[target_column]

    # Identify feature types
    numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_features = X.select_dtypes(include=["object"]).columns.tolist()

    print("Numeric features:", numeric_features)
    print("Categorical features:", categorical_features)

    # Preprocessing
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ]
    )

    # Model
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=50,
            random_state=42,
            n_jobs=-1
        ))
    ])

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training model...")
    model.fit(X_train, y_train)

    # Evaluate
    print("Evaluating...")
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print("Accuracy:", acc)

    # Save model
    model_dir = "/opt/ml/model"
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "model.joblib")
    joblib.dump(model, model_path)

    print("Model saved to:", model_path)
    print("===== TRAINING COMPLETED SUCCESSFULLY =====")

if __name__ == "__main__":
    main()
