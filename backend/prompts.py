def build_prompt(algorithm, ctx):
    columns = "\n".join(
        [f"- {c} ({ctx['dtypes'][c]})" for c in ctx["columns"]]
    )

    base = f"""
You are an expert machine learning engineer.

Generate a COMPLETE, RUNNABLE Python training script using scikit-learn for execution in a SageMaker container.

Dataset details:
- Local filename in '/opt/ml/input/data/train/': {ctx['filename']}
- Target column: {ctx['target']}
- ML task: {ctx['task']}  # classification or regression

Dataset columns:
{columns}

Mandatory requirements:
- Use standard SageMaker paths:
  - Input: '/opt/ml/input/data/train/{ctx['filename']}'
  - Output: '/opt/ml/output/data/output.json'
- Read the dataset using pandas from the local SageMaker input path
- Separate features (X) and target (y)
- Perform train-test split (80/20) with random_state=42
- Handle missing values appropriately
- Encode categorical features correctly
- Scale features when required
- Train the specified model
- Evaluate the model using appropriate metrics
- Format results into this EXACT JSON structure based on task:
  # If task is classification:
  {{"accuracy": 0.85, "classes": [{{"name": "class0", "precision": 0.8, "recall": 0.9, "f1": 0.85}}]}}
  # (NOTE: Use `class_metrics["f1-score"]` when extracting from sklearn classification_report, but output it as "f1" in the JSON)
  # If task is regression:
  {{"r2_score": 0.85, "mean_squared_error": 0.05, "mean_absolute_error": 0.02}}
- Print the JSON to stdout for logging
- Save the JSON locally to the SageMaker output path: '/opt/ml/output/data/output.json'
- IMPORTANT: Use `import boto3` and `boto3.client('s3')` to explicitly upload the JSON string to S3 bucket '{ctx['bucket']}' at the fixed key 'datasets/output/output.json'. Use `json.dumps(results_json)` for the Body.
- Ensure the code runs without user interaction
- Use only standard Python ML libraries
- DO NOT include explanations, comments, or markdown
- OUTPUT ONLY VALID PYTHON CODE
"""

    if algorithm == "random_forest":
        return base + """
Model to use:
- RandomForestClassifier
- n_estimators=100
- random_state=42

Evaluation:
- Print accuracy score
- Print classification report
"""

    if algorithm == "linear_regression":
        return base + """
Model to use:
- LinearRegression

Evaluation:
- Print R2 score
- Print Mean Squared Error
"""

    if algorithm == "ols":
        return base + """
Model to use:
- statsmodels OLS
- Add intercept explicitly

Evaluation:
- Print full regression summary
"""

    if algorithm == "mlp":
        return base + """
Model to use:
- MLPClassifier
- hidden_layer_sizes=(100,)
- max_iter=300
- early_stopping=True
- random_state=42

Evaluation:
- Print accuracy score
- Print classification report
"""

    if algorithm == "xgboost":
        return base + """
Model to use:
- XGBoost classifier (xgboost.XGBClassifier)
- eval_metric='logloss'
- use_label_encoder=False
- random_state=42

Evaluation:
- Print accuracy score
"""
