// ------------------- LocalStorage -------------------
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let inventoryMode = 'view';

// ------------------- Typewriter Header -------------------
function typeWriter(elementId, text, speed=120){
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.style.borderRight = '.15em solid #3498db';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if(i >= text.length){
      clearInterval(interval);
      el.style.borderRight='none';
    }
  }, speed);
}
typeWriter('app-title', 'GearOps Manager', 120);

// ------------------- Tabs -------------------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(sec=>sec.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='dashboard') renderDashboard();
    if(btn.dataset.tab==='inventory') renderInventory();
    if(btn.dataset.tab==='jobs') renderJobs();
    if(btn.dataset.tab==='history') renderHistory();
  });
});

// ------------------- Inventory -------------------
function setInventoryMode(mode){ inventoryMode = mode; renderInventory(); }

function openAddItem(){
  document.getElementById('item-modal').style.display='block';
  document.getElementById('item-modal-title').innerText='Add Item';
  document.getElementById('item-form').reset();
  document.getElementById('item-form').onsubmit = saveNewItem;
}

function saveNewItem(e){
  e.preventDefault();
  const item = {
    category: document.getElementById('item-category').value,
    gear: document.getElementById('item-gear').value,
    group: document.getElementById('item-group').value,
    shopNumber: document.getElementById('item-shop').value,
    serial: document.getElementById('item-serial').value,
    condition: document.getElementById('item-condition').value,
    value: document.getElementById('item-value').value
  };
  inventory.push(item);
  saveInventory();
  closeItemModal();
  renderInventory();
}

function closeItemModal(){ document.getElementById('item-modal').style.display='none'; }

function editInventoryItem(index){
  const item = inventory[index];
  document.getElementById('item-modal').style.display='block';
  document.getElementById('item-modal-title').innerText='Edit Item';

  document.getElementById('item-category').value = item.category;
  document.getElementById('item-gear').value = item.gear;
  document.getElementById('item-group').value = item.group;
  document.getElementById('item-shop').value = item.shopNumber;
  document.getElementById('item-serial').value = item.serial;
  document.getElementById('item-condition').value = item.condition;
  document.getElementById('item-value').value = item.value;

  document.getElementById('item-form').onsubmit = function(e){
    e.preventDefault();
    item.category = document.getElementById('item-category').value;
    item.gear = document.getElementById('item-gear').value;
    item.group = document.getElementById('item-group').value;
    item.shopNumber = document.getElementById('item-shop').value;
    item.serial = document.getElementById('item-serial').value;
    item.condition = document.getElementById('item-condition').value;
    item.value = document.getElementById('item-value').value;
    saveInventory();
    closeItemModal();
    renderInventory();
  }
}

function deleteInventoryItem(index){
  const confirmDelete = confirm(`Are you sure you want to delete "${inventory[index].gear}"?`);
  if(!confirmDelete) return;
  inventory.splice(index,1);
  saveInventory();
  renderInventory();
}

function duplicateItem(index){
  const original = inventory[index];
  const newItem = {...original, serial:'', shopNumber:''};
  inventory.push(newItem);
  saveInventory();
  renderInventory();
}

function saveInventory(){ localStorage.setItem('inventory', JSON.stringify(inventory)); }

