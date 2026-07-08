from app import create_app
from extensions import db
from models import Post, Comment

app = create_app()

def repair_db():
    with app.app_context():
        try:
            print("Repairing Posts...")
            posts_updated = Post.query.filter(Post.likes_count == None).update({Post.likes_count: 0})
            pages_updated = Post.query.filter(Post.comments_count == None).update({Post.comments_count: 0})
            shares_updated = Post.query.filter(Post.shares_count == None).update({Post.shares_count: 0})
            
            print("Repairing Comments...")
            comments_updated = Comment.query.filter(Comment.likes_count == None).update({Comment.likes_count: 0})
            
            db.session.commit()
            print(f"Repaired {posts_updated} posts and {comments_updated} comments.")
        except Exception as e:
            db.session.rollback()
            print(f"Error: {e}")

if __name__ == "__main__":
    repair_db()
