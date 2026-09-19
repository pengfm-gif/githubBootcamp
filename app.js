const storageKey = "todo-list-items";
const themeStorageKey = "todo-list-theme";
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");
const filterButtons = document.querySelectorAll("[data-filter]");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

let currentFilter = "all";

// 套用使用者選擇的主題，沒有手動選擇時則跟隨系統設定。
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeLabel.textContent = isDark ? "淺色模式" : "深色模式";
  themeToggle.setAttribute("aria-label", isDark ? "切換至淺色模式" : "切換至深色模式");
}

function getInitialTheme() {
  return localStorage.getItem(themeStorageKey) || (systemTheme.matches ? "dark" : "light");
}

applyTheme(getInitialTheme());

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
});

systemTheme.addEventListener("change", (event) => {
  if (!localStorage.getItem(themeStorageKey)) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

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

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

function getEmptyMessage() {
  if (currentFilter === "active") {
    return "沒有未完成的待辦事項。";
  }
  if (currentFilter === "completed") {
    return "還沒有已完成的待辦事項。";
  }
  return "還沒有任何待辦事項，新增一個吧!";
}

// 依照目前資料重新繪製清單與未完成數量。
function renderTodos() {
  todoList.replaceChildren();

  getFilteredTodos().forEach((todo) => {
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
  const completedCount = todos.filter((todo) => todo.completed).length;
  remainingCount.textContent = `未完成: ${incompleteCount} 項`;
  clearCompletedButton.disabled = completedCount === 0;
  emptyState.textContent = getEmptyMessage();
  emptyState.hidden = getFilteredTodos().length > 0;
}

clearCompletedButton.addEventListener("click", () => {
  const hasCompletedTodos = todos.some((todo) => todo.completed);
  if (!hasCompletedTodos || !window.confirm("確定要清除所有已完成的事項嗎？此操作無法復原。")) {
    return;
  }

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderTodos();
  });
});

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