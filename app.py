
from flask import Flask, request, jsonify, render_template, send_from_directory, url_for, redirect, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models import TaskManager
import os
import json
import datetime
import secrets


secret_key_string = secrets.token_urlsafe(32)

app = Flask(__name__)
app.secret_key = secret_key_string

task_manager = TaskManager()

STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

TASKS = 'tasks.json'

USERS = {
    'usuario': generate_password_hash('senha123'),
    'admin': generate_password_hash('123456')
}

# ========================== LOGIN ==========================

def login_required(f):
    @wraps(f) # To keep the original data
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            return redirect(url_for('login'))
        return f(*args, **kwargs) # Se estiver logado, executa a função da rota
    return decorated_function

@app.route('/')
def index():
    if 'logged_in' in session and session['logged_in']:
        tasks = task_manager.load_tasks()
        #return send_from_directory(STATIC_FOLDER, 'index.html')
        return render_template('index.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        print(username)
        print(password)

        if username in USERS and check_password_hash(USERS[username], password):
            session['logged_in'] = True
            session['username'] = username
            return jsonify({'message': 'Login bem-sucedido!'}), 200
        else:
            return jsonify({'message': 'Nome de usuário ou senha inválidos.'}), 401
                
    return send_from_directory(STATIC_FOLDER, 'login.html')

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('login'))

# ===========================================================

# === GET USERNAME ===
@login_required
@app.route('/get-user-name', methods=['GET'])
def getUsername():
    username = session.get('username')
    print(username)
    return jsonify({'name': username}), 200

# === GET TASKS ===
@login_required
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = task_manager.load_tasks()
    return jsonify(tasks[::-1])

# === CREATE TASK ===
@login_required
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "O título da tarefa é obrigatório"}), 400

    new_task = task_manager.add_task(
        title=data["title"],
        details=data["details"],
        taskDeadline=data["taskDeadline"],
        taskDeadlineTime=data.get("taskDeadlineTime")
    )
    return jsonify(new_task), 201    

# === UPDATE TASK ===
@login_required
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    updated_task = task_manager.update_task(task_id, data)

    if not updated_task:  
        return jsonify({"error": "Tarefa não encontrada"}), 404
    
    return jsonify(updated_task), 200

# === DELETE TASK ===
@login_required
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):   
    deleted = task_manager.delete_task(task_id)

    if not deleted:
        return jsonify({"error": "Tarefa não encontrada"}), 404
    
    return jsonify({"message": "Tarefa removida com sucesso!"}), 200

# === EDIT TASK ===
@login_required
@app.route('/tasks/<int:task_id>/edit', methods=['GET'])
def edit_task(task_id):
    task = task_manager.get_task(task_id) 
    return jsonify(task), 200

@login_required
@app.route('/tasks/<string:mode>', methods=['GET'])
def get_tasks_by_mode(mode):
    tasks = task_manager.load_tasks()

    if mode == 'active':
        new_list = [task for task in tasks if not task['completed']]
    elif mode == 'completed':
        new_list = [task for task in tasks if task['completed']]
    else:
        highPriority = list(filter(lambda x: x['priority'] == 'high', tasks))
        mediumPriority = list(filter(lambda x: x['priority'] == 'medium', tasks))
        lowPriority = list(filter(lambda x: x['priority'] == 'low', tasks))

        new_list = [*lowPriority, *mediumPriority, *highPriority]

    
    return jsonify(new_list[::-1]), 200


if __name__ == '__main__':
    app.run(debug=True)


