const authView = document.querySelector("#authView");
const dashboardView = document.querySelector("#dashboardView");
const loginTab = document.querySelector("#loginTab");
const registerTab = document.querySelector("#registerTab");
const authForm = document.querySelector("#authForm");
const authSubmit = document.querySelector("#authSubmit");
const authStatus = document.querySelector("#authStatus");
const nameInput = document.querySelector("#nameInput");
const transactionForm = document.querySelector("#transactionForm");
const transactionStatus = document.querySelector("#transactionStatus");
const transactionList = document.querySelector("#transactionList");
const transactionCount = document.querySelector("#transactionCount");
const balanceValue = document.querySelector("#balanceValue");
const incomeValue = document.querySelector("#incomeValue");
const expenseValue = document.querySelector("#expenseValue");
const recurringForm = document.querySelector("#recurringForm");
const recurringList = document.querySelector("#recurringList");
const recurringCount = document.querySelector("#recurringCount");
const recurringValue = document.querySelector("#recurringValue");
const logoutButton = document.querySelector("#logoutButton");
const refreshButton = document.querySelector("#refreshButton");

const TOKEN_KEY = "fintrack.token";
const RECURRING_KEY = "fintrack.recurringExpenses";

let authMode = "login";
let token = localStorage.getItem(TOKEN_KEY);
let userId = token ? getUserIdFromToken(token) : null;
let recurringExpenses = loadRecurringExpenses();

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function setStatus(element, message, type = "") {
    element.textContent = message;
    element.className = `status-message ${type}`.trim();
}

function setAuthMode(mode) {
    authMode = mode;
    const isRegister = mode === "register";
    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);
    document.querySelectorAll(".register-only").forEach((item) => {
        item.classList.toggle("hidden", !isRegister);
    });
    nameInput.required = isRegister;
    authSubmit.textContent = isRegister ? "Cadastrar" : "Entrar";
    setStatus(authStatus, "");
}

function getUserIdFromToken(value) {
    try {
        const payload = value.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padding = "=".repeat((4 - normalized.length % 4) % 4);
        const decoded = JSON.parse(atob(normalized + padding));
        return decoded.sub;
    } catch (error) {
        return null;
    }
}

function requestOptions(method, body) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return { method, headers, body };
}

async function request(path, options = {}) {
    const response = await fetch(path, options);
    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || "Erro ao comunicar com a API.");
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}

