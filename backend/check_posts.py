from app import create_app
from extensions import db
from models import Post

app = create_app()

def check_posts():
    with app.app_context():
        posts = Post.query.all()
        for p in posts:
            print(f"Post {p.post_id}: Likes={p.likes_count}, Comments={p.comments_count}, Shares={p.shares_count}")

if __name__ == "__main__":
    check_posts()
