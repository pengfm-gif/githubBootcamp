const storageKey = "todo-list-items";
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");

// 從瀏覽器讀取先前儲存的待辦事項。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch (error) {
    return [];
  }
}

let todos = loadTodos();

// 將目前清單保存到 localStorage。
function saveTodos() {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

// 依照目前資料重新繪製清單與未完成數量。
function renderTodos() {
  todoList.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `標記「${todo.text}」為完成`);
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  const incompleteCount = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成: ${incompleteCount} 項`;
  emptyState.hidden = todos.length > 0;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    return;
  }

  todos.push({
    id: Date.now(),
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
  todoInput.value = "";
  todoInput.focus();
});

renderTodos();