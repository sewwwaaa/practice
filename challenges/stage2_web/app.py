import jwt
import os
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)
SECRET_KEY = os.environ.get("JWT_WEAK_SECRET", "secret123")

FLAG_STAGE_2 = "AegisBreach{jwt_s3cr3t_n0n3_4lg0_byp4ss}"

HOME_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Apex Digital Financials — Staging Gateway</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
        .card { background: #1e293b; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; }
        h1 { color: #38bdf8; }
        code { background: #090d16; padding: 3px 6px; border-radius: 4px; color: #a5f3fc; }
        .alert { background: #451a03; border: 1px solid #78350f; color: #fef3c7; padding: 12px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Apex Digital Financials</h1>
        <p><strong>System:</strong> Internal Developer Staging API v1.4</p>
        <div class="alert">
            WARNING: Staging authentication is undergoing migration to JSON Web Tokens (JWT). Unrestricted public registration is currently active.
        </div>
        <p>Available endpoints:</p>
        <ul>
            <li><code>POST /api/v1/auth/login</code> - Authenticate and obtain JWT token</li>
            <li><code>POST /api/v1/auth/register</code> - Create a new user account</li>
            <li><code>GET /api/v1/profile</code> - View current user permissions</li>
            <li><code>GET /api/v1/audit/system-logs</code> - Restricted to <code>role: admin</code></li>
        </ul>
    </div>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HOME_HTML)

@app.route("/api/v1/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or request.form
    username = data.get("username", "guest")
    
    # Vulnerable token generation: signed with weak key 'secret123'
    payload = {
        "user": username,
        "role": "user",
        "iss": "apex-staging-auth"
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token, "message": "Authentication successful"})

@app.route("/api/v1/audit/system-logs", methods=["GET"])
def audit_logs():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header. Expected: Bearer <token>"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        # VULNERABILITY 1: Allows algorithm 'none'
        # VULNERABILITY 2: Weak HMAC key 'secret123' easily brute-forced
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        
        if alg.lower() == "none":
            decoded = jwt.decode(token, options={"verify_signature": False})
        else:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256", "HS384", "HS512"])
            
        if decoded.get("role") == "admin":
            return jsonify({
                "status": "success",
                "flag": FLAG_STAGE_2,
                "incident_report": {
                    "alert": "Anomalous external DNS beaconing detected from internal host 172.20.0.15",
                    "pcap_download_artifact": "http://staging.apex.internal:8080/static/suspicious_traffic.pcapng",
                    "investigator_note": "Threat actor utilized DNS queries to exfiltrate database configuration."
                }
            })
        else:
            return jsonify({"error": "Forbidden: Requires role 'admin'. Current role: " + str(decoded.get("role"))}), 403
            
    except Exception as e:
        return jsonify({"error": "Invalid token", "detail": str(e)}), 400

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "apex-web-stage2"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
