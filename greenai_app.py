import os
import json
import random
import smtplib
from threading import Lock
from datetime import datetime
import pytz
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///greenai.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'greenai-secret-key')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =====================================================================
# Database Models
# =====================================================================

class UserDetails(db.Model):
    __tablename__ = 'userdetails'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=True)
    mobile = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    crops = db.Column(db.String(255), nullable=False)
    land_size = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'mobile': self.mobile,
            'language': self.language,
            'location': self.location,
            'crops': self.crops,
            'land_size': self.land_size
        }


class Active(db.Model):
    __tablename__ = 'active'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), nullable=False)

    def __init__(self, email):
        self.email = email

    def __repr__(self):
        return f'<Active {self.email}>'


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)

    def __init__(self, name, message):
        self.name = name
        self.message = message
        self.timestamp = datetime.now(pytz.UTC).strftime('%Y-%m-%d %H:%M:%S')

    def to_dict(self):
        if isinstance(self.timestamp, str):
            ts = self.timestamp
        elif self.timestamp is not None:
            ts = self.timestamp.isoformat()
        else:
            ts = datetime.now(pytz.UTC).isoformat()
        return {
            'id': self.id,
            'name': self.name,
            'message': self.message,
            'timestamp': ts
        }


class Reminder(db.Model):
    __tablename__ = 'reminders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    reminder_type = db.Column(db.String(100), nullable=False)
    crop_type = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    interval_type = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'reminder_type': self.reminder_type,
            'crop_type': self.crop_type,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time.strftime('%H:%M') if self.time else None,
            'interval_type': self.interval_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# =====================================================================
# Authentication & User Management Endpoints
# =====================================================================

otp_storage = {}
otp_lock = Lock()
EMAIL_ADDRESS = os.environ.get('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587


def generate_otp():
    return str(random.randint(100000, 999999))


def send_email(to_email, otp):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print(f"[OTP DEV MODE] Verification OTP for {to_email}: {otp}")
        return True
    subject = "Your One-Time OTP Code for Verification"
    email_body = f"""Subject: {subject}

Hi there,

Thank you for choosing to verify your account with us.
Your OTP code: {otp}

This code is valid for 10 minutes.

Best regards,
GREENAI Team
"""
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, to_email, email_body)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


