// ---------- DATA ----------
let inventory = [];
let jobs = [];
let checkoutHistory = [];
let editingItemIndex = null;
let editingJobIndex = null;

// ---------- LOCAL STORAGE ----------
function loadData() {
  try {
    inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
  } catch(e) {
    console.error("Error parsing localStorage, resetting.", e);
    inventory = [];
    jobs = [];
    checkoutHistory = [];
    localStorage.clear();
  }
}

function saveData() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
  localStorage.setItem('jobs', JSON.stringify(jobs));
  localStorage.setItem('checkoutHistory', JSON.stringify(checkoutHistory));
}

// ---------- TAB SWITCHING ----------
const tabs = document.querySelectorAll('.sidebar nav button');
const tabSections = document.querySelectorAll('.tab-section');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    tabSections.forEach(sec => sec.classList.toggle('active', sec.id === target));
    renderDashboard();
    renderInventoryList();
    renderJobs();
    renderHistory();
  });
});

// ---------- DASHBOARD ----------
function renderDashboard() {
  const container = document.getElementById('inventory-dashboard');
  const filter = document.getElementById('filter-category').value;
  container.innerHTML = '';
  inventory.forEach((item, index) => {
    if(filter !== 'All' && item.category !== filter) return;
    const card = document.createElement('div');
    card.className = 'inventory-card';
    card.innerHTML = `
      <div class="category-badge category-${item.category.toLowerCase()}">${item.category}</div>
      <h3>${item.gear}</h3>
      <p>Shop #: ${item.shopNumber}</p>
      <div class="card-buttons">
        <button onclick="editItem(${index})">Edit</button>
        <button onclick="deleteItem(${index})">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------- INVENTORY LIST ----------
function renderInventoryList() {
  const container = document.getElementById('item-list-container');
  container.innerHTML = '';
  if(inventory.length === 0) {
    container.innerHTML = '<p>No inventory items.</p>';
    return;
  }
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Category</th>
        <th>Gear</th>
        <th>Shop #</th>
        <th>Group</th>
        <th>Serial</th>
        <th>Condition</th>
        <th>Value</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${inventory.map((item, index) => `
        <tr>
          <td>${item.category}</td>
          <td>${item.gear}</td>
          <td>${item.shopNumber}</td>
          <td>${item.group}</td>
          <td>${item.serial}</td>
          <td>${item.condition}</td>
          <td>${item.value || ''}</td>
          <td>
            <button onclick="editItem(${index})">Edit</button>
            <button onclick="deleteItem(${index})">Delete</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// ---------- INVENTORY CRUD ----------
document.getElementById('add-item-btn').onclick = () => openItemModal();

function openItemModal() {
  editingItemIndex = null;
  document.getElementById('item-form').reset();
  document.getElementById('item-modal').style.display = 'flex';
}

function closeItemModal() {
  document.getElementById('item-modal').style.display = 'none';
}

document.getElementById('item-form').addEventListener('submit', e => {
  e.preventDefault();
  const newItem = {
    category: document.getElementById('item-category').value,
    gear: document.getElementById('item-gear').value,
    shopNumber: document.getElementById('item-shop').value,
    group: document.getElementById('item-group').value,
    serial: document.getElementById('item-serial').value,
    condition: document.getElementById('item-condition').value,
    value: document.getElementById('item-value').value
  };
  if(editingItemIndex !== null) {
    inventory[editingItemIndex] = newItem;
  } else {
    inventory.push(newItem);
  }
  saveData();
  closeItemModal();
  renderDashboard();
  renderInventoryList();
});

function editItem(index) {
  editingItemIndex = index;
  const item = inventory[index];
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-gear').value = item.gear;
  document.getElementById('item-shop').value = item.shopNumber;
  document.getElementById('item-group').value = item.group;
  document.getElementById('item-serial').value = item.serial;
  document.getElementById('item-condition').value = item.condition;
  document.getElementById('item-value').value = item.value;
  document.getElementById('item-modal').style.display = 'flex';
}

function deleteItem(index) {
  if(confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index,1);
    saveData();
    renderDashboard();
    renderInventoryList();
  }
}

// ---------- JOBS ----------
document.getElementById('new-job-btn').onclick = () => openJobModal();

function openJobModal() {
  editingJobIndex = null;
  document.getElementById('job-form').reset();
  const list = document.getElementById('job-items-list');
  list.innerHTML = '';
  inventory.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `<label><input type="checkbox" value="${item.shopNumber}"> ${item.gear} (${item.shopNumber})</label>`;
    list.appendChild(div);
  });
  document.getElementById('job-modal').style.display = 'flex';
}

function closeJobModal() {
  document.getElementById('job-modal').style.display = 'none';
}

