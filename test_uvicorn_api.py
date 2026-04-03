import requests
import json
import time

URL = "http://127.0.0.1:8000/api/ai/optimize"

data = {
    "job_description": "We need a senior frontend engineer with React and Node.js skills.",
    "files": [
        {
            "path": "main.tex",
            "content": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
        }
    ],
    "model": "DeepSeek-V3.2",
    "language": "zh-CN"
}

print("Testing direct connection to Uvicorn Backend (port 8000)...")
start_time = time.time()
try:
    # 180 seconds timeout matching our updated frontend/backend config
    response = requests.post(URL, json=data, timeout=180.0)
    elapsed = time.time() - start_time
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Elapsed Time: {elapsed:.2f} seconds")
    
    if response.status_code == 200:
        print("Success! Response JSON:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print("Error Response:")
        print(response.text)
except requests.exceptions.Timeout:
    elapsed = time.time() - start_time
    print(f"REQUEST TIMED OUT at Backend Level after {elapsed:.2f} seconds")
except Exception as e:
    print(f"EXCEPTION OCCURRED: {str(e)}")