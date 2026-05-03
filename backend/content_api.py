"""
Content management blueprint:
- Skills CRUD
- Hero/About content via profile_info
- All homepage API endpoints
"""
from flask import Blueprint, request, render_template, redirect, url_for, session, flash, jsonify
from functools import wraps
from datetime import datetime

content_api = Blueprint("content_api", __name__)

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

# ─── Admin: Skills ────────────────────────────────────────────────────────────

@content_api.route("/admin/skills", methods=["GET", "POST"])
@login_required
def admin_skills():
    from app import mysql
    if request.method == "POST":
        category   = request.form.get("category", "").strip()
        skill_name = request.form.get("skill_name", "").strip()
        level      = int(request.form.get("level", 80))
        if category and skill_name:
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO skills (category, skill_name, level) VALUES (%s, %s, %s)",
                        (category, skill_name, level))
            mysql.connection.commit()
            cur.close()
            log_activity(mysql, f"Added skill: {skill_name}")
            flash("Skill added!", "success")
        return redirect(url_for("content_api.admin_skills"))

    from app import mysql as m
    cur = m.connection.cursor()
    cur.execute("SELECT * FROM skills ORDER BY category, sort_order, id")
    skills = cur.fetchall()
    cur.close()

    # Group by category
    grouped = {}
    for s in skills:
        cat = s["category"]
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(s)

    return render_template("admin/skills.html", grouped=grouped, skills=skills)


@content_api.route("/admin/skills/delete/<int:skill_id>")
@login_required
def delete_skill(skill_id):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM skills WHERE id = %s", (skill_id,))
    mysql.connection.commit()
    cur.close()
    log_activity(mysql, f"Deleted skill ID: {skill_id}")
    flash("Skill deleted.", "success")
    return redirect(url_for("content_api.admin_skills"))


@content_api.route("/admin/skills/edit/<int:skill_id>", methods=["POST"])
@login_required
def edit_skill(skill_id):
    from app import mysql
    level = int(request.form.get("level", 80))
    cur = mysql.connection.cursor()
    cur.execute("UPDATE skills SET level = %s WHERE id = %s", (level, skill_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})

# ─── Admin: Hero Content ──────────────────────────────────────────────────────

@content_api.route("/admin/hero", methods=["GET", "POST"])
@login_required
def admin_hero():
    from app import mysql
    if request.method == "POST":
        fields = ["hero_name", "hero_subtitle", "hero_tagline",
                  "hero_description", "hero_stat1_value", "hero_stat1_label",
                  "hero_stat2_value", "hero_stat2_label", "hero_badge"]
        cur = mysql.connection.cursor()
        for field in fields:
            value = request.form.get(field, "").strip()
            cur.execute(
                "INSERT INTO profile_info (field_key, field_value) VALUES (%s, %s) "
                "ON DUPLICATE KEY UPDATE field_value = %s",
                (field, value, value)
            )
        mysql.connection.commit()
        cur.close()
        log_activity(mysql, "Updated hero section content")
        flash("Hero section updated!", "success")
        return redirect(url_for("content_api.admin_hero"))

    from app import mysql as m
    cur = m.connection.cursor()
    cur.execute("SELECT field_key, field_value FROM profile_info")
    rows = cur.fetchall()
    cur.close()
    profile = {r["field_key"]: r["field_value"] for r in rows}
    return render_template("admin/hero_content.html", profile=profile)

# ─── API: Skills ──────────────────────────────────────────────────────────────

@content_api.route("/api/skills")
def api_skills():
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM skills ORDER BY category, sort_order, id")
    skills = cur.fetchall()
    cur.close()

    grouped = {}
    for s in skills:
        cat = s["category"]
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append({"id": s["id"], "name": s["skill_name"], "level": s["level"]})

    return jsonify(grouped)
