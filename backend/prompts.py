def build_prompt(algorithm, ctx):
    columns = "\n".join(
        [f"- {c} ({ctx['dtypes'][c]})" for c in ctx["columns"]]
    )

    base = f"""
You are an expert machine learning engineer.

Generate a COMPLETE, RUNNABLE Python training script using scikit-learn.

Dataset details:
- Dataset path: {ctx['dataset_path']}
- Target column: {ctx['target']}
- ML task: {ctx['task']}  # classification or regression

Dataset columns:
{columns}

Mandatory requirements:
- Read the dataset from the given path using pandas
- Separate features (X) and target (y)
- Perform train-test split (80/20) with random_state=42
- Handle missing values appropriately
- Encode categorical features correctly
- Scale features when required
- Train the specified model
- Evaluate the model using appropriate metrics
- Print evaluation metrics to stdout
- Ensure code runs without user interaction
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
