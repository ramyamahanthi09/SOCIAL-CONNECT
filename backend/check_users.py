from app import create_app
from extensions import db
from models import User

app = create_app()

def check_users():
    with app.app_context():
        users = User.query.all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"User: {u.username} ({u.email}) - ID: {u.user_id}")

if __name__ == "__main__":
    check_users()
