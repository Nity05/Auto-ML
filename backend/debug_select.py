import requests
import json

url = "http://127.0.0.1:8000/datasets/select"
payload = {
    "task": "classification",
    "target": "Species",
    "ds": {
        "ref": "uciml/iris",
        "name": "Iris Dataset"
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    try:
        print(f"JSON Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Raw Text: {response.text}")
except Exception as e:
    print(f"Connection Error: {e}")
