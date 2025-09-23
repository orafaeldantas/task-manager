
import datetime
import json
from pathlib import Path


class Task:
    def __init__(self, id, title, details, taskDeadline, taskDeadlineTime=None, priority="low"):
        self.id = id
        self.title = title
        self.details = details
        self.completed = False
        self.priority = priority
        self.date_created = datetime.datetime.now().strftime("%d/%m/%Y - %H:%M") # Variable responsible for obtaining the time in the system when the task was created

        date_deadline_no_format = datetime.datetime.strptime(taskDeadline, "%Y-%m-%d")
        date_deadline = date_deadline_no_format.strftime("%d/%m/%Y")

        if not taskDeadlineTime:
            taskDeadlineTime = "Hora não definida"

        self.task_deadline = f"{date_deadline} - {taskDeadlineTime}"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "priority": self.priority,
            "date": self.date_created,
            "details": self.details,
            "taskDeadline": self.task_deadline,
        }

class TaskManager:
    def __init__(self, filename="tasks.json"):
        self.file = Path(filename)
        self.tasks = self.load_tasks()

    def load_tasks(self):
        if not self.file.exists():
            return []
        with open(self.file, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError: # Empty or poorly formatted JSON
                return []

    def save_tasks(self):
        with open(self.file, "w") as f:
            json.dump(self.tasks, f, indent=4)

    def next_id(self):
        if not self.tasks:
            return 1
        return int(self.tasks[-1]["id"]) + 1

    def add_task(self, title, details, taskDeadline, taskDeadlineTime):
        task = Task(
            id=self.next_id(),
            title=title,
            details=details,
            taskDeadline=taskDeadline,
            taskDeadlineTime=taskDeadlineTime
        )
        task_dict = task.to_dict()
        self.tasks.append(task_dict)
        self.save_tasks()
        return task_dict

    def get_task(self, task_id):
        return next((t for t in self.tasks if t["id"] == task_id), None) 
    
    def list_tasks(self):
        return self.tasks
    
    def update_task(self, task_id, updates):
        task = self.get_task(task_id)
        if not task:
            return None
        task.update(updates)
        self.save_tasks()
        return task
    
    def delete_task(self, task_id):
        task = self.get_task(task_id)
        if not task:
            return False
        self.tasks.remove(task)
        self.save_tasks()
        return True    
