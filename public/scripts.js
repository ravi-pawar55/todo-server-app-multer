const todoListNode = document.getElementById("todoList");

function fetchAndDisplayTodos() {
  fetch("/todo-data")
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Unable to fetch todo data.");
      }
    })
    .then(function (data) {
      todoListNode.innerHTML = "";
      data.forEach(function (todo) {
        showTodoInUI(todo);
      });   
    })
    .catch(function (error) {
      console.error("Error fetching todo data:", error);
      alert("Something went wrong while fetching todos. Please try again later.");
    });
};

function showTodoInUI(todo) {
  const todoItemRow = document.createElement("tr");

  const checkboxCell = document.createElement("td");
  checkboxCell.classList.add("p-2");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("h-6", "w-6");
  checkbox.checked = todo.completed;

  const todoTextCell = document.createElement("td");
  todoTextCell.classList.add("p-2");

  const todoText = document.createElement("p");
  todoText.classList.add("text-lg", todo.completed ? "line-through" : "text-black-400", "break-all");
  todoText.innerText = todo.todoText;

  const todoImageCell = document.createElement("td");
  todoImageCell.classList.add("p-2");

  const todoImage = document.createElement("img");
  todoImage.src = todo.todoFile;
  todoImage.classList.add("h-16", "w-16"); 

  const todoPriorityCell = document.createElement("td");
  todoPriorityCell.classList.add("p-2");

  const todoPriority = document.createElement("p");
  todoPriority.classList.add("text-lg", "text-black-400");
  todoPriority.innerText = todo.priority;

  const deleteButtonCell = document.createElement("td");
  deleteButtonCell.classList.add("p-2");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("flex", "text-red-500", "border-2", "border-red-500", "p-2", "rounded-lg", "hover:text-white", "hover:bg-red-500");

  const deleteIcon = document.createElement("span");
  deleteIcon.innerText = "Delete";

  checkbox.addEventListener("change", function () {
    updateTodoStatus(todo.id, this.checked);
  });

  deleteButton.addEventListener("click", function () {
    deleteTodo(todo.id);
  });

  checkboxCell.appendChild(checkbox);
  todoTextCell.appendChild(todoText);
  todoImageCell.appendChild(todoImage);
  todoPriorityCell.appendChild(todoPriority);
  deleteButton.appendChild(deleteIcon);
  deleteButtonCell.appendChild(deleteButton);

  todoItemRow.appendChild(checkboxCell);
  todoItemRow.appendChild(todoTextCell);
  todoItemRow.appendChild(todoImageCell);
  todoItemRow.appendChild(todoPriorityCell);
  todoItemRow.appendChild(deleteButtonCell);

  const todoList = document.getElementById("todoList");
  todoList.appendChild(todoItemRow);
}

function updateTodoStatus(todoId, completed) {
  fetch(`/todo/${todoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  })
    .then(function (response) {
      if (response.status === 200) {
        fetchAndDisplayTodos(); 
      } else {
        throw new Error("Unable to update todo status.");
      }
    })
    .catch(function (error) {
      console.error("Error updating todo status:", error);
      alert("Something went wrong while updating the todo status. Please try again later.");
    });
}

function deleteTodo(todoId) {
  fetch(`/todo/${todoId}`, {
    method: "DELETE",
  })
    .then(function (response) {
      if (response.status === 200) {
        fetchAndDisplayTodos();
      } else {
        throw new Error("Unable to delete todo.");
      }
    })
    .catch(function (error) {
      console.error("Error deleting todo:", error);
      alert("Something went wrong while deleting the todo. Please try again later.");
    });
}

fetchAndDisplayTodos();
