from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime, timedelta
import os
import random
import string

load_dotenv()

STATIC_FOLDER   = os.path.join(os.path.dirname(__file__), "../app/dist")
UPLOAD_FOLDER   = os.path.join(os.path.dirname(__file__), "uploads")
CERTS_FOLDER    = os.path.join(os.path.dirname(__file__), "uploads/certificates")
PROJECTS_FOLDER = os.path.join(os.path.dirname(__file__), "uploads/projects")
ALLOWED_EXT     = {"png", "jpg", "jpeg", "gif", "webp"}

for d in [UPLOAD_FOLDER, CERTS_FOLDER, PROJECTS_FOLDER]:
    os.makedirs(d, exist_ok=True)

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path="/")
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# ─── MySQL Config ─────────────────────────────────────────────────────────────
app.config["MYSQL_HOST"]     = os.getenv("MYSQL_HOST", "localhost")
app.config["MYSQL_USER"]     = os.getenv("MYSQL_USER", "root")
app.config["MYSQL_PASSWORD"] = os.getenv("MYSQL_PASSWORD", "")
app.config["MYSQL_DB"]       = os.getenv("MYSQL_DB", "portfolio_db")
app.config["MYSQL_CURSORCLASS"] = "DictCursor"

mysql = MySQL(app)

# ─── Mail Config ──────────────────────────────────────────────────────────────
app.config["MAIL_SERVER"]         = "smtp.gmail.com"
app.config["MAIL_PORT"]           = 587
app.config["MAIL_USE_TLS"]        = True
app.config["MAIL_USE_SSL"]        = False
app.config["MAIL_USERNAME"]       = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"]       = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = (os.getenv("MAIL_USERNAME"), "Ryan Bien Portfolio")

mail = Mail(app)
CORS(app)

# ─── JWT Config ───────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret-key")
jwt = JWTManager(app)

# ─── Register Mobile API Blueprint ───────────────────────────────────────────
from mobile_api import mobile_api
app.register_blueprint(mobile_api)

# ─── Register Admin Features Blueprint ───────────────────────────────────────
from admin_features import admin_features
app.register_blueprint(admin_features)

# ─── Register Content API Blueprint ──────────────────────────────────────────
from content_api import content_api
app.register_blueprint(content_api)

# In-memory OTP store: { email: { code, expires } }
otp_store = {}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def get_profile_picture_path():
    for ext in ALLOWED_EXT:
        p = os.path.join(UPLOAD_FOLDER, f"profile.{ext}")
        if os.path.exists(p):
            return f"profile.{ext}"
    return None

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated

# ─── Admin: Auth ──────────────────────────────────────────────────────────────

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("admin_logged_in"):
        return redirect(url_for("admin_dashboard"))
    error = None
    if request.method == "POST":
        email    = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        if email == os.getenv("ADMIN_EMAIL") and password == os.getenv("ADMIN_PASSWORD"):
            session["admin_logged_in"] = True
            return redirect(url_for("admin_dashboard"))
        error = "Invalid email or password."
    return render_template("admin/login.html", error=error)

@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))

# ─── Admin: Forgot Password ───────────────────────────────────────────────────

