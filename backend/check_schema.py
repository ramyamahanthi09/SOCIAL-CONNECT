from app import create_app
from extensions import db
from sqlalchemy import inspect

app = create_app()

def check_schema():
    with app.app_context():
        inspector = inspect(db.engine)
        for table_name in inspector.get_table_names():
            print(f"\nTable: {table_name}")
            for column in inspector.get_columns(table_name):
                print(f"  Column: {column['name']} | Type: {column['type']} | Nullable: {column['nullable']}")

if __name__ == "__main__":
    check_schema()