function renderInventory(){
  const container = document.getElementById('inventory-dashboard');
  container.innerHTML='';
  if(inventory.length===0){ container.innerHTML='<p>No inventory items.</p>'; return; }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th>Category</th>
    <th>Gear Item</th>
    <th>Group Name</th>
    <th>Shop #</th>
    <th>Serial #</th>
    <th>Condition</th>
    <th>Value (USD)</th>
    ${inventoryMode==='inventory'?'<th>+</th>':''}
    <th>Edit</th>
    <th>Delete</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  inventory.forEach((item,index)=>{
    const tr = document.createElement('tr');
    ['category','gear','group','shopNumber','serial','condition','value'].forEach(field=>{
      const td = document.createElement('td');
      td.textContent = item[field];
      tr.appendChild(td);
    });
    if(inventoryMode==='inventory'){
      const addTd = document.createElement('td');
      const addBtn = document.createElement('button');
      addBtn.textContent = '+';
      addBtn.onclick = ()=>duplicateItem(index);
      addTd.appendChild(addBtn);
      tr.appendChild(addTd);
    }
    const editTd = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = ()=>editInventoryItem(index);
    editTd.appendChild(editBtn);
    tr.appendChild(editTd);

    const deleteTd = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = ()=>deleteInventoryItem(index);
    deleteTd.appendChild(deleteBtn);
    tr.appendChild(deleteTd);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// ------------------- Jobs -------------------
function openAddJob(){
  document.getElementById('job-modal').style.display='block';
  document.getElementById('job-modal-title').innerText='New Job';
  document.getElementById('job-form').reset();
  renderJobItemsAssign();
  document.getElementById('job-form').onsubmit = saveNewJob;
}
function closeJobModal(){ document.getElementById('job-modal').style.display='none'; }

function saveNewJob(e){
  e.preventDefault();
  const job = {
    jobName: document.getElementById('job-name').value,
    clientName: document.getElementById('job-client').value,
    phone: document.getElementById('job-phone').value,
    email: document.getElementById('job-email').value,
    poc: document.getElementById('job-poc').value,
    billing: document.getElementById('job-billing').value,
    venue: document.getElementById('job-venue').value,
    jobDate: document.getElementById('job-date').value,
    items: Array.from(document.querySelectorAll('#job-items-list input:checked')).map(i=>i.value),
    archived:false
  };
  jobs.push(job);
  localStorage.setItem('jobs', JSON.stringify(jobs));
  closeJobModal();
  renderJobs();
  renderDashboard();
}

function renderJobItemsAssign(){
  const container = document.getElementById('job-items-list');
  container.innerHTML='';
  inventory.forEach((item,index)=>{
    const div = document.createElement('div');
    div.innerHTML = `<input type="checkbox" value="${index}"> ${item.gear} (${item.category})`;
    container.appendChild(div);
  });
}

function renderJobs(){
  const container = document.getElementById('jobs-list');
  container.innerHTML='';
  jobs.forEach(job=>{
    const div = document.createElement('div');
    div.innerText=`${job.jobName} | ${job.jobDate} | ${job.clientName || ''}`;
    container.appendChild(div);
  });
}

// ------------------- Dashboard -------------------
function renderDashboard(){
  const activeJobsContainer = document.getElementById('active-jobs-list');
  activeJobsContainer.innerHTML='';
  const activeJobs = jobs.filter(j=>!j.archived);
  if(activeJobs.length===0) activeJobsContainer.innerHTML='<p>No active jobs.</p>';
  else {
    activeJobs.forEach(job=>{
      const div=document.createElement('div');
      div.innerText=`${job.jobName} | ${job.jobDate} | ${job.clientName || ''}`;
      activeJobsContainer.appendChild(div);
    });
  }
  renderJobCalendar();
  renderReminders();
}

function renderJobCalendar(){
  const calendarContainer=document.getElementById('job-calendar');
  calendarContainer.innerHTML='';
  const today=new Date();
  const year=today.getFullYear();
  const month=today.getMonth();
  const lastDay=new Date(year,month+1,0).getDate();
  for(let i=1;i<=lastDay;i++){
    const dayDiv=document.createElement('div');
    dayDiv.className='calendar-day';
    dayDiv.innerHTML=`<strong>${i}</strong>`;
    calendarContainer.appendChild(dayDiv);
  }
}

// ------------------- History -------------------
function renderHistory(){
  const container=document.getElementById('history-list');
  container.innerHTML='';
  if(checkoutHistory.length===0){ container.innerHTML='<p>No history yet.</p>'; return; }
  const table=document.createElement('table');
  const thead=document.createElement('thead');
  thead.innerHTML=`<tr>
    <th>Item</th>
    <th>Action</th>
    <th>Job Name</th>
    <th>Date</th>
  </tr>`;
  table.appendChild(thead);
  const tbody=document.createElement('tbody');
  checkoutHistory.forEach(entry=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${entry.item}</td>
                  <td>${entry.action}</td>
                  <td>${entry.jobName || ''}</td>
                  <td>${entry.date}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// ------------------- Team Reminders -------------------
function renderReminders() {
  const container = document.getElementById('reminders-list');
  container.innerHTML = '';
  if(reminders.length === 0){ container.innerHTML = '<p>No reminders.</p>'; return; }
  reminders.forEach((rem,index)=>{
    const div=document.createElement('div');
    div.innerHTML=`<input type="text" class="reminder-edit-input" value="${rem}" onchange="editReminder(${index}, this.value)">
                   <button class="reminder-delete-btn" onclick="deleteReminder(${index})">Delete</button>`;
    container.appendChild(div);
  });
}

function addReminder(){
  const input=document.getElementById('reminder-input');
  const text=input.value.trim();
  if(text==='') return;
  reminders.push(text);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  input.value='';
  renderReminders();
}
function editReminder(index,newText){
  reminders[index]=newText.trim();
  localStorage.setItem('reminders', JSON.stringify(reminders));
}
function deleteReminder(index){
  reminders.splice(index,1);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  renderReminders();
}

// ------------------- Initial Render -------------------
renderDashboard();
renderInventory();
renderJobs();
renderHistory();