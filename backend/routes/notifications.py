from flask import Blueprint, request, jsonify
from extensions import db
from models import Notification, User
from flask_jwt_extended import jwt_required, get_jwt_identity

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for notif in notifications.items:
        related_user = User.query.get(notif.related_user_id) if notif.related_user_id else None
        
        result.append({
            'id': notif.notification_id,
            'type': notif.type,
            'message': notif.message,
            'is_read': notif.is_read,
            'created_at': notif.created_at.isoformat(),
            'related_user': {
                'id': related_user.user_id,
                'username': related_user.username,
                'profile_picture': related_user.profile_picture
            } if related_user else None,
            'related_post_id': notif.related_post_id
        })
        
    return jsonify({
        'notifications': result,
        'total_pages': notifications.pages,
        'current_page': notifications.page
    }), 200

@notifications_bp.route('/unread', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    return jsonify({'unread_count': count}), 200

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.get(notification_id)
    
    if not notif:
        return jsonify({'message': 'Notification not found'}), 404
        
    if notif.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    current_user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200

@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.get(notification_id)
    
    if not notif:
        return jsonify({'message': 'Notification not found'}), 404
        
    if notif.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    db.session.delete(notif)
    db.session.commit()
    return jsonify({'message': 'Notification deleted successfully'}), 200
