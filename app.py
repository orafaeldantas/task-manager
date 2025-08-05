
from flask import Flask, request, jsonify, render_template, send_from_directory, url_for, redirect, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os
import json
import datetime
import secrets

secret_key_string = secrets.token_urlsafe(32)

app = Flask(__name__)
app.secret_key = secret_key_string

STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

TASKS = 'tasks.json'
task_id_counter = 1

USERS = {
    'usuario': generate_password_hash('senha123'),
    'admin': generate_password_hash('123456')
}

# ========================== LOGIN ==========================

def login_required(f):
    @wraps(f) # Isso é importante para que o decorador preserve o nome e docstring da função original
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            # Se o usuário não está logado, redireciona para a página de login
            return redirect(url_for('login'))
        return f(*args, **kwargs) # Se estiver logado, executa a função da rota
    return decorated_function

@app.route('/')
def index():
    if 'logged_in' in session and session['logged_in']:
        tasks = load_task()
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


def load_task():
    if not os.path.exists(TASKS):
        return []
    with open(TASKS, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError: # Lida com arquivo JSON vazio ou mal formatado
            return []

# Função para salvar o histórico no arquivo JSON
def save_task(tasks):
     with open(TASKS, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=4, ensure_ascii=False)

""" 
@app.route('/')
def home():
    tasks = load_task()
    #return render_template("index.html", tasks=tasks[::-1])
    return send_from_directory(STATIC_FOLDER, 'login.html')
"""
@login_required
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_task()
    return jsonify(tasks[::-1])

@login_required
@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_task()
    global task_id_counter
    data = request.get_json()
    date = datetime.datetime.now()
    formatted_date = date.strftime("%d/%m/%Y - %H:%M ")


    if tasks == []:
        task_id_counter = 0
    else:
        task_id_counter = int(tasks[-1]['id'])


    if not data or 'title' not in data:
        return jsonify({"error": "O título da tarefa é obrigatório"}), 400
    
    date_time_deadline_no_format = datetime.datetime.strptime(data['taskDeadline'], '%Y-%m-%d')
    date_time_deadline = date_time_deadline_no_format.strftime('%d/%m/%Y')

    task_id_counter += 1
    new_task = {
        "id": task_id_counter,
        "title": data['title'],
        "completed": False,
        "priority": 'low',
        "date": formatted_date,
        "details": data['details'],
        "taskDeadline": date_time_deadline + " - " + data['taskDeadlineTime'],
    }
    tasks.append(new_task)
    save_task(tasks)   
    return jsonify(new_task), 201 # 201 Created

# === UPDATE TASK ===
@login_required
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = load_task()
    data = request.get_json()
    for task in tasks:
        if task['id'] == task_id:
            if 'title' in data:
                task['title'] = data['title']
            if 'completed' in data:
                task['completed'] = data['completed']
            if 'priority' in data:
                task['priority'] = data['priority']
            save_task(tasks) 
            return jsonify(task)
    return jsonify({"error": "Tarefa não encontrada"}), 404

# === DELETE TASK ===
@login_required
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_task()
    new_list_task = []
    for task in tasks:
        if task['id'] != task_id:
            new_list_task.append(task)
    save_task(new_list_task)
    return jsonify({"message": "Tarefa excluída com sucesso"}), 200

# === EDIT TASK ===
@login_required
@app.route('/tasks/<int:task_id>/edit', methods=['GET'])
def edit_task(task_id):
    tasks = load_task()
    for task in tasks:
        if task['id'] == task_id:      
            return jsonify(task), 200

@login_required
@app.route('/tasks/<string:mode>', methods=['GET'])
def get_tasks_by_mode(mode):
    tasks = load_task()

    if mode == 'active':
        tasks = load_task()
        new_list = [task for task in tasks if not task['completed']]
    elif mode == 'completed':
        tasks = load_task()
        new_list = [task for task in tasks if task['completed']]
    else:
        highPriority = list(filter(lambda x: x['priority'] == 'high', tasks))
        mediumPriority = list(filter(lambda x: x['priority'] == 'medium', tasks))
        lowPriority = list(filter(lambda x: x['priority'] == 'low', tasks))

        new_list = [*lowPriority, *mediumPriority, *highPriority]

    
    return jsonify(new_list[::-1]), 200


if __name__ == '__main__':
    app.run(debug=True) # debug=True reinicia o servidor automaticamente em caso de mudanças


