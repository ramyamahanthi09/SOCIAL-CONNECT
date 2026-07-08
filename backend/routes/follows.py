from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Follow, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity

follows_bp = Blueprint('follows', __name__)

@follows_bp.route('/users/<user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id == user_id:
        return jsonify({'message': 'You cannot follow yourself'}), 400
        
    user_to_follow = User.query.get(user_id)
    if not user_to_follow:
        return jsonify({'message': 'User not found'}), 404
        
    existing_follow = Follow.query.filter_by(follower_id=current_user_id, following_id=user_id).first()
    if existing_follow:
        return jsonify({'message': 'Already followed or request pending'}), 400
        
    status = "pending" if user_to_follow.is_private else "accepted"
    new_follow = Follow(follower_id=current_user_id, following_id=user_id, status=status)
    db.session.add(new_follow)
    
    # Create Notification
    follower = User.query.get(current_user_id)
    notif = Notification(
        user_id=user_id,
        type='follow',
        related_user_id=current_user_id,
        message=f"{follower.username} followed you" if status == 'accepted' else f"{follower.username} sent you a follow request"
    )
    db.session.add(notif)
    
    db.session.commit()
    
    msg = 'Follow request sent' if status == 'pending' else 'Successfully followed user'
    return jsonify({'message': msg}), 200

@follows_bp.route('/users/<user_id>/follow', methods=['DELETE'])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = get_jwt_identity()
    follow = Follow.query.filter_by(follower_id=current_user_id, following_id=user_id).first()
    
    if not follow:
        return jsonify({'message': 'You are not following this user'}), 404
        
    db.session.delete(follow)
    db.session.commit()
    return jsonify({'message': 'Successfully unfollowed user'}), 200

@follows_bp.route('/users/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    current_user_id = get_jwt_identity()
    
    # Simple logic: users not current user, and not already followed
    followed_records = Follow.query.filter_by(follower_id=current_user_id).all()
    followed_ids = [r.following_id for r in followed_records]
    followed_ids.append(current_user_id)  # exclude self
    
    suggestions = User.query.filter(~User.user_id.in_(followed_ids)).limit(10).all()
    
    result = []
    for user in suggestions:
        result.append({
            'id': user.user_id,
            'username': user.username,
            'full_name': user.full_name,
            'profile_picture': user.profile_picture,
            'bio': user.bio
        })
        
    return jsonify({'suggestions': result}), 200

@follows_bp.route('/users/<user_id>/block', methods=['POST'])
@jwt_required()
def block_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id == user_id:
        return jsonify({'message': 'Cannot block yourself'}), 400
        
    # Remove any existing follows
    f1 = Follow.query.filter_by(follower_id=current_user_id, following_id=user_id).first()
    f2 = Follow.query.filter_by(follower_id=user_id, following_id=current_user_id).first()
    
    if f1: db.session.delete(f1)
    if f2: db.session.delete(f2)
    
    blocked = Follow(follower_id=current_user_id, following_id=user_id, status='blocked')
    db.session.add(blocked)
    db.session.commit()
    
    return jsonify({'message': 'User blocked successfully'}), 200

@follows_bp.route('/users/<user_id>/block', methods=['DELETE'])
@jwt_required()
def unblock_user(user_id):
    current_user_id = get_jwt_identity()
    follow = Follow.query.filter_by(follower_id=current_user_id, following_id=user_id, status='blocked').first()
    
    if not follow:
        return jsonify({'message': 'User is not blocked'}), 404
        
    db.session.delete(follow)
    db.session.commit()
    
    return jsonify({'message': 'User unblocked successfully'}), 200

@follows_bp.route('/follow-requests/<follow_id>/accept', methods=['POST'])
@jwt_required()
def accept_follow_request(follow_id):
    current_user_id = get_jwt_identity()
    follow = Follow.query.get(follow_id)
    
    if not follow or follow.following_id != current_user_id:
        return jsonify({'message': 'Invalid follow request'}), 404
        
    if follow.status != 'pending':
        return jsonify({'message': 'Request not pending'}), 400
        
    follow.status = 'accepted'
    
    # Create Notification for the follower
    follower = User.query.get(follow.follower_id)
    followed_user = User.query.get(current_user_id)
    notif = Notification(
        user_id=follow.follower_id,
        type='follow_accept',
        related_user_id=current_user_id,
        message=f"{followed_user.username} accepted your follow request"
    )
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({'message': 'Follow request accepted'}), 200

@follows_bp.route('/follow-requests/<follow_id>/reject', methods=['POST'])
@jwt_required()
def reject_follow_request(follow_id):
    current_user_id = get_jwt_identity()
    follow = Follow.query.get(follow_id)
    
    if not follow or follow.following_id != current_user_id:
        return jsonify({'message': 'Invalid follow request'}), 404
        
    db.session.delete(follow)
    db.session.commit()
    return jsonify({'message': 'Follow request rejected'}), 200
