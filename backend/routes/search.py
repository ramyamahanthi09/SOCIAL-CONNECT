from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Post, Hashtag
from sqlalchemy import or_

search_bp = Blueprint('search', __name__)

@search_bp.route('/search/users', methods=['GET'])
def search_users():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'users': []}), 200
        
    users = User.query.filter(
        or_(
            User.username.ilike(f'%{query}%'),
            User.full_name.ilike(f'%{query}%')
        )
    ).limit(20).all()
    
    result = []
    for user in users:
        result.append({
            'id': user.user_id,
            'username': user.username,
            'full_name': user.full_name,
            'profile_picture': user.profile_picture
        })
        
    return jsonify({'users': result}), 200

@search_bp.route('/search/posts', methods=['GET'])
def search_posts():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'posts': []}), 200
        
    # Search public posts containing the query in content
    posts = Post.query.filter(
        Post.privacy_setting == 'public',
        Post.content.ilike(f'%{query}%')
    ).order_by(Post.created_at.desc()).limit(20).all()
    
    result = []
    for post in posts:
        author = User.query.get(post.user_id)
        result.append({
            'id': post.post_id,
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'author': {
                'id': author.user_id,
                'username': author.username,
                'profile_picture': author.profile_picture
            }
        })
        
    return jsonify({'posts': result}), 200

@search_bp.route('/hashtags/trending', methods=['GET'])
def get_trending_hashtags():
    hashtags = Hashtag.query.order_by(Hashtag.usage_count.desc()).limit(10).all()
    
    result = []
    for tag in hashtags:
        result.append({
            'hashtag': tag.tag_name,
            'usage_count': tag.usage_count
        })
        
    return jsonify({'trending_hashtags': result}), 200

@search_bp.route('/explore', methods=['GET'])
def explore():
    # Explore page algorithm: latest popular public posts
    posts = Post.query.filter_by(privacy_setting='public').order_by(
        Post.likes_count.desc(), 
        Post.created_at.desc()
    ).limit(30).all()
    
    result = []
    for post in posts:
        author = User.query.get(post.user_id)
        result.append({
            'id': post.post_id,
            'content': post.content,
            'media_url': post.media_url,
            'post_type': post.post_type,
            'likes': post.likes_count,
            'comments': post.comments_count,
            'author': {
                'id': author.user_id,
                'username': author.username,
                'profile_picture': author.profile_picture
            }
        })
        
    return jsonify({'explore': result}), 200
