// ----------------- Navigation -----------------
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(item.dataset.section).classList.add('active');

        if(item.dataset.section === 'dashboard') loadReports();
        if(item.dataset.section === 'products') fetchProducts();
        if(item.dataset.section === 'tasks') fetchTasks();
        if(item.dataset.section === 'settings') fetchSettings();
    });
});

// ----------------- API Base -----------------
const API_BASE = "http://127.0.0.1:5000";

// ----------------- Products -----------------
const productList = document.getElementById('productList');
const addProductBtn = document.getElementById('addProductBtn');

async function fetchProducts() {
    const res = await fetch(`${API_BASE}/products`);
    const products = await res.json();
    displayProducts(products);
}

function displayProducts(products) {
    productList.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.className = p.status === 'Completed' ? 'completed' : '';
        li.innerHTML = `
            <span>${p.product_name} | $${p.price} | Qty: ${p.quantity} | Priority: ${p.priority} | Due: ${p.due_date || '-'}</span>
            <select class="status-select">
                <option value="Pending" ${p.status==='Pending'?'selected':''}>Pending</option>
                <option value="In Progress" ${p.status==='In Progress'?'selected':''}>In Progress</option>
                <option value="Completed" ${p.status==='Completed'?'selected':''}>Completed</option>
            </select>
            <button class="delete-btn">Delete</button>
        `;
        li.querySelector('.status-select').addEventListener('change', e => updateProductStatus(p.id, e.target.value));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(p.id));
        productList.appendChild(li);
    });
}

addProductBtn.addEventListener('click', async () => {
    const product_name = document.getElementById('product_name').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const priority = document.getElementById('priority').value;
    const due_date = document.getElementById('due_date').value || null;

    if(!product_name || isNaN(price) || isNaN(quantity)) return alert("Fill all fields");

    await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({product_name, price, quantity, priority, due_date})
    });

    document.getElementById('product_name').value='';
    document.getElementById('price').value='';
    document.getElementById('quantity').value='';
    document.getElementById('priority').value='Medium';
    document.getElementById('due_date').value='';

    fetchProducts();
});

async function updateProductStatus(id, status) {
    await fetch(`${API_BASE}/products/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status})
    });
    fetchProducts();
}

async function deleteProduct(id) {
    await fetch(`${API_BASE}/products/${id}`, {method:"DELETE"});
    fetchProducts();
}

// ----------------- Tasks -----------------
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');

async function fetchTasks() {
    const res = await fetch(`${API_BASE}/tasks`);
    const tasks = await res.json();
    displayTasks(tasks);
}

function displayTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = t.status==='Completed'?'completed':'';
        li.innerHTML = `
            <span>${t.title} | ${t.description || '-'} | Priority: ${t.priority} | Created: ${t.created_at}</span>
            <select class="status-select">
                <option value="Pending" ${t.status==='Pending'?'selected':''}>Pending</option>
                <option value="In Progress" ${t.status==='In Progress'?'selected':''}>In Progress</option>
                <option value="Completed" ${t.status==='Completed'?'selected':''}>Completed</option>
            </select>
            <button class="delete-btn">Delete</button>
        `;
        li.querySelector('.status-select').addEventListener('change', e => updateTaskStatus(t.id, e.target.value));
        li.querySelector('.delete-btn').addEventListener('click', ()=> deleteTask(t.id));
        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener('click', async () => {
    const title = document.getElementById('task_title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('task_priority').value;

    if(!title) return alert("Fill task title");

    await fetch(`${API_BASE}/tasks`, {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({title, description, priority})
    });

    document.getElementById('task_title').value='';
    document.getElementById('description').value='';
    document.getElementById('task_priority').value='Medium';

    fetchTasks();
});

async function updateTaskStatus(id, status) {
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status})
    });
    fetchTasks();
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, {method:"DELETE"});
    fetchTasks();
}

// ----------------- Reports -----------------
async function loadReports() {
    const res = await fetch(`${API_BASE}/reports`);
    const data = await res.json();
    const container = document.getElementById('dashboard-stats');
    container.innerHTML = `
        <p>Total Products: ${data.total_products}</p>
        <p>Completed Products: ${data.completed_products}</p>
        <p>Total Tasks: ${data.total_tasks}</p>
        <p>Completed Tasks: ${data.completed_tasks}</p>
    `;
}

// ----------------- Settings -----------------
const settingsList = document.getElementById('settingsList');
const addSettingBtn = document.getElementById('addSettingBtn');

async function fetchSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    const settings = await res.json();
    displaySettings(settings);
}

function displaySettings(settings) {
    settingsList.innerHTML = '';
    settings.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${s.name}: ${s.value}</span>
            <button class="delete-btn">Delete</button>
        `;
        li.querySelector('.delete-btn').addEventListener('click', ()=> deleteSetting(s.id));
        settingsList.appendChild(li);
    });
}

addSettingBtn.addEventListener('click', async () => {
    const name = document.getElementById('setting_name').value;
    const value = document.getElementById('setting_value').value;
    if(!name || !value) return alert("Fill setting name and value");

    await fetch(`${API_BASE}/settings`, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, value})
    });

    document.getElementById('setting_name').value='';
    document.getElementById('setting_value').value='';
    fetchSettings();
});

async function deleteSetting(id) {
    await fetch(`${API_BASE}/settings/${id}`, {method:"DELETE"});
    fetchSettings();
}

// ----------------- Initial Load -----------------
loadReports();
fetchProducts();
fetchTasks();
fetchSettings();
