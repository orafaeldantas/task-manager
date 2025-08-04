// No seu script.js do frontend

const addTaskButton = document.getElementById('task-input');
const addTaskDetails = document.getElementById('taskDescription');
const addTaskDeadline = document.getElementById('taskDeadline');
const addTaskDeadlineTime = document.getElementById('taskTime');
const taskList = document.getElementById('taskList');
const buttonTask = document.getElementById('add-task-btn')
let statusBtn = false;
let titleUpdate;
let completedUpdate;
let idUpdate;
let txtPriority = 'B'

async function addTaskToBackend() {   
        try {
            if (statusBtn == false){
                const response = await fetch('http://127.0.0.1:5000/tasks', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json'
                    },
                        body: JSON.stringify({ 
                            title: addTaskButton.value, 
                            details: addTaskDetails.value,
                            taskDeadline: addTaskDeadline.value,
                            taskDeadlineTime: addTaskDeadlineTime.value
                        })
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }

                const newTask = await response.json();
                console.log('Tarefa adicionada no backend:', newTask);  

            } else {
                statusBtn = false;
                const response = await fetch(`http://127.0.0.1:5000/tasks/${idUpdate}`, {
                        method: 'PUT', 
                        headers: {
                        'Content-Type': 'application/json'
                    },
                        body: JSON.stringify({title: addTaskButton.value, completed: completedUpdate})                                     
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                } 
        }                  
            await getTasks();            

        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    } 

// ============================= getTasks =============================

async function getTasks() {
    try {
        const response = await fetch('http://127.0.0.1:5000/tasks', {
        method: 'GET', // Método padrão para buscar dados, mas é bom ser explícito
        headers: {
        'Accept': 'application/json' // <--- ADICIONE ESTA LINHA!
        }
    }); 

    if (!response.ok) {
                // Se a resposta não for OK, tenta ler o erro (que ainda pode não ser JSON se a rota falhou antes)
        const errorText = await response.text(); // Lê como texto primeiro
        console.error('Erro HTTP ao carregar lista:', response.status, errorText);
        throw new Error(`Erro ao carregar lista: ${response.status} - ${errorText.substring(0, 100)}...`); // Limita para não mostrar HTML completo no erro
    }
     
    if (statusBtn == false){
        buttonTask.textContent = 'Adicionar';
    }
    const task = await response.json(); // Agora deve ser JSON válido
    displayTasks(task);
    addTaskButton.value = "";
    addTaskDetails.value = "";
    addTaskDeadline.value = "";
    addTaskDeadlineTime.value ="";

    } catch (error) {
        console.error('Erro ao buscar o lista:', error);
        alert(`Não foi possível carregar o lista: ${error.message}`);
    }
}

// ============================= listTasks =============================

async function listTasks(mode) {
    try {
            const response = await fetch(`http://127.0.0.1:5000/tasks/${mode}`, {
            method: 'GET', 
            headers: {
            'Accept': 'application/json' 
            }
        }); 

        if (!response.ok) {
                    // Se a resposta não for OK, tenta ler o erro (que ainda pode não ser JSON se a rota falhou antes)
            const errorText = await response.text(); // Lê como texto primeiro
            console.error('Erro HTTP ao carregar lista:', response.status, errorText);
            throw new Error(`Erro ao carregar lista: ${response.status} - ${errorText.substring(0, 100)}...`); // Limita para não mostrar HTML completo no erro
        }
        
        const task = await response.json();
        displayTasks(task);

        } catch (error) {
            console.error('Erro ao buscar o lista:', error);
            alert(`Não foi possível carregar o lista: ${error.message}`);
        }    
        
    }

// ============================= updateTask =============================
async function updateTasks(task_id, status) {
    try {

    let dataToUpdate = {}; 

    if (status === true || status === false) { 
        dataToUpdate = { completed: status };
    } else {
        dataToUpdate = { priority: status };
    }
        const response = await fetch(`http://127.0.0.1:5000/tasks/${task_id}`, {
        method: 'PUT', 
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToUpdate)
    }); 

    if (!response.ok) {
                // Se a resposta não for OK, tenta ler o erro (que ainda pode não ser JSON se a rota falhou antes)
        const errorText = await response.text(); // Lê como texto primeiro
        console.error('Erro HTTP ao atualizar lista:', response.status, errorText);
        throw new Error(`Erro ao atualizar lista: ${response.status} - ${errorText.substring(0, 100)}...`); // Limita para não mostrar HTML completo no erro
    }
  
    getTasks()

    } catch (error) {
        console.error('Erro ao atualizar a lista:', error);
        alert(`Não foi possível atualizar a lista: ${error.message}`);
    }
}

