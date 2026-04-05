import os
import pandas as pd
import numpy as np
import json
import boto3

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

import xgboost as xgb

input_path = '/opt/ml/input/data/train/healthcare_dataset.csv'
output_dir = '/opt/ml/output/data/'
output_file_path = os.path.join(output_dir, 'output.json')

s3_bucket = 'automl-datasets-nithish-001'
s3_key = 'datasets/output/output.json'

os.makedirs(output_dir, exist_ok=True)

df = pd.read_csv(input_path)

target_column = 'Gender'
X = df.drop(columns=[target_column])
y = df[target_column]

le = LabelEncoder()
y_encoded = le.fit_transform(y)
class_names = le.classes_

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

columns_to_drop = ['Name', 'Date of Admission', 'Doctor', 'Hospital', 'Discharge Date']
X_train = X_train.drop(columns=columns_to_drop, errors='ignore')
X_test = X_test.drop(columns=columns_to_drop, errors='ignore')

numerical_features = X_train.select_dtypes(include=np.number).columns.tolist()
categorical_features = X_train.select_dtypes(include='object').columns.tolist()

numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ])

xgb_classifier = xgb.XGBClassifier(
    eval_metric='logloss',
    use_label_encoder=False,
    random_state=42
)

pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('classifier', xgb_classifier)])

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy}")

report = classification_report(y_test, y_pred, output_dict=True, target_names=class_names)

class_metrics_list = []
for i, class_name in enumerate(class_names):
    class_report_data = report[class_name]
    class_metrics_list.append({
        "name": class_name,
        "precision": class_report_data["precision"],
        "recall": class_report_data["recall"],
        "f1": class_report_data["f1-score"]
    })

results_json = {
    "accuracy": accuracy,
    "classes": class_metrics_list
}

results_json_string = json.dumps(results_json)

print(results_json_string)

with open(output_file_path, 'w') as f:
    f.write(results_json_string)

s3 = boto3.client('s3')
s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=results_json_string)