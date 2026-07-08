from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import Message, User, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from sqlalchemy import or_, and_

messages_bp = Blueprint('messages', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'mov', 'avi', 'pdf', 'doc', 'docx', 'zip', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_message_type(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ['mp4', 'webm', 'mov', 'avi']:
        return 'video'
    if ext in ['png', 'jpg', 'jpeg', 'gif']:
        return 'image'
    return 'file'

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    current_user_id = get_jwt_identity()
    
    # Get all messages where user is sender or receiver
    messages = Message.query.filter(
        or_(Message.sender_id == current_user_id, Message.receiver_id == current_user_id)
    ).order_by(Message.created_at.desc()).all()
    
    # Extract unique users and latest message
    conversations_map = {}
    for msg in messages:
        other_user_id = msg.receiver_id if msg.sender_id == current_user_id else msg.sender_id
        if other_user_id not in conversations_map:
            user = User.query.get(other_user_id)
            if user:
                conversations_map[other_user_id] = {
                    'user': {
                        'id': user.user_id,
                        'username': user.username,
                        'profile_picture': user.profile_picture
                    },
                    'last_message': msg.content,
                    'created_at': msg.created_at.isoformat(),
                    'is_read': msg.is_read
                }
                
    result = list(conversations_map.values())
    return jsonify({'conversations': result}), 200

@messages_bp.route('/<other_user_id>', methods=['GET'])
@jwt_required()
def get_chat_history(other_user_id):
    current_user_id = get_jwt_identity()
    
    # Mark messages as read
    unread_messages = Message.query.filter_by(sender_id=other_user_id, receiver_id=current_user_id, is_read=False).all()
    for msg in unread_messages:
        msg.is_read = True
    if unread_messages:
        db.session.commit()
    
    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == current_user_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user_id)
        )
    ).order_by(Message.created_at.asc()).all()
    
    result = []
    for msg in messages:
        result.append({
            'message_id': msg.message_id,
            'sender_id': msg.sender_id,
            'receiver_id': msg.receiver_id,
            'content': msg.content,
            'media_url': getattr(msg, 'media_url', None),
            'message_type': getattr(msg, 'message_type', 'text'),
            'is_read': msg.is_read,
            'created_at': msg.created_at.isoformat()
        })
        
    return jsonify({'messages': result}), 200

@messages_bp.route('/<other_user_id>', methods=['POST'])
@jwt_required()
def send_message(other_user_id):
    current_user_id = get_jwt_identity()
    
    receiver = User.query.get(other_user_id)
    if not receiver:
        return jsonify({'message': 'Receiver not found'}), 404
        
    content = request.form.get('content', '')
    media_url = None
    message_type = 'text'
    
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"msg_{current_user_id}_{file.filename}")
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            media_url = f"/uploads/{filename}"
            message_type = get_message_type(filename)
            
    if not content and not media_url:
        return jsonify({'message': 'Message cannot be empty'}), 400
        
    new_message = Message(
        sender_id=current_user_id,
        receiver_id=other_user_id,
        content=content
    )
    
    if media_url:
        new_message.media_url = media_url
        new_message.message_type = message_type
        
    db.session.add(new_message)
    
    # Create notification
    notification = Notification(
        user_id=other_user_id,
        type='message',
        related_user_id=current_user_id,
        message=f'sent you a new {message_type}'
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message_id': new_message.message_id,
        'sender_id': new_message.sender_id,
        'content': new_message.content,
        'media_url': getattr(new_message, 'media_url', None),
        'message_type': getattr(new_message, 'message_type', 'text'),
        'created_at': new_message.created_at.isoformat()
    }), 201
