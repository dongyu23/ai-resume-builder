import os
import requests
import time
import json

API_KEY = "sk-PCV43uGsNiwy_a4W2CnpCQ"
BASE_URL = "https://llmapi.paratera.com/v1/chat/completions"
MODEL = "DeepSeek-V3.2"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say 'hello world' and give me 1 reason why testing APIs directly is better than through a frontend proxy."}
    ],
    "temperature": 0.3
}

print(f"Testing direct connection to Paratera API...")
print(f"URL: {BASE_URL}")
print(f"Model: {MODEL}")
print("-" * 50)

start_time = time.time()
try:
    response = requests.post(BASE_URL, headers=headers, json=data, timeout=60)
    elapsed = time.time() - start_time
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Elapsed Time: {elapsed:.2f} seconds")
    
    if response.status_code == 200:
        print("Success! Response body:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print("Error Response:")
        print(response.text)
except requests.exceptions.Timeout:
    elapsed = time.time() - start_time
    print(f"REQUEST TIMED OUT after {elapsed:.2f} seconds")
except Exception as e:
    print(f"EXCEPTION OCCURRED: {str(e)}")