document.getElementById('job-form').addEventListener('submit', e => {
  e.preventDefault();
  const job = {
    jobName: document.getElementById('job-name').value,
    clientName: document.getElementById('client-name').value,
    clientPhone: document.getElementById('client-phone').value,
    clientContact: document.getElementById('client-contact').value,
    clientEmail: document.getElementById('client-email').value,
    clientBilling: document.getElementById('client-billing').value,
    jobVenue: document.getElementById('job-venue').value,
    jobDate: document.getElementById('job-date').value,
    notes: document.getElementById('job-notes').value,
    items: Array.from(document.querySelectorAll('#job-items-list input:checked')).map(cb => ({shopNumber: cb.value})),
    archived: false
  };
  if(editingJobIndex !== null) {
    jobs[editingJobIndex] = job;
  } else {
    jobs.push(job);
  }
  saveData();
  closeJobModal();
  renderJobs();
});

function renderJobs() {
  const activeContainer = document.getElementById('jobs-list');
  const archivedContainer = document.getElementById('archived-jobs-list');
  activeContainer.innerHTML = '';
  archivedContainer.innerHTML = '';
  jobs.forEach((job, index) => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <strong>${job.jobName}</strong> | ${job.clientName || 'No client'} 
      <div class="card-buttons">
        <button onclick="editJob(${index})">Edit</button>
        <button onclick="archiveJob(${index})">${job.archived ? 'Unarchive' : 'Archive'}</button>
        <button onclick="checkoutJob(${index})">Check Out</button>
        <button onclick="checkinJob(${index})">Check In</button>
        <button onclick="exportJobCSV(${index})">Export CSV</button>
      </div>
    `;
    if(job.archived) archivedContainer.appendChild(div);
    else activeContainer.appendChild(div);
  });
}

function editJob(index) {
  editingJobIndex = index;
  const job = jobs[index];
  document.getElementById('job-name').value = job.jobName;
  document.getElementById('client-name').value = job.clientName;
  document.getElementById('client-phone').value = job.clientPhone;
  document.getElementById('client-contact').value = job.clientContact;
  document.getElementById('client-email').value = job.clientEmail;
  document.getElementById('client-billing').value = job.clientBilling;
  document.getElementById('job-venue').value = job.jobVenue;
  document.getElementById('job-date').value = job.jobDate;
  document.getElementById('job-notes').value = job.notes;
  const list = document.getElementById('job-items-list');
  list.innerHTML = '';
  inventory.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `<label><input type="checkbox" value="${item.shopNumber}" ${job.items.some(i=>i.shopNumber===item.shopNumber)?'checked':''}> ${item.gear} (${item.shopNumber})</label>`;
    list.appendChild(div);
  });
  document.getElementById('job-modal').style.display = 'flex';
}

function archiveJob(index) {
  jobs[index].archived = !jobs[index].archived;
  saveData();
  renderJobs();
}

// ---------- CHECKOUT / CHECKIN ----------
function checkoutJob(index) {
  const job = jobs[index];
  if(!job.items || job.items.length === 0) return alert("No items assigned to this job.");
  const date = new Date().toLocaleString();
  job.items.forEach(itemRef => {
    const item = inventory.find(i => i.shopNumber === itemRef.shopNumber);
    if(item) checkoutHistory.push({
      date,
      action: "Checked Out",
      item: item.gear,
      shopNumber: item.shopNumber
    });
  });
  saveData();
  renderHistory();
  alert("Items checked out!");
}

function checkinJob(index) {
  const job = jobs[index];
  if(!job.items || job.items.length === 0) return alert("No items assigned to this job.");
  const date = new Date().toLocaleString();
  job.items.forEach(itemRef => {
    const item = inventory.find(i => i.shopNumber === itemRef.shopNumber);
    if(item) checkoutHistory.push({
      date,
      action: "Checked In",
      item: item.gear,
      shopNumber: item.shopNumber
    });
  });
  saveData();
  renderHistory();
  alert("Items checked in!");
}

// ---------- EXPORT JOB PULLSHEET ----------
function exportJobCSV(index) {
  const job = jobs[index];
  if(!job.items || job.items.length === 0) return alert("No items to export.");
  let csv = "Job Name,Client,Shop #,Gear,Serial,Condition,Value\n";
  job.items.forEach(itemRef => {
    const item = inventory.find(i => i.shopNumber === itemRef.shopNumber);
    if(item) {
      csv += `"${job.jobName}","${job.clientName || ''}","${item.shopNumber}","${item.gear}","${item.serial || ''}","${item.condition || ''}","${item.value || ''}"\n`;
    }
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${job.jobName.replace(/\s+/g,'_')}_pullsheet.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ---------- HISTORY ----------
function renderHistory() {
  const container = document.getElementById('history-list');
  container.innerHTML = '';
  if(checkoutHistory.length === 0) return container.innerHTML='<p>No history yet.</p>';
  checkoutHistory.forEach(h => {
    const div = document.createElement('div');
    div.innerText = `${h.date} | ${h.action} | ${h.item} | Shop #: ${h.shopNumber}`;
    container.appendChild(div);
  });
}

// ---------- FILTER ----------
document.getElementById('filter-category').addEventListener('change', renderDashboard);

// ---------- INITIAL LOAD ----------
loadData();
renderDashboard();
renderInventoryList();
renderJobs();
renderHistory();