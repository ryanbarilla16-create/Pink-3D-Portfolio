from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_mysqldb import MySQL
from datetime import datetime, timedelta
import os

mobile_api = Blueprint("mobile_api", __name__, url_prefix="/mobile")

# ─── Auth ─────────────────────────────────────────────────────────────────────

@mobile_api.route("/login", methods=["POST"])
def mobile_login():
    data     = request.get_json()
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if email == os.getenv("ADMIN_EMAIL") and password == os.getenv("ADMIN_PASSWORD"):
        token = create_access_token(identity=email, expires_delta=timedelta(days=7))
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "name": "Ryan Bien N. Barilla",
                "email": email,
                "role": "admin"
            }
        })
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

# ─── Messages ─────────────────────────────────────────────────────────────────

@mobile_api.route("/messages", methods=["GET"])
@jwt_required()
def get_messages():
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
    messages = cur.fetchall()
    for m in messages:
        if isinstance(m.get("created_at"), datetime):
            m["created_at"] = m["created_at"].strftime("%b %d, %Y %I:%M %p")
    cur.close()
    return jsonify({"messages": messages, "count": len(messages)})


@mobile_api.route("/messages/<int:msg_id>", methods=["DELETE"])
@jwt_required()
def delete_message(msg_id):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


@mobile_api.route("/messages/<int:msg_id>/reply", methods=["POST"])
@jwt_required()
def reply_message(msg_id):
    from app import mysql, mail
    from flask_mail import Message as MailMessage

    data    = request.get_json()
    to      = data.get("to", "").strip()
    subject = data.get("subject", "Re: Your message to Ryan Bien").strip()
    body    = data.get("body", "").strip()

    if not to or not body:
        return jsonify({"success": False, "error": "Missing fields"}), 400

    # Save reply to DB
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO replies (message_id, body) VALUES (%s, %s)", (msg_id, body))
    mysql.connection.commit()
    cur.close()

    # Send email
    try:
        msg = MailMessage(subject=subject, recipients=[to])
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
          <div style="background:white;border-radius:12px;padding:24px;border:1px solid #fce7f3;">
            <p style="color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;">{body}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">
            Sent via Ryan Bien Portfolio
          </p>
        </div>
        """
        mail.send(msg)
        return jsonify({"success": True, "email_sent": True})
    except Exception as e:
        return jsonify({"success": True, "email_sent": False, "email_error": str(e)})

# ─── Stats ────────────────────────────────────────────────────────────────────

@mobile_api.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT COUNT(*) as count FROM messages")
    msg_count = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM certificates")
    cert_count = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM projects")
    proj_count = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURDATE()")
    today_count = cur.fetchone()["count"]
    cur.close()
    return jsonify({
        "messages": msg_count,
        "certificates": cert_count,
        "projects": proj_count,
        "messages_today": today_count
    })
