// Data & role
let records = JSON.parse(localStorage.getItem('insuranceData')||'[]');
let isAdmin = false;
let currentViewingIndex = null;

// Helpers
const $ = (s)=>document.querySelector(s);
const cardsEl = $('#cards');

const daysLeft = (iso)=> Math.ceil((new Date(iso) - new Date())/(1000*60*60*24));
const percentLeft = (iso)=>{ // simple: assume 30 days window from today
  const left = daysLeft(iso);
  const total = 30;
  return Math.max(0, Math.min(100, Math.round((left/total)*100)));
};

// Intro login
function login(role){
  if(role==='admin'){
    const pass = prompt('أدخل كلمة المرور:');
    if(pass !== '955783'){ alert('كلمة المرور غير صحيحة'); return; }
    isAdmin = true;
  }else{
    isAdmin = false;
  }
  // toggle intro/app
  $('#intro').classList.add('hidden');
  $('#app').classList.remove('hidden');
  // viewer cannot add/delete all
  $('#addBtn').style.display = isAdmin ? 'inline-block' : 'none';
  $('#deleteAllBtn').style.display = isAdmin ? 'inline-block' : 'none';
  renderCards(records);
}

// Form handling
function openForm(editIndex=null){
  if(!isAdmin){ alert('صلاحيات المشرف مطلوبة'); return; }
  $('#formModal').classList.remove('hidden');
  $('#editIndex').value = editIndex!==null ? editIndex : '';
  $('#modalTitle').textContent = editIndex!==null ? 'تعديل بيانات التأمين' : 'إضافة بيانات التأمين';
  if(editIndex!==null){
    const r = records[editIndex];
    $('#name').value = r.name;
    $('#nid').value = r.nid;
    $('#category').value = r.category;
    $('#expiry').value = r.expiry;
  }else{
    $('#form').reset();
  }
}
function closeForm(){ $('#formModal').classList.add('hidden'); }

$('#form').addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!isAdmin) return;
  const name = $('#name').value.trim();
  const nid = $('#nid').value.trim();
  const category = $('#category').value;
  const expiry = $('#expiry').value;
  const file = $('#image').files[0];
  const editIndex = $('#editIndex').value;

  const saveRecord = (imgData)=>{
    const obj = {name, nid, category, expiry, image: imgData};
    if(editIndex!==''){
      const prev = records[+editIndex];
      if(!obj.image) obj.image = prev.image || null;
      records[+editIndex] = obj;
    }else{
      records.push(obj);
    }
    localStorage.setItem('insuranceData', JSON.stringify(records));
    closeForm();
    renderCards(records);
  };

  if(file){
    const reader = new FileReader();
    reader.onload = ()=> saveRecord(reader.result); // base64 persist
    reader.readAsDataURL(file);
  }else{
    saveRecord(editIndex!=='' ? (records[+editIndex].image||null) : null);
  }
});

// Image modal
function viewImage(index){
  currentViewingIndex = index;
  const r = records[index];
  $('#largeImage').src = r.image || '';
  $('#imageModal').classList.remove('hidden');
  // Show remove button for admin only
  $('#removeBtn').style.display = isAdmin ? 'inline-block' : 'none';
}
function closeImage(){ $('#imageModal').classList.add('hidden'); currentViewingIndex=null; }
function confirmRemoveVisible(){
  if(currentViewingIndex===null) return;
  if(!isAdmin) return;
  if(confirm('هل تريد حذف التأمين؟')){
    records.splice(currentViewingIndex,1);
    localStorage.setItem('insuranceData', JSON.stringify(records));
    closeImage();
    renderCards(records);
  }
}

// Delete operations
function deleteRecord(i){
  if(!isAdmin) return;
  if(confirm('هل أنت متأكد من حذف التأمين؟')){
    records.splice(i,1);
    localStorage.setItem('insuranceData', JSON.stringify(records));
    renderCards(records);
  }
}
function confirmDeleteAll(){
  if(!isAdmin) return;
  if(!records.length) return;
  if(confirm('هل تريد حذف جميع التأمين؟')){
    records = [];
    localStorage.setItem('insuranceData','[]');
    renderCards(records);
  }
}

// Filters & search
function filterCategory(cat){
  const chips = document.querySelectorAll('.chip'); chips.forEach(c=>c.classList.remove('active'));
  document.querySelector(`.chip[data-cat="${cat==='all'?'all':cat}"]`)?.classList.add('active');
  if(cat==='all'){ renderCards(records); return; }
  if(cat==='منتهي'){ renderCards(records.filter(r=> daysLeft(r.expiry)<=0 )); return; }
  renderCards(records.filter(r=> r.category===cat ));
}
function searchRecords(){
  const q = ($('#search').value||'').trim();
  if(!q){ renderCards(records); return; }
  renderCards(records.filter(r => (r.name||'').includes(q) || (r.nid||'').includes(q)));
}

// Rendering
function cardBadge(exp){ return daysLeft(exp)<=0 ? '<span class="badge">منتهي</span>' : ''; }

function renderCards(list){
  cardsEl.innerHTML = '';
  list.forEach((r,i)=>{
    const left = daysLeft(r.expiry);
    const pct = percentLeft(r.expiry);
    let color = 'green';
    if(left<=0) color='red'; else if(left<=7) color='yellow';
    const countText = left>0 ? `باقي ${left} يوم` : 'انتهى — رجاء التجديد';

    const editBtns = isAdmin ? `
      <div class="actions-row">
        <button class="btn" onclick="openForm(${i})">✏️ تعديل</button>
        <button class="btn btn-danger" onclick="deleteRecord(${i})">🗑 إزالة</button>
      </div>` : '';

    cardsEl.insertAdjacentHTML('beforeend', `
      <article class="card">
        <img src="${r.image||''}" alt="${r.name||''}" onclick="viewImage(${i})">
        ${cardBadge(r.expiry)}
        <h4>${r.name||''}</h4>
        <p>${r.nid||''}</p>
        <p>${r.category||''}</p>
        <p>${r.expiry||''}</p>
        <p style="color:${left<=0?'#ff6868': (left<=7?'#f1c40f':'#2ecc71')};font-weight:bold">${countText}</p>
        <div class="progress"><div class="progress-bar" style="width:${pct}%; background:${color}"></div></div>
        ${editBtns}
      </article>
    `);
  });
}

// Auto refresh daily
setInterval(()=> renderCards(records), 24*60*60*1000);

// Initial render (if user opens viewer without clicking? they must click)
renderCards(records);