@app.route("/send_otp", methods=["POST"])
def send_otp():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        otp = generate_otp()
        with otp_lock:
            otp_storage[email] = otp

        if send_email(email, otp):
            return jsonify({"status": "success", "message": "OTP sent successfully"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to send OTP"}), 500
    except Exception as e:
        print(f"Error in send_otp: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route("/verify_otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        user_otp = data.get("otp")

        if not email or not user_otp:
            return jsonify({"status": "error", "message": "Email and OTP are required"}), 400

        with otp_lock:
            stored_otp = otp_storage.get(email)
            if stored_otp and stored_otp == user_otp:
                del otp_storage[email]
                existing_active = Active.query.filter_by(email=email).first()
                if not existing_active:
                    new_active = Active(email=email)
                    db.session.add(new_active)
                    db.session.commit()
                return jsonify({"status": "success", "message": "OTP verified successfully"}), 200
            else:
                return jsonify({"status": "error", "message": "Invalid OTP"}), 401
    except Exception as e:
        print(f"Error in verify_otp: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route('/userdetails', methods=['POST'])
def add_userdetails():
    try:
        data = request.get_json() or {}
        raw_password = data.get('password')
        password_hash = generate_password_hash(raw_password) if raw_password else None

        user = UserDetails(
            name=data.get('name'),
            email=data.get('email'),
            password=password_hash,
            mobile=data.get('mobile'),
            language=data.get('language'),
            location=data.get('location'),
            crops=data.get('crops'),
            land_size=data.get('land_size')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User details added', 'id': user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error adding user: {str(e)}'}), 400


@app.route("/check_email", methods=["POST"])
def check_email():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        user = UserDetails.query.filter_by(email=email).first()
        if not user:
            return jsonify({"status": "error", "message": "Email not registered"}), 404

        if password is not None and user.password:
            if not check_password_hash(user.password, password):
                return jsonify({"status": "error", "message": "Incorrect password"}), 401

        return jsonify({"status": "success", "message": "Login successful", "name": user.name}), 200
    except Exception as e:
        print(f"Error in check_email: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route("/add_active", methods=["POST"])
def add_active():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        existing_active = Active.query.filter_by(email=email).first()
        if existing_active:
            return jsonify({"status": "error", "message": "Email already active"}), 409

        new_active = Active(email=email)
        db.session.add(new_active)
        db.session.commit()
        return jsonify({"status": "success", "message": "Email added to active successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_active: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route('/get_active_user_details', methods=['GET'])
def get_active_user_details():
    try:
        req_email = request.args.get('email')
        if req_email:
            user = UserDetails.query.filter_by(email=req_email).first()
        else:
            active_user = Active.query.order_by(Active.id.desc()).first()
            if not active_user:
                return jsonify({'status': 'error', 'message': 'No active user found'}), 404
            user = UserDetails.query.filter_by(email=active_user.email).first()

        if not user:
            return jsonify({'status': 'error', 'message': 'User details not found'}), 404

        user_data = user.to_dict()
        return jsonify({
            'status': 'success',
            'data': user_data,
            'user': user_data,
            'message': 'User details retrieved successfully'
        }), 200
    except Exception as e:
        print(f"Error fetching user details: {e}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@app.route("/get_current_user", methods=["GET"])
def get_current_user():
    return get_active_user_details()


@app.route('/update_user_profile', methods=['PUT'])
def update_user_profile():
    try:
        data = request.get_json() or {}
        req_email = data.get('target_email') or request.args.get('email')

        if req_email:
            user = UserDetails.query.filter_by(email=req_email).first()
            active_user = Active.query.filter_by(email=req_email).first()
        else:
            active_user = Active.query.order_by(Active.id.desc()).first()
            if not active_user:
                return jsonify({'status': 'error', 'message': 'No active user found'}), 401
            user = UserDetails.query.filter_by(email=active_user.email).first()

        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        if 'name' in data and data['name']:
            user.name = data['name']
        if 'email' in data and data['email']:
            user.email = data['email']
            if active_user:
                active_user.email = data['email']
        if 'mobile' in data and data['mobile']:
            user.mobile = data['mobile']
        if 'language' in data and data['language']:
            user.language = data['language']
        if 'location' in data and data['location']:
            user.location = data['location']
        if 'crops' in data and data['crops']:
            user.crops = data['crops']
        if 'land_size' in data and data['land_size']:
            user.land_size = data['land_size']

        db.session.commit()
        return jsonify({
            'status': 'success',
            'data': user.to_dict(),
            'message': 'Profile updated successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating user profile: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update profile'}), 500


# =====================================================================
# Community Chat Endpoints
# =====================================================================

@app.route("/send_message", methods=["POST"])
def send_message():
    try:
        data = request.get_json() or {}
        name = data.get("name")
        message = data.get("message")
        if not name or not message:
            return jsonify({"status": "error", "message": "Name and message are required"}), 400

        new_message = ChatMessage(name=name, message=message)
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Message sent successfully",
            "data": new_message.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in send_message: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route("/get_messages", methods=["GET"])
def get_messages():
    try:
        messages = ChatMessage.query.order_by(ChatMessage.timestamp.asc()).all()
        return jsonify({
            "status": "success",
            "messages": [m.to_dict() for m in messages]
        }), 200
    except Exception as e:
        print(f"Error in get_messages: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


# =====================================================================
# Reminder Schedule Endpoints
# =====================================================================

@app.route('/api/reminders', methods=['POST'])
def create_reminder():
    try:
        data = request.get_json() or {}
        reminder_date = datetime.strptime(data['date'], '%d/%m/%Y').date()
        reminder_time = datetime.strptime(data['time'], '%H:%M').time()

        reminder = Reminder(
            reminder_type=data['reminder_type'],
            crop_type=data['crop_type'],
            date=reminder_date,
            time=reminder_time,
            interval_type=data['interval_type'],
            user_id=data.get('user_id', 1)
        )
        db.session.add(reminder)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Reminder created successfully',
            'reminder': reminder.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error creating reminder: {str(e)}'}), 400


@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    try:
        user_id = request.args.get('user_id', 1)
        reminders = Reminder.query.filter_by(
            user_id=user_id,
            is_active=True
        ).order_by(Reminder.date.asc(), Reminder.time.asc()).all()

        return jsonify({
            'success': True,
            'reminders': [r.to_dict() for r in reminders]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching reminders: {str(e)}'}), 400


@app.route('/api/reminders/<int:reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    try:
        reminder = Reminder.query.get_or_404(reminder_id)
        reminder.is_active = False
        db.session.commit()
        return jsonify({'success': True, 'message': 'Reminder deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error deleting reminder: {str(e)}'}), 400


@app.route('/api/reminders/<int:reminder_id>', methods=['PUT'])
def update_reminder(reminder_id):
    try:
        reminder = Reminder.query.get_or_404(reminder_id)
        data = request.get_json() or {}

        if 'reminder_type' in data:
            reminder.reminder_type = data['reminder_type']
        if 'crop_type' in data:
            reminder.crop_type = data['crop_type']
        if 'date' in data:
            reminder.date = datetime.strptime(data['date'], '%d/%m/%Y').date()
        if 'time' in data:
            reminder.time = datetime.strptime(data['time'], '%H:%M').time()
        if 'interval_type' in data:
            reminder.interval_type = data['interval_type']

        reminder.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Reminder updated successfully',
            'reminder': reminder.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating reminder: {str(e)}'}), 400


# =====================================================================
# Google Gemini AI Assistant & Crop Doctor
# =====================================================================

def _call_gemini_generate(contents, system_instruction=None, json_mode=False):
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        return None
    models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash']
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            payload = {'contents': contents}
            if system_instruction:
                payload['systemInstruction'] = {'parts': [{'text': system_instruction}]}
            if json_mode:
                payload['generationConfig'] = {'response_mime_type': 'application/json'}

            res = requests.post(url, json=payload, timeout=25)
            if res.status_code == 200:
                data = res.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            elif res.status_code in (404, 503):
                continue
            else:
                print(f"Gemini API status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Gemini error with {model}: {e}")
            continue
    return None


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        message = data.get('message', '')
        image_base64 = data.get('image_base64')

        gemini_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_key:
            return jsonify({'success': False, 'message': 'GEMINI_API_KEY is not configured in .env'}), 500

        parts = []
        if message:
            parts.append({'text': message})
        else:
            parts.append({'text': "Analyze this crop leaf photo for diseases, pest damage, and give practical remedies."})

        if image_base64:
            clean_b64 = image_base64
            mime = "image/jpeg"
            if "base64," in clean_b64:
                header, clean_b64 = clean_b64.split("base64,", 1)
                if "image/png" in header:
                    mime = "image/png"
                elif "image/webp" in header:
                    mime = "image/webp"
            parts.append({
                'inline_data': {
                    'mime_type': mime,
                    'data': clean_b64
                }
            })

        sys_prompt = (
            "You are GREEN AI, an expert agricultural assistant specializing in sustainable farming practices, "
            "crop pathology, pest management, and modern agriculture techniques. Always provide practical, actionable advice with focus on: "
            "environmental sustainability, safe and cost-effective organic & chemical solutions, clear explanations, and specific recommendations."
        )
        gemini_reply = _call_gemini_generate([{'parts': parts}], system_instruction=sys_prompt)
        if gemini_reply:
            return jsonify({'success': True, 'reply': gemini_reply})

        return jsonify({'success': False, 'message': 'Unable to connect to Google Gemini AI service.'}), 502
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/predict_price', methods=['POST'])
def predict_price():
    try:
        data = request.get_json() or {}
        crop = data.get('crop', 'Wheat')
        location = data.get('location', 'Punjab')
        quantity = data.get('quantity', '10')
        date_val = data.get('date', datetime.now().strftime('%Y-%m-%d'))

        gemini_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_key:
            return jsonify({'success': False, 'message': 'GEMINI_API_KEY is not configured in .env'}), 500

        prompt = (
            f"Analyze agricultural market price forecast for crop: {crop}, location/mandi: {location}, "
            f"quantity: {quantity} quintals, target date: {date_val}.\n"
            "Respond with valid JSON containing:\n"
            "- predicted_price: number (expected price per quintal in INR, number)\n"
            "- confidence_level: string (High/Medium/Low)\n"
            "- market_trend: string (Bullish/Bearish/Stable)\n"
            "- trend_percentage: number (expected percentage change)\n"
            "- best_selling_time: string (recommended timeframe)\n"
            "- market_insights: array of strings (key insights for this crop & mandi)\n"
            "- recommendations: array of strings (actionable advice for the farmer)\n"
            "- risk_factors: array of strings (potential risks like weather or arrival volumes)"
        )
        raw_json = _call_gemini_generate([{'parts': [{'text': prompt}]}], json_mode=True)
        if raw_json:
            content = json.loads(raw_json)
            if isinstance(content.get('predicted_price'), str):
                clean_p = ''.join(c for c in content['predicted_price'] if c.isdigit() or c == '.')
                if clean_p:
                    content['predicted_price'] = float(clean_p)
            return jsonify({'success': True, 'prediction': content})

        return jsonify({'success': False, 'message': 'Unable to retrieve prediction from Gemini AI.'}), 502
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# =====================================================================
# Real-Time Open-Meteo Weather API
# =====================================================================

@app.route('/api/weather', methods=['GET'])
def get_weather():
    try:
        lat = request.args.get('lat', '17.3850')
        lng = request.args.get('lng', '78.4867')
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,soil_moisture_0_to_1cm"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            current = r.json().get('current', {})
            temp = current.get('temperature_2m', 28.0)
            hum = current.get('relative_humidity_2m', 60)
            wind = current.get('wind_speed_10m', 10.0)
            raw_sm = current.get('soil_moisture_0_to_1cm', 0.25)
            sm_pct = round(min(100, max(0, (raw_sm / 0.45) * 100)), 1) if raw_sm is not None else 40
            return jsonify({
                'success': True,
                'temperature': f"{temp}°C",
                'humidity': f"{hum}%",
                'wind_speed': f"{wind} km/h",
                'soil_moisture': f"{sm_pct}%",
                'raw': current
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Weather service error'}), 502
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
