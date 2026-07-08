from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import Post, User, Follow, Hashtag
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

posts_bp = Blueprint('posts', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'mov', 'avi'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@posts_bp.route('/', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Retrieve public posts
    posts = Post.query.filter_by(privacy_setting='public').order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for post in posts.items:
        author = User.query.get(post.user_id)
        result.append({
            'id': post.post_id,
            'author': {
                'id': author.user_id,
                'username': author.username,
                'profile_picture': author.profile_picture
            },
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'created_at': post.created_at.isoformat()
        })
        
    return jsonify({
        'posts': result,
        'total_pages': posts.pages,
        'current_page': posts.page
    }), 200

@posts_bp.route('/<post_id>', methods=['GET'])
@jwt_required(optional=True)
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    author = User.query.get(post.user_id)
    
    # Check simple privacy if not public
    if post.privacy_setting != 'public':
        current_user_id = get_jwt_identity()
        if current_user_id != post.user_id:
            return jsonify({'message': 'Access denied'}), 403

    return jsonify({
        'id': post.post_id,
        'author': {
            'id': author.user_id,
            'username': author.username
        },
        'content': post.content,
        'media_url': post.media_url,
        'post_type': post.post_type,
        'likes': post.likes_count,
        'comments': post.comments_count,
        'created_at': post.created_at.isoformat()
    }), 200

@posts_bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    current_user_id = get_jwt_identity()
    
    # Get following IDs
    following_records = Follow.query.filter_by(follower_id=current_user_id, status='accepted').all()
    following_ids = [record.following_id for record in following_records]
    
    # Include own posts
    following_ids.append(current_user_id)
    
    posts = Post.query.filter(Post.user_id.in_(following_ids)).order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for post in posts.items:
        author = User.query.get(post.user_id)
        result.append({
            'id': post.post_id,
            'author': {
                'id': author.user_id,
                'username': author.username,
                'profile_picture': author.profile_picture
            },
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'created_at': post.created_at.isoformat()
        })
        
    return jsonify({
        'posts': result,
        'total_pages': posts.pages,
        'current_page': posts.page
    }), 200

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    current_user_id = get_jwt_identity()
    
    content = request.form.get('content', '')
    privacy_setting = request.form.get('privacy_setting', 'public')
    post_type = 'text'
    media_url = None
    
    # Handle media payload
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"post_{current_user_id}_{file.filename}")
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            media_url = f"/uploads/{filename}"
            post_type = 'video' if filename.lower().endswith(('.mp4', '.webm', '.mov', '.avi')) else 'image'
            
    if not content and not media_url:
        return jsonify({'message': 'Post must contain content or media'}), 400
        
    new_post = Post(
        user_id=current_user_id,
        content=content,
        privacy_setting=privacy_setting,
        post_type=post_type,
        media_url=media_url,
        likes_count=0,
        comments_count=0,
        shares_count=0
    )
    
    try:
        db.session.add(new_post)
        db.session.commit()
        
        # Verify write
        count = Post.query.count()
        print(f"\n[DEBUG] Post committed successfully!")
        print(f"[DEBUG] Post ID: {new_post.post_id}")
        print(f"[DEBUG] Total Posts in DB: {count}")
    except Exception as e:
        db.session.rollback()
        print(f"\n[ERROR] Post creation failed: {str(e)}")
        current_app.logger.error(f"Post creation error: {e}")
        return jsonify({'message': 'Error storing post in database', 'error': str(e)}), 500
    
    return jsonify({'message': 'Post created successfully', 'post_id': new_post.post_id}), 201

@posts_bp.route('/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    if post.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to edit this post'}), 403
        
    data = request.get_json()
    if 'content' in data:
        post.content = data['content']
    if 'privacy_setting' in data:
        post.privacy_setting = data['privacy_setting']
        
    db.session.commit()
    return jsonify({'message': 'Post updated successfully'}), 200

@posts_bp.route('/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    if post.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to delete this post'}), 403
        
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted successfully'}), 200

@posts_bp.route('/trending', methods=['GET'])
def get_trending_posts():
    posts = Post.query.filter_by(privacy_setting='public').order_by(Post.likes_count.desc(), Post.comments_count.desc()).limit(20).all()
    result = []
    
    for post in posts:
        result.append({
            'id': post.post_id,
            'content': post.content,
            'likes': post.likes_count
        })
        
    return jsonify({'trending': result}), 200
