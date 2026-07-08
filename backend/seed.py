from app import create_app
from extensions import db
from models import User, Post, Follow, Hashtag, Notification, Like, Comment, SavedPost
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

app = create_app()

def seed_data():
    with app.app_context():
        # Clean current tables to avoid unique constraint errors during multiple seeds
        db.session.query(Notification).delete()
        db.session.query(Comment).delete()
        db.session.query(SavedPost).delete()
        db.session.query(Like).delete()
        db.session.query(Hashtag).delete()
        db.session.query(Follow).delete()
        db.session.query(Post).delete()
        db.session.query(User).delete()
        db.session.commit()
        
        # Create users
        user1 = User(username='john_doe', email='john@example.com', password_hash=generate_password_hash('password123'), full_name='John Doe', bio='Full-Stack Engineer. Building SocialConnect!')
        user2 = User(username='jane_smith', email='jane@example.com', password_hash=generate_password_hash('password123'), full_name='Jane Smith', bio='Web Developer & Open Source Contributor 🚀')
        user3 = User(username='tech_guru', email='guru@example.com', password_hash=generate_password_hash('password123'), full_name='Tech Guru', bio='AI Researcher | Tech Enthusiast')
        user4 = User(username='alice_wonder', email='alice@example.com', password_hash=generate_password_hash('password123'), full_name='Alice W.', bio='Designer capturing moments. 🎨')
        
        db.session.add_all([user1, user2, user3, user4])
        db.session.commit()
        
        # Create posts
        post1 = Post(user_id=user1.user_id, content='This is my first post on SocialConnect! So excited to see where this goes. #milestone #socialconnect', privacy_setting='public')
        post2 = Post(user_id=user2.user_id, content='Loving the new platform! The Glassmorphism UI is absolutely stunning. Great work by the devs! ✨ #design #reactjs', privacy_setting='public')
        post3 = Post(user_id=user3.user_id, content='What are the biggest AI breakthroughs you expect this year? #AI #tech #future', privacy_setting='public')
        post4 = Post(user_id=user4.user_id, content='Just finished a brand new design component library today! Feeling very productive. #design', privacy_setting='public')
        post5 = Post(user_id=user1.user_id, content='Debugging late into the night. Does it ever stop? ☕ #programming', privacy_setting='public')
        
        db.session.add_all([post1, post2, post3, post4, post5])
        db.session.commit()

        # Create Hashtags (Trending Data)
        h1 = Hashtag(tag_name='socialconnect', usage_count=150)
        h2 = Hashtag(tag_name='design', usage_count=320)
        h3 = Hashtag(tag_name='reactjs', usage_count=410)
        h4 = Hashtag(tag_name='tech', usage_count=85)
        h5 = Hashtag(tag_name='AI', usage_count=980)
        
        db.session.add_all([h1, h2, h3, h4, h5])
        db.session.commit()
        
        # Create follow relationships
        f1 = Follow(follower_id=user1.user_id, following_id=user2.user_id, status='accepted')
        f2 = Follow(follower_id=user1.user_id, following_id=user3.user_id, status='accepted')
        f3 = Follow(follower_id=user2.user_id, following_id=user1.user_id, status='accepted')
        f4 = Follow(follower_id=user4.user_id, following_id=user1.user_id, status='accepted')
        f5 = Follow(follower_id=user3.user_id, following_id=user1.user_id, status='accepted')
        db.session.add_all([f1, f2, f3, f4, f5])
        db.session.commit()

        # Create interactions (Likes and Comments)
        l1 = Like(user_id=user2.user_id, post_id=post1.post_id)
        l2 = Like(user_id=user3.user_id, post_id=post1.post_id)
        l3 = Like(user_id=user4.user_id, post_id=post1.post_id)
        post1.likes_count = 3

        l4 = Like(user_id=user1.user_id, post_id=post2.post_id)
        post2.likes_count = 1

        c1 = Comment(post_id=post1.post_id, user_id=user2.user_id, content="Congratulations! This looks amazing. 🎉")
        c2 = Comment(post_id=post1.post_id, user_id=user3.user_id, content="Can't wait to test the features!")
        post1.comments_count = 2

        db.session.add_all([l1, l2, l3, l4, c1, c2])
        db.session.commit()

        # Create Notifications for user1 (John Doe)
        n1 = Notification(user_id=user1.user_id, type='follow', related_user_id=user4.user_id, is_read=False)
        n2 = Notification(user_id=user1.user_id, type='like', related_user_id=user2.user_id, is_read=False, message="Jane liked your post")
        n3 = Notification(user_id=user1.user_id, type='comment', related_user_id=user3.user_id, is_read=False, message="Can't wait to test the features!")
        n4 = Notification(user_id=user1.user_id, type='like', related_user_id=user3.user_id, is_read=True, message="Tech Guru liked your post")

        db.session.add_all([n1, n2, n3, n4])
        db.session.commit()
        
        # Add Saved posts
        save1 = SavedPost(user_id=user1.user_id, post_id=post2.post_id)
        save2 = SavedPost(user_id=user1.user_id, post_id=post4.post_id)
        db.session.add_all([save1, save2])
        db.session.commit()

        print("Database seeded successfully with massive realistic sample data.")

if __name__ == '__main__':
    seed_data()
