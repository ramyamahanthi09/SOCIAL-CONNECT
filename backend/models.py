from extensions import db
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# Association Tables
post_hashtags = db.Table('post_hashtags',
    db.Column('post_id', db.String(36), db.ForeignKey('posts.post_id'), primary_key=True),
    db.Column('hashtag_id', db.String(36), db.ForeignKey('hashtags.hashtag_id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    cover_photo = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    account_status = db.Column(db.String(20), default="active") # active, inactive, deleted
    is_private = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    likes = db.relationship('Like', backref='user', lazy='dynamic')

class Post(db.Model):
    __tablename__ = 'posts'
    
    post_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=True)
    media_url = db.Column(db.String(255), nullable=True)
    post_type = db.Column(db.String(20), default="text") # text, image, video
    privacy_setting = db.Column(db.String(20), default="public") # public, friends, private
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='post', lazy='dynamic', cascade="all, delete-orphan")
    hashtags = db.relationship('Hashtag', secondary=post_hashtags, backref=db.backref('posts', lazy='dynamic'))

class Comment(db.Model):
    __tablename__ = 'comments'
    
    comment_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.post_id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    parent_comment_id = db.Column(db.String(36), db.ForeignKey('comments.comment_id'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    likes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[comment_id]), lazy='dynamic')

class Like(db.Model):
    __tablename__ = 'likes'
    
    like_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.post_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Follow(db.Model):
    __tablename__ = 'follows'
    
    follow_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    follower_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    following_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    status = db.Column(db.String(20), default="accepted") # accepted, pending
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    notification_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # like, comment, follow, mention
    related_user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    related_post_id = db.Column(db.String(36), db.ForeignKey('posts.post_id'), nullable=True)
    message = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Hashtag(db.Model):
    __tablename__ = 'hashtags'
    
    hashtag_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tag_name = db.Column(db.String(100), unique=True, nullable=False)
    usage_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SavedPost(db.Model):
    __tablename__ = 'saved_posts'
    
    saved_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.post_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    
    message_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    message_type = db.Column(db.String(20), default="text")
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Report(db.Model):
    __tablename__ = 'reports'
    
    report_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    reporter_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.post_id'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default="pending") # pending, resolved, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
