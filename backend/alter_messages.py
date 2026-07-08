from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()

def alter_schema():
    with app.app_context():
        try:
            db.session.execute(text("ALTER TABLE messages ADD COLUMN media_url VARCHAR(255) NULL;"))
            print("Successfully added media_url")
        except Exception as e:
            print(f"Skipping media_url or error: {e}")
            db.session.rollback()
        
        try:
            db.session.execute(text("ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';"))
            print("Successfully added message_type")
        except Exception as e:
            print(f"Skipping message_type or error: {e}")
            db.session.rollback()

        db.session.commit()
        print("Done altering tables.")

if __name__ == "__main__":
    alter_schema()
