from .auth import auth_bp
from .users import users_bp
from .posts import posts_bp
from .interactions import interactions_bp
from .follows import follows_bp
from .notifications import notifications_bp
from .search import search_bp
from .admin import admin_bp
from .messages import messages_bp
from .ai import ai_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    # Interactions are mostly under /api/posts and /api/comments, but we'll register under root or specific prefixes
    app.register_blueprint(interactions_bp, url_prefix='/api')
    app.register_blueprint(follows_bp, url_prefix='/api')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(search_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