function loadRecurringExpenses() {
    try {
        return JSON.parse(localStorage.getItem(RECURRING_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveRecurringExpenses() {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(recurringExpenses));
}

function createId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showDashboard() {
    authView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
    renderRecurringExpenses();
}

function showAuth() {
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
}

async function handleAuth(event) {
    event.preventDefault();
    setStatus(authStatus, "Carregando...");

    const formData = new FormData(authForm);
    const params = new URLSearchParams();
    if (authMode === "register") {
        params.set("name", formData.get("name"));
    }
    params.set("email", formData.get("email"));
    params.set("password", formData.get("password"));

    try {
        const path = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
        token = await request(path, {
            method: "POST",
            body: params
        });
        userId = getUserIdFromToken(token);
        localStorage.setItem(TOKEN_KEY, token);
        authForm.reset();
        showDashboard();
        await loadDashboard();
    } catch (error) {
        setStatus(authStatus, error.message, "error");
    }
}

async function loadDashboard() {
    if (!token || !userId) {
        showAuth();
        return;
    }

    try {
        const transactions = await request(`/api/transactions?userId=${encodeURIComponent(userId)}`, requestOptions("GET"));
        renderTransactions(transactions);
        updateTotals(transactions);
        setStatus(transactionStatus, "");
    } catch (error) {
        renderTransactions([]);
        updateTotals([]);
        setStatus(transactionStatus, error.message, "error");
    }
}

function updateTotals(transactions) {
    const totals = transactions.reduce((acc, item) => {
        const amount = Number(item.amount || 0);
        if (item.type === "INCOME") {
            acc.income += amount;
            acc.balance += amount;
        } else {
            acc.expense += amount;
            acc.balance -= amount;
        }
        return acc;
    }, { income: 0, expense: 0, balance: 0 });

    balanceValue.textContent = currencyFormatter.format(totals.balance);
    incomeValue.textContent = currencyFormatter.format(totals.income);
    expenseValue.textContent = currencyFormatter.format(totals.expense);
}

function renderTransactions(transactions) {
    transactionList.innerHTML = "";
    transactionCount.textContent = `${transactions.length} ${transactions.length === 1 ? "item" : "itens"}`;

    if (!transactions.length) {
        transactionList.innerHTML = `<div class="empty-state">Nenhuma transação cadastrada.</div>`;
        return;
    }

    transactions.forEach((item) => {
        const isExpense = item.type === "EXPENSE";
        const row = document.createElement("article");
        row.className = `transaction-row ${isExpense ? "expense-row" : ""}`;
        row.innerHTML = `
            <span class="type-dot" aria-hidden="true"></span>
            <div class="transaction-main">
                <strong>${escapeHtml(item.description)}</strong>
                <span>${formatDate(item.date)} - ${isExpense ? "Despesa" : "Receita"}</span>
            </div>
            <span class="transaction-amount ${isExpense ? "expense" : "income"}">
                ${isExpense ? "-" : "+"}${currencyFormatter.format(Number(item.amount || 0))}
            </span>
        `;
        transactionList.appendChild(row);
    });
}

function renderRecurringExpenses() {
    recurringList.innerHTML = "";
    recurringCount.textContent = `${recurringExpenses.length} ${recurringExpenses.length === 1 ? "item" : "itens"}`;

    const monthlyTotal = recurringExpenses.reduce((total, item) => total + Number(item.amount || 0), 0);
    recurringValue.textContent = currencyFormatter.format(monthlyTotal);

    if (!recurringExpenses.length) {
        recurringList.innerHTML = `<div class="empty-state">Nenhum gasto recorrente cadastrado.</div>`;
        return;
    }

    recurringExpenses
        .slice()
        .sort((a, b) => Number(a.day) - Number(b.day))
        .forEach((item) => {
            const row = document.createElement("article");
            row.className = "recurring-row";
            row.innerHTML = `
                <div class="recurring-main">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>Todo dia ${item.day}</span>
                </div>
                <span class="recurring-amount">${currencyFormatter.format(Number(item.amount || 0))}</span>
                <button class="icon-button" type="button" data-recurring-id="${item.id}" aria-label="Remover ${escapeHtml(item.name)}">×</button>
            `;
            recurringList.appendChild(row);
        });
}

function formatDate(value) {
    if (!value) {
        return "Sem data";
    }
    return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function handleTransaction(event) {
    event.preventDefault();
    setStatus(transactionStatus, "Salvando...");

    const description = document.querySelector("#descriptionInput").value.trim();
    const amount = document.querySelector("#amountInput").value;
    const type = document.querySelector("input[name='type']:checked").value;

    const params = new URLSearchParams({
        description,
        amount,
        type,
        userId
    });

    try {
        await request("/api/transactions", requestOptions("POST", params));
        transactionForm.reset();
        document.querySelector("input[name='type'][value='INCOME']").checked = true;
        setStatus(transactionStatus, "Transação salva.", "success");
        await loadDashboard();
    } catch (error) {
        setStatus(transactionStatus, error.message, "error");
    }
}

function handleRecurringExpense(event) {
    event.preventDefault();

    const nameInput = document.querySelector("#recurringNameInput");
    const amountInput = document.querySelector("#recurringAmountInput");
    const dayInput = document.querySelector("#recurringDayInput");
    const amount = Number(amountInput.value);
    const day = Number(dayInput.value);

    if (!nameInput.value.trim() || amount <= 0 || day < 1 || day > 31) {
        return;
    }

    recurringExpenses.push({
        id: createId(),
        name: nameInput.value.trim(),
        amount,
        day
    });

    saveRecurringExpenses();
    recurringForm.reset();
    renderRecurringExpenses();
}

function handleRecurringListClick(event) {
    const button = event.target.closest("[data-recurring-id]");
    if (!button) {
        return;
    }

    recurringExpenses = recurringExpenses.filter((item) => item.id !== button.dataset.recurringId);
    saveRecurringExpenses();
    renderRecurringExpenses();
}

function logout() {
    token = null;
    userId = null;
    localStorage.removeItem(TOKEN_KEY);
    showAuth();
}

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));
authForm.addEventListener("submit", handleAuth);
transactionForm.addEventListener("submit", handleTransaction);
recurringForm.addEventListener("submit", handleRecurringExpense);
recurringList.addEventListener("click", handleRecurringListClick);
logoutButton.addEventListener("click", logout);
refreshButton.addEventListener("click", loadDashboard);

setAuthMode("login");
renderRecurringExpenses();

if (token && userId) {
    showDashboard();
    loadDashboard();
} else {
    showAuth();
}

