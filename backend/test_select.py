import requests
import json

url = "http://127.0.0.1:8000/datasets/select"
payload = {
    "task": "classification",
    "target": "target",
    "ds": {
        "ref": "uciml/iris",
        "name": "Iris Dataset"
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
