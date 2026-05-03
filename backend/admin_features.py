"""
Admin features blueprint:
- Profile info (edit name, bio, social links, resume)
- Edit project
- Activity log
"""
from flask import Blueprint, request, render_template, redirect, url_for, session, flash, send_from_directory
from functools import wraps
from datetime import datetime
import os

admin_features = Blueprint("admin_features", __name__)

PROJECTS_FOLDER = os.path.join(os.path.dirname(__file__), "uploads/projects")
RESUME_FOLDER   = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXT     = {"png", "jpg", "jpeg", "gif", "webp"}
RESUME_EXT      = {"pdf"}

os.makedirs(PROJECTS_FOLDER, exist_ok=True)
os.makedirs(RESUME_FOLDER, exist_ok=True)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated

def log_activity(mysql, action, details=""):
    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO activity_log (action, details) VALUES (%s, %s)", (action, details))
        mysql.connection.commit()
        cur.close()
    except Exception:
        pass

def get_profile(mysql):
    cur = mysql.connection.cursor()
    cur.execute("SELECT field_key, field_value FROM profile_info")
    rows = cur.fetchall()
    cur.close()
    return {r["field_key"]: r["field_value"] for r in rows}

# ─── Profile Info ─────────────────────────────────────────────────────────────

@admin_features.route("/admin/profile-info", methods=["GET", "POST"])
@login_required
def admin_profile_info():
    from app import mysql
    if request.method == "POST":
        fields = ["name", "title", "bio", "email", "phone", "location",
                  "github", "linkedin", "instagram", "twitter"]
        cur = mysql.connection.cursor()
        for field in fields:
            value = request.form.get(field, "").strip()
            cur.execute(
                "INSERT INTO profile_info (field_key, field_value) VALUES (%s, %s) "
                "ON DUPLICATE KEY UPDATE field_value = %s",
                (field, value, value)
            )

        # Handle resume upload
        resume = request.files.get("resume")
        if resume and resume.filename.lower().endswith(".pdf"):
            resume_path = os.path.join(RESUME_FOLDER, "resume.pdf")
            resume.save(resume_path)
            cur.execute(
                "INSERT INTO profile_info (field_key, field_value) VALUES (%s, %s) "
                "ON DUPLICATE KEY UPDATE field_value = %s",
                ("resume_url", "/api/resume", "/api/resume")
            )

        mysql.connection.commit()
        cur.close()
        log_activity(mysql, "Updated profile info")
        flash("Profile info updated!", "success")
        return redirect(url_for("admin_features.admin_profile_info"))

    profile = get_profile(mysql)
    return render_template("admin/profile_info.html", profile=profile)

# ─── Edit Project ─────────────────────────────────────────────────────────────

@admin_features.route("/admin/projects/edit/<int:project_id>", methods=["GET", "POST"])
@login_required
def edit_project(project_id):
    from app import mysql
    if request.method == "POST":
        title       = request.form.get("title", "").strip()
        category    = request.form.get("category", "").strip()
        description = request.form.get("description", "").strip()
        tags        = request.form.get("tags", "").strip()
        live_url    = request.form.get("live_url", "").strip()
        github_url  = request.form.get("github_url", "").strip()
        featured    = 1 if request.form.get("featured") else 0

        cur = mysql.connection.cursor()

        # Handle new image upload
        file = request.files.get("image")
        if file and file.filename:
            ext = file.filename.rsplit(".", 1)[-1].lower()
            if ext in ALLOWED_EXT:
                # Delete old image
                cur.execute("SELECT image_url FROM projects WHERE id = %s", (project_id,))
                old = cur.fetchone()
                if old and old["image_url"]:
                    old_path = os.path.join(PROJECTS_FOLDER, old["image_url"].split("/")[-1])
                    if os.path.exists(old_path):
                        os.remove(old_path)
                fname = f"project_{project_id}.{ext}"
                file.save(os.path.join(PROJECTS_FOLDER, fname))
                image_url = f"/api/projects/image/{fname}"
                cur.execute(
                    "UPDATE projects SET title=%s, category=%s, description=%s, tags=%s, "
                    "live_url=%s, github_url=%s, featured=%s, image_url=%s WHERE id=%s",
                    (title, category, description, tags, live_url, github_url, featured, image_url, project_id)
                )
            else:
                cur.execute(
                    "UPDATE projects SET title=%s, category=%s, description=%s, tags=%s, "
                    "live_url=%s, github_url=%s, featured=%s WHERE id=%s",
                    (title, category, description, tags, live_url, github_url, featured, project_id)
                )
        else:
            cur.execute(
                "UPDATE projects SET title=%s, category=%s, description=%s, tags=%s, "
                "live_url=%s, github_url=%s, featured=%s WHERE id=%s",
                (title, category, description, tags, live_url, github_url, featured, project_id)
            )

        mysql.connection.commit()
        cur.close()
        log_activity(mysql, f"Edited project: {title}")
        flash("Project updated!", "success")
        return redirect(url_for("admin_projects"))

    from app import mysql as m
    cur = m.connection.cursor()
    cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    project = cur.fetchone()
    cur.close()
    if not project:
        flash("Project not found.", "error")
        return redirect(url_for("admin_projects"))
    return render_template("admin/edit_project.html", project=project)

# ─── Activity Log ─────────────────────────────────────────────────────────────

@admin_features.route("/admin/activity")
@login_required
def admin_activity():
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100")
    logs = cur.fetchall()
    cur.close()
    return render_template("admin/activity.html", logs=logs)

# ─── API: Profile Info ────────────────────────────────────────────────────────

@admin_features.route("/api/profile")
def api_profile():
    from app import mysql
    profile = get_profile(mysql)
    return __import__("flask").jsonify(profile)

# ─── API: Resume Download ─────────────────────────────────────────────────────

@admin_features.route("/api/resume")
def api_resume():
    resume_path = os.path.join(RESUME_FOLDER, "resume.pdf")
    if os.path.exists(resume_path):
        return send_from_directory(RESUME_FOLDER, "resume.pdf",
                                   as_attachment=True,
                                   download_name="Ryan_Bien_Barilla_Resume.pdf")
    return __import__("flask").jsonify({"error": "Resume not uploaded yet"}), 404