@app.route("/admin/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        if email != os.getenv("ADMIN_EMAIL"):
            flash("Email not found.", "error")
            return redirect(url_for("forgot_password"))

        # Generate 6-digit OTP
        code    = "".join(random.choices(string.digits, k=6))
        expires = datetime.now() + timedelta(minutes=5)

        # Save to DB (delete old ones first)
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM otp_codes WHERE email = %s", (email,))
        cur.execute(
            "INSERT INTO otp_codes (email, code, expires_at) VALUES (%s, %s, %s)",
            (email, code, expires)
        )
        mysql.connection.commit()
        cur.close()

        session["reset_email"] = email
        session["otp_display"] = code

        # Send OTP via email
        try:
            msg = Message(
                subject="Portfolio Admin — Your Verification Code",
                recipients=[email]
            )
            msg.html = f"""
            <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;
                        background:#fff5f7;border-radius:16px;border:1px solid #fce7f3;">
              <h2 style="color:#ec4899;margin-bottom:8px;">Password Reset</h2>
              <p style="color:#6b7280;margin-bottom:16px;">Your verification code is:</p>
              <div style="font-size:42px;font-weight:bold;letter-spacing:14px;color:#ec4899;
                          text-align:center;padding:24px;background:white;
                          border-radius:12px;margin:16px 0;border:2px solid #fce7f3;">
                {code}
              </div>
              <p style="color:#9ca3af;font-size:13px;">
                This code expires in <strong>5 minutes</strong>.<br/>
                If you did not request this, ignore this email.
              </p>
            </div>
            """
            mail.send(msg)
            flash("Verification code sent to your email!", "success")
        except Exception as e:
            # Fallback: show code on screen if email fails
            flash(f"Email failed ({str(e)[:60]}). Use the code shown below.", "error")

        return redirect(url_for("verify_code"))

    return render_template("admin/forgot_password.html")


@app.route("/admin/verify-code", methods=["GET", "POST"])
def verify_code():
    email = session.get("reset_email")
    if not email:
        return redirect(url_for("forgot_password"))

    if request.method == "POST":
        entered = request.form.get("code", "").strip()

        cur = mysql.connection.cursor()
        cur.execute(
            "SELECT * FROM otp_codes WHERE email = %s ORDER BY created_at DESC LIMIT 1",
            (email,)
        )
        record = cur.fetchone()
        cur.close()

        if not record:
            flash("No code found. Please request a new one.", "error")
            return redirect(url_for("forgot_password"))

        if datetime.now() > record["expires_at"]:
            flash("Code expired. Please request a new one.", "error")
            return redirect(url_for("forgot_password"))

        if entered != record["code"]:
            flash("Incorrect code. Try again.", "error")
            return redirect(url_for("verify_code"))

        # Code correct — delete it
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM otp_codes WHERE email = %s", (email,))
        mysql.connection.commit()
        cur.close()

        session.pop("otp_display", None)
        session["reset_verified"] = True
        return redirect(url_for("reset_password"))

    # Pass OTP to template so admin can see it
    otp_display = session.get("otp_display")
    return render_template("admin/verify_code.html", otp_display=otp_display)


@app.route("/admin/reset-password", methods=["GET", "POST"])
def reset_password():
    if not session.get("reset_verified"):
        return redirect(url_for("forgot_password"))

    if request.method == "POST":
        new_pass = request.form.get("password", "").strip()
        confirm  = request.form.get("confirm", "").strip()

        if not new_pass or len(new_pass) < 6:
            flash("Password must be at least 6 characters.", "error")
            return redirect(url_for("reset_password"))

        if new_pass != confirm:
            flash("Passwords do not match.", "error")
            return redirect(url_for("reset_password"))

        # Update .env file
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "r") as f:
            lines = f.readlines()
        with open(env_path, "w") as f:
            for line in lines:
                if line.startswith("ADMIN_PASSWORD="):
                    f.write(f"ADMIN_PASSWORD={new_pass}\n")
                else:
                    f.write(line)

        os.environ["ADMIN_PASSWORD"] = new_pass
        session.pop("reset_email", None)
        session.pop("reset_verified", None)
        flash("Password changed successfully! Please log in.", "success")
        return redirect(url_for("admin_login"))

    return render_template("admin/reset_password.html")

# ─── Admin: Reply to message ──────────────────────────────────────────────────

