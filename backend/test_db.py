from app import create_app
from extensions import db
from models import User, Post, Like
import uuid

app = create_app()

def test_write():
    with app.app_context():
        try:
            # Get a user (should have been seeded)
            user = User.query.first()
            if not user:
                print("No users found. Seed first.")
                return
            
            print(f"Testing with user: {user.username} ({user.user_id})")
            
            # 1. Test Create Post
            new_post = Post(
                user_id=user.user_id,
                content="Test post for Postgres",
                privacy_setting="public"
            )
            db.session.add(new_post)
            db.session.commit()
            print(f"Successfully created post: {new_post.post_id}")
            
            # 2. Test Create Like
            new_like = Like(
                user_id=user.user_id,
                post_id=new_post.post_id
            )
            db.session.add(new_like)
            db.session.commit()
            print(f"Successfully created like: {new_like.like_id}")
            
            # Clean up
            db.session.delete(new_like)
            db.session.delete(new_post)
            db.session.commit()
            print("Cleanup successful.")
            
        except Exception as e:
            db.session.rollback()
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_write()