// ============================= deleteTask =============================
async function deleteTask(task_id){
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${task_id}`, {
        method: 'DELETE', 
        headers: {
        'Content-Type': 'application/json'
        },
    }); 

    if (!response.ok) {
                // Se a resposta não for OK, tenta ler o erro (que ainda pode não ser JSON se a rota falhou antes)
        const errorText = await response.text(); // Lê como texto primeiro
        console.error('Erro HTTP ao excluir tarefa:', response.status, errorText);
        throw new Error(`Erro ao ao excluir tarefa: ${response.status} - ${errorText.substring(0, 100)}...`); // Limita para não mostrar HTML completo no erro
    }
        
    getTasks()

    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        alert(`Não foi possível excluir a tarefa: ${error.message}`);
    }
}

// ============================= editTask =============================
async function editTask(task_id){
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${task_id}/edit`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
                }
            }); 

        const task = await response.json();
        addTaskButton.value = task.title; 
        addTaskDetails.value = task.details;             

        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
            alert(`Não foi possível editar a tarefa: ${error.message}`);
        }
}


// ============================= displayTasks =============================
function displayTasks(taskArray) {
    const taskList = document.getElementById('taskList'); // Assuming taskList is defined elsewhere, but good to make it explicit
    taskList.innerHTML = ''; // Clears current content

    if (taskArray && taskArray.length > 0) {
        taskArray.forEach(item => {
            const li_master = document.createElement('li');
            const ul_slave = document.createElement('ul');
            const li_slave = document.createElement('li');

            ul_slave.id = 'task_ul_slave';
            li_slave.id = 'task_li_slave';
            li_master - 'task_li_master';

            // Create task title span
            const taskTitle = document.createElement('span');
            taskTitle.textContent = `${item.id} | ${item.title}`;
            if (item.completed) {
                taskTitle.style.textDecoration = 'line-through'; // Cross out completed tasks
            }
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkboxTask_${item.id}`; // Unique ID for each checkbox
            checkbox.name = 'taskCompleted';
            // Set checked state based on your item data (e.g., if item.completed is true)
            if (item.completed) { // Assuming your task item has a 'completed' property
                checkbox.checked = true;
            }
            checkbox.addEventListener('change', () => {

                const taskId = item.id;
                const isCompleted = checkbox.checked; // Pega o novo status
                let status = false;

                if (isCompleted) {
                    console.log(`Tarefa ${taskId} marcada como concluída.`);
                    taskTitle.style.textDecoration = 'line-through'; // Risca o texto imediatamente
                    status = true;
                    

                } else {
                    console.log(`Tarefa ${taskId} desmarcada.`);
                    taskTitle.style.textDecoration = 'none';
                    status = false;
                }

                updateTasks(item.id, status)
            });

            // Create label for the checkbox
            const label = document.createElement('label');
            label.htmlFor = `checkboxTask_${item.id}`;
            label.textContent = 'Concluída';

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.id = `btnExcluirTask_${item.id}`; // Unique ID for each button
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('btnDelete');
            deleteButton.onclick = () => {

                console.log(`Deleting task with ID: ${item.id}`);
                deleteTask(item.id)

            };

            const editButton = document.createElement('button');
            editButton.id = `btnEditarTask_${item.id}`; // Unique ID for each button
            editButton.classList.add('btnEdit');
            editButton.textContent = 'Editar';
            editButton.onclick = () => {

                console.log(`Edit task with ID: ${item.id}`);
                editTask(item.id);
                buttonTask.textContent = 'Salvar';
                titleUpdate = item.title;
                completedUpdate = item.completed;
                idUpdate = item.id
                statusBtn = true;
                                
            };

            const priorityButton = document.createElement('button');
            priorityButton.id = `btnPriority_${item.id}`;
            priorityButton.classList.add('btnPriority');
            if (item.priority == 'low') {
                priorityButton.textContent = 'B';
                priorityButton.style.backgroundColor =' #6C757D';
            } else if (item.priority == 'medium') {
                priorityButton.textContent = 'M';
                priorityButton.style.backgroundColor = ' #FFD700';
            } else {
                priorityButton.textContent = 'A';
                priorityButton.style.backgroundColor =' #FF4500';
            }

            priorityButton.onclick = () => {
                let statusPriority;
                if (priorityButton.textContent == 'B') {
                    statusPriority = 'medium';
                }
                else if (priorityButton.textContent == 'M') {
                    statusPriority = 'high';
                }
                else {
                    statusPriority = 'low'; 
                }

                updateTasks(item.id, statusPriority);
                           
            };

            const detailsButton = document.createElement('button');
            detailsButton.id = `btnDetails_${item.id}`;
            detailsButton.classList.add('btnDetails');
            detailsButton.textContent = '+';

            detailsButton.onclick = () => {
                const taskContainer = li_master; // Ou detailsButton.closest('.task-item');

                const existingDetailsDiv = taskContainer.querySelector(`#detailsContainer_${item.id}`);

                if (existingDetailsDiv) {
                    existingDetailsDiv.remove();
                    detailsButton.textContent = '+';
                } else {
                    const detailsDiv = document.createElement('div');
                    detailsDiv.id = `detailsContainer_${item.id}`;
                    detailsDiv.classList.add('task-details'); // Classe para estilização

                    // Conteúdo dos detalhes
                    /*const labelDetails = document.createElement('label');
                    labelDetails.textContent = `Detalhes da Tarefa ID: ${item.id} - Mais informações aqui.`;
                    detailsDiv.appendChild(labelDetails);*/

                    const labelStatus = document.createElement('label')
                    labelStatus.classList.add('labelStatus');
                    if (item.completed == false) {
                        labelStatus.textContent = 'Tarefa não concluida.';
                        labelStatus.classList.add('labelStatusFalse');
                    } else {
                        labelStatus.textContent = 'Tarefa concluida.';
                        labelStatus.classList.add('labelStatusTrue');
                    }
                    detailsDiv.appendChild(labelStatus);

                    const otherDetail = document.createElement('p');
                    otherDetail.textContent = item.details;
                    detailsDiv.appendChild(otherDetail);

                    const date = document.createElement('p');
                    date.classList.add('dateText');
                    date.textContent = 'Início da tarefa: ' + item.date;
                    detailsDiv.appendChild(date);

                    const taskDeadline = document.createElement('p');
                    taskDeadline.classList.add('deadline');
                    taskDeadline.textContent = 'Prazo da tarefa: ' + item.taskDeadline;
                    detailsDiv.appendChild(taskDeadline);

                    detailsButton.textContent = '-';

                    li_master.appendChild(detailsDiv);
                }
            };            
                                      
            
            li_slave.appendChild(taskTitle);
            li_slave.appendChild(checkbox);
            li_slave.appendChild(label);            
            li_slave.appendChild(deleteButton);
            li_slave.appendChild(editButton);
            li_slave.appendChild(priorityButton);
            li_slave.appendChild(detailsButton)

            ul_slave.appendChild(li_slave);

            li_master.appendChild(ul_slave);

            taskList.appendChild(li_master);

        });
    } else {


        const li = document.createElement('li');
        li.id = 'noHistoryMessage';
        li.textContent = 'Nenhuma tarefa listada.';
        taskList.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', getTasks);