@app.route("/admin/reply", methods=["POST"])
@login_required
def admin_reply():
    data       = request.get_json()
    to         = data.get("to", "").strip()
    subject    = data.get("subject", "Re: Your message to Ryan Bien").strip()
    body       = data.get("body", "").strip()
    message_id = data.get("message_id")

    if not to or not body:
        return jsonify({"success": False, "error": "Missing recipient or message."}), 400

    # Save reply to DB
    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO replies (message_id, body) VALUES (%s, %s)",
            (message_id, body)
        )
        mysql.connection.commit()
        cur.close()
    except Exception as e:
        return jsonify({"success": False, "error": f"DB error: {str(e)}"}), 500

    # Send email
    try:
        msg = Message(subject=subject, recipients=[to])
        msg.html = f"""
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;
                    background:#fff5f7;border-radius:16px;border:1px solid #fce7f3;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <div style="width:44px;height:44px;border-radius:12px;
                        background:linear-gradient(135deg,#f472b6,#a78bfa);
                        display:flex;align-items:center;justify-content:center;">
              <span style="color:white;font-weight:bold;font-size:18px;">R</span>
            </div>
            <div>
              <p style="margin:0;font-weight:bold;color:#1f2937;">Ryan Bien N. Barilla</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">Full-Stack Developer</p>
            </div>
          </div>
          <div style="background:white;border-radius:12px;padding:24px;
                      border:1px solid #fce7f3;margin-bottom:16px;">
            <p style="color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;">{body}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
            Sent via Ryan Bien Portfolio · ryanbarilla16@gmail.com
          </p>
        </div>
        """
        mail.send(msg)
        return jsonify({"success": True, "reply": {"body": body, "created_at": datetime.now().strftime("%b %d, %Y %I:%M %p")}})
    except Exception as e:
        # Email failed but reply was saved to DB
        return jsonify({
            "success": True,
            "email_error": str(e),
            "reply": {"body": body, "created_at": datetime.now().strftime("%b %d, %Y %I:%M %p")}
        })

# ─── Admin: Dashboard ─────────────────────────────────────────────────────────

