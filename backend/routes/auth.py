from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity, 
    get_jwt
)

auth_bp = Blueprint('auth', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already exists'}), 400
        
    new_user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password')),
        full_name=data.get('full_name', ''),
        bio=data.get('bio', '')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    access_token = create_access_token(identity=user.user_id)
    refresh_token = create_refresh_token(identity=user.user_id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a full production app, implement token blocklisting here
    return jsonify({'message': 'Successfully logged out'}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    return jsonify({
        'id': user.user_id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'bio': user.bio,
        'profile_picture': user.profile_picture,
        'cover_photo': user.cover_photo,
        'location': user.location,
        'website': user.website,
        'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
        'is_private': user.is_private,
        'is_admin': user.is_admin
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Handle Text Data
    # Supports both application/json and multipart/form-data
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    updatable_fields = ['full_name', 'bio', 'location', 'website']
    for field in updatable_fields:
        if field in data:
            setattr(user, field, data[field])
            
    if 'is_private' in data:
        val = data['is_private']
        if isinstance(val, str):
            user.is_private = val.lower() == 'true'
        else:
            user.is_private = bool(val)
            
    # Handle File Uploads
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"avatar_{current_user_id}_{file.filename}")
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            user.profile_picture = f"/uploads/{filename}"

    if 'cover_photo' in request.files:
        file = request.files['cover_photo']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"cover_{current_user_id}_{file.filename}")
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            user.cover_photo = f"/uploads/{filename}"
            
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({'message': 'Missing old or new password'}), 400
        
    if not check_password_hash(user.password_hash, old_password):
        return jsonify({'message': 'Invalid old password'}), 401
        
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/refresh-token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': new_access_token}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('new_password')
    
    if not email or not new_password:
        return jsonify({'message': 'Missing email or new password.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if user:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully.'}), 200
        
    return jsonify({'message': 'Email not found.'}), 404
