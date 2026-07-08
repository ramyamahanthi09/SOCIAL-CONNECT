import os
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import User, Post, Follow
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

users_bp = Blueprint('users', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@users_bp.route('/<username>', methods=['GET'])
def get_user_by_username(username):
    print(f"\n[DEBUG] Fetching profile for username: {username}")
    user = User.query.filter_by(username=username).first()
    if not user:
        print(f"[DEBUG] User NOT found by username: {username}")
        return jsonify({'message': 'User not found'}), 404
    print(f"[DEBUG] User Found: {user.username} (ID: {user.user_id})")
        
    return jsonify({
        'id': user.user_id,
        'username': user.username,
        'full_name': user.full_name,
        'bio': user.bio,
        'profile_picture': user.profile_picture,
        'cover_photo': user.cover_photo,
        'is_private': user.is_private,
        'followers_count': Follow.query.filter_by(following_id=user.user_id, status='accepted').count(),
        'following_count': Follow.query.filter_by(follower_id=user.user_id, status='accepted').count(),
        'post_count': Post.query.filter_by(user_id=user.user_id).count()
    }), 200

@users_bp.route('/id/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    return jsonify({
        'id': user.user_id,
        'username': user.username,
        'full_name': user.full_name,
        'bio': user.bio,
        'profile_picture': user.profile_picture,
        'cover_photo': user.cover_photo,
        'is_private': user.is_private,
        'followers_count': Follow.query.filter_by(following_id=user.user_id, status='accepted').count(),
        'following_count': Follow.query.filter_by(follower_id=user.user_id, status='accepted').count(),
        'post_count': Post.query.filter_by(user_id=user.user_id).count()
    }), 200

@users_bp.route('/<user_id>/posts', methods=['GET'])
@jwt_required(optional=True)
def get_user_posts(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    current_user_id = get_jwt_identity()
    
    # Simple privacy check (can be enhanced further)
    if user.is_private and current_user_id != user_id:
        is_following = Follow.query.filter_by(
            follower_id=current_user_id,
            following_id=user_id, 
            status='accepted'
        ).first()
        if not is_following:
            return jsonify({'message': 'This account is private'}), 403

    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for post in posts.items:
        result.append({
            'id': post.post_id,
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'created_at': post.created_at.isoformat(),
            'author': {
                'id': user.user_id,
                'username': user.username,
                'profile_picture': user.profile_picture
            }
        })
        
    return jsonify({
        'posts': result,
        'total_pages': posts.pages,
        'current_page': posts.page
    }), 200

@users_bp.route('/<user_id>/followers', methods=['GET'])
def get_user_followers(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    followers = Follow.query.filter_by(following_id=user_id, status='accepted').paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for f in followers.items:
        follower = User.query.get(f.follower_id)
        if follower:
            result.append({
                'id': follower.user_id,
                'username': follower.username,
                'full_name': follower.full_name,
                'profile_picture': follower.profile_picture
            })
            
    return jsonify({'followers': result}), 200

@users_bp.route('/<user_id>/following', methods=['GET'])
def get_user_following(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    following = Follow.query.filter_by(follower_id=user_id, status='accepted').paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for f in following.items:
        followed_user = User.query.get(f.following_id)
        if followed_user:
            result.append({
                'id': followed_user.user_id,
                'username': followed_user.username,
                'full_name': followed_user.full_name,
                'profile_picture': followed_user.profile_picture
            })
            
    return jsonify({'following': result}), 200

def handle_upload(file, user, attribute):
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{user.user_id}_{file.filename}")
        
        # Ensure directory exists
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # In a real app we'd construct a proper URL and handle CDN uploads
        setattr(user, attribute, f"/uploads/{filename}")
        db.session.commit()
        return True, f"/uploads/{filename}"
    return False, None

@users_bp.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    success, url = handle_upload(file, user, 'profile_picture')
    if success:
        return jsonify({'message': 'Profile picture updated', 'url': url}), 200
    return jsonify({'message': 'Invalid file type'}), 400

@users_bp.route('/upload-cover-photo', methods=['POST'])
@jwt_required()
def upload_cover_photo():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
        
    file = request.files['file']
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    success, url = handle_upload(file, user, 'cover_photo')
    if success:
        return jsonify({'message': 'Cover photo updated', 'url': url}), 200
    return jsonify({'message': 'Invalid file type'}), 400

@users_bp.route('/privacy-settings', methods=['PUT'])
@jwt_required()
def update_privacy():
    data = request.get_json()
    if 'is_private' not in data:
        return jsonify({'message': 'Missing is_private parameter'}), 400
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    user.is_private = bool(data['is_private'])
    db.session.commit()
    
    return jsonify({'message': f"Account privacy set to {'Private' if user.is_private else 'Public'}"}), 200

@users_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_user_suggestions():
    current_user_id = get_jwt_identity()
    # Get IDs of users already being followed
    followed_ids = [f.following_id for f in Follow.query.filter_by(follower_id=current_user_id).all()]
    followed_ids.append(current_user_id) # Don't suggest self
    
    # Suggest users NOT in followed_ids
    suggestions = User.query.filter(User.user_id.notin_(followed_ids)).limit(5).all()
    
    result = []
    for user in suggestions:
        result.append({
            'id': user.user_id,
            'username': user.username,
            'full_name': user.full_name,
            'profile_picture': user.profile_picture
        })
        
    return jsonify({'suggestions': result}), 200
