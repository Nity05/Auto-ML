import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

DATA_PATH = "s3://automl-datasets-nithish-001/datasets/uploaded/data.csv"
TARGET_COLUMN = "Company"

df = pd.read_csv(DATA_PATH)

df['Date'] = pd.to_datetime(df['Date'])
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day
df['DayOfWeek'] = df['Date'].dt.dayofweek
df = df.drop('Date', axis=1)

def clean_numeric_string(s):
    if isinstance(s, str):
        s = s.replace('$', '').replace(',', '')
    return pd.to_numeric(s, errors='coerce')

df['Close/Last'] = df['Close/Last'].apply(clean_numeric_string)
df['Open'] = df['Open'].apply(clean_numeric_string)
df['High'] = df['High'].apply(clean_numeric_string)
df['Low'] = df['Low'].apply(clean_numeric_string)

X = df.drop(TARGET_COLUMN, axis=1)
y = df[TARGET_COLUMN]

numerical_features = X.select_dtypes(include=np.number).columns.tolist()

numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler())
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features)
    ],
    remainder='passthrough'
)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

print(f"Accuracy: {accuracy}")
print("Classification Report:")
print(report)