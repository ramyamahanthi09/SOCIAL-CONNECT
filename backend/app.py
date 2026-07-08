from flask import Flask, send_from_directory
import os
from dotenv import load_dotenv
from config import Config

# Load environment variables from .env file
load_dotenv()
from extensions import db, migrate, jwt, cors
import models

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    with app.app_context():
        print(f"\n--- DATABASE CONFIGURATION ---")
        print(f"Using Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"------------------------------\n")

    # Register blueprints safely from routes package
    from routes import register_blueprints
    register_blueprints(app)

    # Register basic routes
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/test/')
    def test_page():
        return '<h1>Testing the SocialConnect App</h1>'

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
