"""
Test Contact Form API on Live Preview Deployment
Tests validation, honeypot, timing, and database insertion into staging.
"""

import subprocess
import json
import time

PREVIEW_URL = "https://prof-i3mytmlab-s3fpls-projects.vercel.app"

def curl_contact(payload):
    data_str = json.dumps(payload)
    cmd = [
        "npx.cmd", "vercel", "curl", "/api/contact",
        "--deployment", PREVIEW_URL,
        "--",
        "-s", "-w", "\n%{http_code}",
        "-H", "Content-Type: application/json",
        "-d", data_str
    ]
    res = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)
    lines = res.strip().splitlines()
    code = int(lines[-1]) if lines else 0
    body = "\n".join(lines[:-1]) if len(lines) > 1 else ""
    return code, body

print("--- 1. Testing Invalid Email Validation ---")
code, body = curl_contact({
    "name": "Test User",
    "email": "not-an-email",
    "message": "Hello staging portfolio",
    "company": "",
    "startedAt": int(time.time() * 1000) - 5000,
})
print(f"Status: {code}, Body: {body}")

print("\n--- 2. Testing Honeypot Rejection ---")
code, body = curl_contact({
    "name": "Bot User",
    "email": "bot@example.com",
    "message": "Spam message",
    "company": "Spam Corp",
    "startedAt": int(time.time() * 1000) - 5000,
})
print(f"Status: {code}, Body: {body}")

print("\n--- 3. Testing Timing (Too Fast) Rejection ---")
code, body = curl_contact({
    "name": "Fast User",
    "email": "fast@example.com",
    "message": "Submitted in 100ms",
    "company": "",
    "startedAt": int(time.time() * 1000) - 100,
})
print(f"Status: {code}, Body: {body}")

print("\n--- 4. Testing Valid Synthetic Contact Submission (Inserts into Staging DB) ---")
code, body = curl_contact({
    "name": "Staging Tester",
    "email": "tester@staging-test.internal",
    "message": "This is a synthetic test message submitted to Preview.",
    "company": "",
    "startedAt": int(time.time() * 1000) - 6000,
})
print(f"Status: {code}, Body: {body}")

