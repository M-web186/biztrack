from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, Task, Setting
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

# ---------------------------
# HOME TEST
# ---------------------------
@app.route('/')
def home():
    return jsonify({"message": "Server is running"}), 200


# ---------------------------
# PRODUCTS ROUTES
# ---------------------------
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    data = [
        {
            "id": p.id,
            "product_name": p.product_name,
            "price": p.price,
            "quantity": p.quantity,
            "priority": p.priority,
            "status": p.status,
            "due_date": p.due_date
        }
        for p in products
    ]
    return jsonify(data)

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    new_product = Product(
        product_name=data['product_name'],
        price=data['price'],
        quantity=data['quantity'],
        priority=data['priority'],
        due_date=data.get('due_date')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product added successfully"}), 201

@app.route('/products/<int:id>', methods=['PATCH'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        product.status = data['status']
    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200


# ---------------------------
# TASKS ROUTES
# ---------------------------
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    data = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for t in tasks
    ]
    return jsonify(data)

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = Task(
        title=data['title'],
        description=data.get('description'),
        priority=data.get('priority', 'Medium')
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added successfully"}), 201

@app.route('/tasks/<int:id>', methods=['PATCH'])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        task.status = data['status']
    db.session.commit()
    return jsonify({"message": "Task updated successfully"}), 200

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200


# ---------------------------
# SETTINGS ROUTES
# ---------------------------
@app.route('/settings', methods=['GET'])
def get_settings():
    settings = Setting.query.all()
    data = [{"id": s.id, "name": s.name, "value": s.value} for s in settings]
    return jsonify(data)

@app.route('/settings', methods=['POST'])
def add_setting():
    data = request.get_json()
    new_setting = Setting(name=data['name'], value=data['value'])
    db.session.add(new_setting)
    db.session.commit()
    return jsonify({"message": "Setting added"}), 201

@app.route('/settings/<int:id>', methods=['DELETE'])
def delete_setting(id):
    setting = Setting.query.get_or_404(id)
    db.session.delete(setting)
    db.session.commit()
    return jsonify({"message": "Setting deleted"}), 200


# ---------------------------
# REPORTS ROUTE
# ---------------------------
@app.route('/reports', methods=['GET'])
def get_reports():
    total_products = Product.query.count()
    completed_products = Product.query.filter_by(status='Completed').count()
    total_tasks = Task.query.count()
    completed_tasks = Task.query.filter_by(status='Completed').count()

    return jsonify({
        "total_products": total_products,
        "completed_products": completed_products,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks
    })


if __name__ == '__main__':
    app.run(debug=True)
