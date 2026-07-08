from flask import Blueprint, request, jsonify
from extensions import db
from models import Post, User, Like, Comment, SavedPost, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity

interactions_bp = Blueprint('interactions', __name__)

# Likes
@interactions_bp.route('/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    existing_like = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if existing_like:
        return jsonify({'message': 'Post already liked'}), 400
        
    try:
        new_like = Like(user_id=current_user_id, post_id=post_id)
        db.session.add(new_like)
        if post.likes_count is None:
            post.likes_count = 0
        post.likes_count += 1
        
        # Create Notification
        if current_user_id != post.user_id:
            liker = User.query.get(current_user_id)
            notif = Notification(
                user_id=post.user_id,
                type='like',
                related_user_id=current_user_id,
                related_post_id=post_id,
                message=f"{liker.username} liked your post"
            )
            db.session.add(notif)
            
        db.session.commit()
        print(f"\n[DEBUG] Like committed successfully!")
        print(f"[DEBUG] Post Likes Count: {post.likes_count}")
    except Exception as e:
        db.session.rollback()
        print(f"\n[ERROR] Like creation failed: {str(e)}")
        return jsonify({'message': 'Error storing like', 'error': str(e)}), 500
        
    return jsonify({'message': 'Post liked successfully'}), 200

@interactions_bp.route('/posts/<post_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    like = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if not like:
        return jsonify({'message': 'Post not liked yet'}), 400
        
    db.session.delete(like)
    post.likes_count -= 1
    db.session.commit()
    return jsonify({'message': 'Post unliked successfully'}), 200

@interactions_bp.route('/posts/<post_id>/likes', methods=['GET'])
def get_post_likes(post_id):
    likes = Like.query.filter_by(post_id=post_id).all()
    result = []
    for like in likes:
        user = User.query.get(like.user_id)
        if user:
            result.append({
                'id': user.user_id,
                'username': user.username,
                'profile_picture': user.profile_picture
            })
    return jsonify({'likes': result}), 200

# Comments
@interactions_bp.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    data = request.get_json()
    content = data.get('content')
    if not content:
        return jsonify({'message': 'Comment content cannot be empty'}), 400
        
    new_comment = Comment(
        post_id=post_id,
        user_id=current_user_id,
        content=content,
        parent_comment_id=data.get('parent_comment_id')
    )
    
    try:
        db.session.add(new_comment)
        if post.comments_count is None:
            post.comments_count = 0
        post.comments_count += 1
        
        # Create Notification
        if current_user_id != post.user_id:
            commenter = User.query.get(current_user_id)
            notif = Notification(
                user_id=post.user_id,
                type='comment',
                related_user_id=current_user_id,
                related_post_id=post_id,
                message=f"{commenter.username} commented on your post"
            )
            db.session.add(notif)
            
        db.session.commit()
        print(f"\n[DEBUG] Comment committed successfully!")
        print(f"[DEBUG] Post Comments Count: {post.comments_count}")
    except Exception as e:
        db.session.rollback()
        print(f"\n[ERROR] Comment creation failed: {str(e)}")
        return jsonify({'message': 'Error storing comment', 'error': str(e)}), 500
        
    return jsonify({'message': 'Comment added successfully', 'comment_id': new_comment.comment_id}), 201

@interactions_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    result = []
    for c in comments:
        user = User.query.get(c.user_id)
        result.append({
            'id': c.comment_id,
            'content': c.content,
            'user': {
                'id': user.user_id,
                'username': user.username,
                'profile_picture': user.profile_picture
            },
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat(),
            'parent_comment_id': c.parent_comment_id
        })
    return jsonify({'comments': result}), 200

@interactions_bp.route('/comments/<comment_id>', methods=['PUT'])
@jwt_required()
def edit_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
    if comment.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    if 'content' in data:
        comment.content = data['content']
        db.session.commit()
        return jsonify({'message': 'Comment updated'}), 200
        
    return jsonify({'message': 'No changes provided'}), 400

@interactions_bp.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
    if comment.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    post = Post.query.get(comment.post_id)
    post.comments_count -= 1
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200

@interactions_bp.route('/comments/<comment_id>/like', methods=['POST'])
@jwt_required()
def like_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
    if comment.likes_count is None:
        comment.likes_count = 0
    comment.likes_count += 1
    db.session.commit()
    return jsonify({'message': 'Comment liked'}), 200

# Save & Share
@interactions_bp.route('/posts/<post_id>/save', methods=['POST'])
@jwt_required()
def save_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    existing_save = SavedPost.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if existing_save:
        return jsonify({'message': 'Post already saved'}), 400
        
    new_save = SavedPost(user_id=current_user_id, post_id=post_id)
    db.session.add(new_save)
    db.session.commit()
    return jsonify({'message': 'Post saved successfully'}), 200

@interactions_bp.route('/posts/<post_id>/save', methods=['DELETE'])
@jwt_required()
def unsave_post(post_id):
    current_user_id = get_jwt_identity()
    saved = SavedPost.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    
    if not saved:
        return jsonify({'message': 'Post not found in saved items'}), 404
        
    db.session.delete(saved)
    db.session.commit()
    return jsonify({'message': 'Post unsaved successfully'}), 200

@interactions_bp.route('/posts/<post_id>/share', methods=['POST'])
@jwt_required()
def share_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    # In a real app we might create a new post linking back to the original
    if post.shares_count is None:
        post.shares_count = 0
    post.shares_count += 1
    db.session.commit()
    return jsonify({'message': 'Post shared successfully'}), 200

@interactions_bp.route('/saved', methods=['GET'])
@jwt_required()
def get_saved_posts():
    current_user_id = get_jwt_identity()
    saved_records = SavedPost.query.filter_by(user_id=current_user_id).all()
    posts = []
    for record in saved_records:
        post = Post.query.get(record.post_id)
        if post:
            author = User.query.get(post.user_id)
            if author:
                posts.append({
                    'id': post.post_id,
                    'content': post.content,
                    'media_url': post.media_url,
                    'post_type': post.post_type,
                    'created_at': post.created_at.isoformat(),
                    'likes': post.likes_count,
                    'comments': post.comments_count,
                    'author': {
                        'id': author.user_id,
                        'username': author.username,
                        'profile_picture': author.profile_picture
                    }
                })
    return jsonify({'saved': posts}), 200