@app.route("/admin")
@app.route("/admin/dashboard")
@login_required
def admin_dashboard():
    import json
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
    messages = cur.fetchall()
    cur.execute("SELECT COUNT(*) as count FROM certificates")
    cert_count = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM projects")
    proj_count = cur.fetchone()["count"]

    # Messages per day (last 7 days)
    cur.execute("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM messages
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY day ASC
    """)
    daily_data = cur.fetchall()

    # Messages by hour
    cur.execute("""
        SELECT HOUR(created_at) as hour, COUNT(*) as count
        FROM messages
        GROUP BY HOUR(created_at)
        ORDER BY hour ASC
    """)
    hourly_data = cur.fetchall()

    # Top senders
    cur.execute("""
        SELECT name, COUNT(*) as count
        FROM messages
        GROUP BY name
        ORDER BY count DESC
        LIMIT 5
    """)
    top_senders = cur.fetchall()
    cur.close()

    daily_labels = [str(r["day"]) for r in daily_data]
    daily_counts = [r["count"] for r in daily_data]
    hourly_labels = [f"{r['hour']}:00" for r in hourly_data]
    hourly_counts = [r["count"] for r in hourly_data]
    sender_labels = [r["name"] for r in top_senders]
    sender_counts = [r["count"] for r in top_senders]

    return render_template("admin/dashboard.html",
                           messages=messages,
                           message_count=len(messages),
                           cert_count=cert_count,
                           proj_count=proj_count,
                           daily_labels=json.dumps(daily_labels),
                           daily_counts=json.dumps(daily_counts),
                           hourly_labels=json.dumps(hourly_labels),
                           hourly_counts=json.dumps(hourly_counts),
                           sender_labels=json.dumps(sender_labels),
                           sender_counts=json.dumps(sender_counts))

# ─── Admin: Messages ──────────────────────────────────────────────────────────

@app.route("/admin/messages")
@login_required
def admin_messages():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
    messages = cur.fetchall()
    # Fetch replies for each message
    for msg in messages:
        cur.execute("SELECT * FROM replies WHERE message_id = %s ORDER BY created_at ASC", (msg["id"],))
        msg["replies"] = cur.fetchall()
    cur.close()
    return render_template("admin/messages.html", messages=messages)

@app.route("/admin/messages/delete/<int:msg_id>")
@login_required
def delete_message(msg_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    mysql.connection.commit()
    cur.close()
    flash("Message deleted.", "success")
    return redirect(url_for("admin_messages"))

# ─── Admin: Profile Picture ───────────────────────────────────────────────────

@app.route("/admin/profile", methods=["GET", "POST"])
@login_required
def admin_profile():
    if request.method == "POST":
        file = request.files.get("picture")
        if not file or file.filename == "":
            flash("No file selected.", "error")
            return redirect(url_for("admin_profile"))
        if not allowed_file(file.filename):
            flash("Invalid file type.", "error")
            return redirect(url_for("admin_profile"))
        for ext in ALLOWED_EXT:
            old = os.path.join(UPLOAD_FOLDER, f"profile.{ext}")
            if os.path.exists(old):
                os.remove(old)
        ext = file.filename.rsplit(".", 1)[1].lower()
        file.save(os.path.join(UPLOAD_FOLDER, f"profile.{ext}"))
        flash("Profile picture updated!", "success")
        return redirect(url_for("admin_profile"))
    return render_template("admin/profile.html", current_pic=get_profile_picture_path())

# ─── Admin: Certificates ──────────────────────────────────────────────────────

@app.route("/admin/certificates", methods=["GET", "POST"])
@login_required
def admin_certificates():
    if request.method == "POST":
        file = request.files.get("image")
        if not file or file.filename == "":
            flash("Please select an image.", "error")
            return redirect(url_for("admin_certificates"))
        if not allowed_file(file.filename):
            flash("Invalid file type.", "error")
            return redirect(url_for("admin_certificates"))

        # Get next ID
        cur = mysql.connection.cursor()
        cur.execute("SELECT MAX(id) as max_id FROM certificates")
        row = cur.fetchone()
        new_id = (row["max_id"] or 0) + 1

        ext   = file.filename.rsplit(".", 1)[1].lower()
        fname = f"cert_{new_id}.{ext}"
        file.save(os.path.join(CERTS_FOLDER, fname))

        image_url = f"/api/certificates/image/{fname}"
        cur.execute("INSERT INTO certificates (image_url) VALUES (%s)", (image_url,))
        mysql.connection.commit()
        cur.close()

        flash("Certificate uploaded!", "success")
        return redirect(url_for("admin_certificates"))

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM certificates ORDER BY created_at DESC")
    certs = cur.fetchall()
    cur.close()
    return render_template("admin/certificates.html", certificates=certs)

@app.route("/admin/certificates/delete/<int:cert_id>")
@login_required
def delete_certificate(cert_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT image_url FROM certificates WHERE id = %s", (cert_id,))
    cert = cur.fetchone()
    if cert:
        fname    = cert["image_url"].split("/")[-1]
        img_path = os.path.join(CERTS_FOLDER, fname)
        if os.path.exists(img_path):
            os.remove(img_path)
        cur.execute("DELETE FROM certificates WHERE id = %s", (cert_id,))
        mysql.connection.commit()
        flash("Certificate deleted.", "success")
    cur.close()
    return redirect(url_for("admin_certificates"))

# ─── Admin: Projects ──────────────────────────────────────────────────────────

@app.route("/admin/projects", methods=["GET", "POST"])
@login_required
def admin_projects():
    if request.method == "POST":
        title       = request.form.get("title", "").strip()
        category    = request.form.get("category", "").strip()
        description = request.form.get("description", "").strip()
        tags        = request.form.get("tags", "").strip()
        live_url    = request.form.get("live_url", "").strip()
        github_url  = request.form.get("github_url", "").strip()
        featured    = 1 if request.form.get("featured") else 0

        if not title or not category or not description:
            flash("Title, category, and description are required.", "error")
            return redirect(url_for("admin_projects"))

        image_url = None
        file = request.files.get("image")
        if file and file.filename and allowed_file(file.filename):
            cur = mysql.connection.cursor()
            cur.execute("SELECT MAX(id) as max_id FROM projects")
            row = cur.fetchone()
            cur.close()
            new_id = (row["max_id"] or 0) + 1
            ext      = file.filename.rsplit(".", 1)[1].lower()
            fname    = f"project_{new_id}.{ext}"
            file.save(os.path.join(PROJECTS_FOLDER, fname))
            image_url = f"/api/projects/image/{fname}"

        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO projects (title, category, description, image_url, tags, live_url, github_url, featured) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (title, category, description, image_url, tags, live_url, github_url, featured)
        )
        mysql.connection.commit()
        cur.close()
        flash("Project added!", "success")
        return redirect(url_for("admin_projects"))
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC")
    projects = cur.fetchall()
    cur.close()
    return render_template("admin/projects.html", projects=projects)


@app.route("/admin/projects/delete/<int:project_id>")
@login_required
def delete_project(project_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT image_url FROM projects WHERE id = %s", (project_id,))
    proj = cur.fetchone()
    if proj and proj["image_url"]:
        fname    = proj["image_url"].split("/")[-1]
        img_path = os.path.join(PROJECTS_FOLDER, fname)
        if os.path.exists(img_path):
            os.remove(img_path)
    cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))
    mysql.connection.commit()
    cur.close()
    flash("Project deleted.", "success")
    return redirect(url_for("admin_projects"))

# ─── API: Real-time messages poll ─────────────────────────────────────────────

@app.route("/api/messages/poll")
@login_required
def poll_messages():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
    messages = cur.fetchall()
    cur.close()
    # Convert datetime to string for JSON
    for m in messages:
        if isinstance(m.get("created_at"), datetime):
            m["created_at"] = m["created_at"].strftime("%b %d, %Y %I:%M %p")
    return jsonify({"messages": messages, "count": len(messages)})

# ─── API: Contact form ────────────────────────────────────────────────────────

@app.route("/api/contact", methods=["POST"])
def contact():
    data    = request.get_json()
    name    = data.get("name", "").strip()
    email   = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "All fields are required."}), 400

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO messages (name, email, message) VALUES (%s, %s, %s)",
        (name, email, message)
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"success": True, "message": "Message received!"}), 200

# ─── API: Profile picture ─────────────────────────────────────────────────────

@app.route("/api/profile-picture")
def profile_picture():
    pic = get_profile_picture_path()
    if pic:
        return send_from_directory(UPLOAD_FOLDER, pic)
    return redirect("https://i.postimg.cc/154GgL5f/74d02ed8-3d2d-4bd1-b4fe-46789b39ed5d.jpg")

# ─── API: Certificates ────────────────────────────────────────────────────────

@app.route("/api/certificates")
def api_certificates():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM certificates ORDER BY created_at ASC")
    certs = cur.fetchall()
    cur.close()
    for c in certs:
        if isinstance(c.get("created_at"), datetime):
            c["created_at"] = c["created_at"].strftime("%b %d, %Y")
    return jsonify(certs)

@app.route("/api/certificates/image/<filename>")
def cert_image(filename):
    return send_from_directory(CERTS_FOLDER, filename)

# ─── API: Projects ────────────────────────────────────────────────────────────

@app.route("/api/projects")
def api_projects():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC")
    projects = cur.fetchall()
    cur.close()
    for p in projects:
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].strftime("%b %d, %Y")
        if p.get("tags"):
            p["tags_list"] = [t.strip() for t in p["tags"].split(",")]
        else:
            p["tags_list"] = []
    return jsonify(projects)

@app.route("/api/projects/image/<filename>")
def project_image(filename):
    return send_from_directory(PROJECTS_FOLDER, filename)

# ─── Serve React ──────────────────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path.startswith("admin") or path.startswith("api"):
        return jsonify({"error": "Not found"}), 404
    full_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
