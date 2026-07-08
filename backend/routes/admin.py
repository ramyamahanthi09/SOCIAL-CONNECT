from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Post, Comment, Like
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Admins only!'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    user_count = User.query.count()
    post_count = Post.query.count()
    comment_count = Comment.query.count()
    like_count = Like.query.count()
    
    return jsonify({
        'users': user_count,
        'posts': post_count,
        'comments': comment_count,
        'likes': like_count
    }), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    users = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for user in users.items:
        result.append({
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'profile_picture': user.profile_picture,
            'bio': user.bio,
            'is_admin': user.is_admin,
            'post_count': user.posts.count(),
            'created_at': user.created_at.isoformat()
        })
        
    return jsonify({
        'users': result,
        'total_pages': users.pages,
        'current_page': users.page
    }), 200

@admin_bp.route('/posts', methods=['GET'])
@admin_required
def get_all_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for post in posts.items:
        result.append({
            'id': post.post_id,
            'author_username': post.author.username,
            'content': post.content,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'created_at': post.created_at.isoformat()
        })
        
    return jsonify({
        'posts': result,
        'total_pages': posts.pages,
        'current_page': posts.page
    }), 200

@admin_bp.route('/impersonate/<user_id>', methods=['POST'])
@admin_required
def impersonate_user(user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Generate token for the target user
    access_token = create_access_token(identity=target_user.user_id)
    
    return jsonify({
        'message': f'Impersonating {target_user.username}',
        'access_token': access_token,
        'user': {
            'id': target_user.user_id,
            'username': target_user.username,
            'email': target_user.email,
            'is_admin': target_user.is_admin
        }
    }), 200

@admin_bp.route('/users/<user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
    
    posts = []
    for post in target_user.posts.order_by(Post.created_at.desc()).all():
        posts.append({
            'id': post.post_id,
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'created_at': post.created_at.isoformat()
        })
        
    user_data = {
        'id': target_user.user_id,
        'username': target_user.username,
        'email': target_user.email,
        'full_name': target_user.full_name,
        'profile_picture': target_user.profile_picture,
        'bio': target_user.bio,
        'location': target_user.location,
        'is_admin': target_user.is_admin,
        'created_at': target_user.created_at.isoformat(),
        'post_count': target_user.posts.count(),
        'posts': posts
    }
    
    return jsonify({'user': user_data}), 200
