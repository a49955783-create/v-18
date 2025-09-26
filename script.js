let records = JSON.parse(localStorage.getItem('records')||'[]');
const $ = (sel)=>document.querySelector(sel);
const cardsEl = $('#cards');

const todayISO = () => new Date().toISOString().slice(0,10);
const daysLeft = (iso)=> Math.ceil((new Date(iso) - new Date())/(1000*60*60*24));

function login(role){
  if(role==='admin'){
    const pass = prompt('أدخل كلمة المرور:');
    if(pass !== '20025'){ alert('كلمة المرور غير صحيحة'); return; }
    $('#intro').classList.add('hidden');
    $('#app').classList.remove('hidden');
  }else{
    $('#intro').classList.add('hidden');
    $('#app').classList.remove('hidden');
    $('#addBtn').style.display='none';
    $('#deleteAllBtn').style.display='none';
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  renderCards(records);
}

function openAddModal(editIndex=null){
  if(!$('#app') || $('#app').classList.contains('hidden')){
    alert('اختر نوع الدخول أولاً'); return;
  }
  $('#modal').classList.remove('hidden');
  $('#editIndex').value = editIndex !== null ? editIndex : '';
  if(editIndex !== null){
    const r = records[editIndex];
    $('#name').value = r.name;
    $('#id').value = r.id;
    $('#category').value = r.category;
    $('#expiry').value = r.expiry;
  }else{
    document.getElementById('insuranceForm').reset();
    $('#expiry').min = todayISO();
  }
}
function closeModal(){ $('#modal').classList.add('hidden'); }

document.getElementById('insuranceForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const name = $('#name').value.trim();
  const id = $('#id').value.trim();
  const category = $('#category').value;
  const expiry = $('#expiry').value;
  const editIndex = $('#editIndex').value;
  const file = document.getElementById('image').files[0];

  const save = (img) => {
    const rec = {name,id,category,expiry,image:img||null};
    if(editIndex!=='') records[+editIndex] = rec;
    else records.push(rec);
    localStorage.setItem('records', JSON.stringify(records));
    closeModal();
    renderCards(records);
  };

  if(file){
    const reader = new FileReader();
    reader.onload = ()=> save(reader.result);
    reader.readAsDataURL(file);
  }else{
    save(editIndex!=='' ? records[+editIndex].image : null);
  }
});

function cardBadge(exp){ return daysLeft(exp) <= 0 ? '<span class="badge">منتهي</span>' : ''; }

function renderCards(list){
  cardsEl.innerHTML = '';
  list.forEach((r,i)=>{
    const left = daysLeft(r.expiry);
    cardsEl.insertAdjacentHTML('beforeend', `
      <article class="card">
        <figure class="figure">
          ${r.image?`<img src="${r.image}" alt="${r.name}" onclick="viewImage('${r.image}')">`:''}
          ${cardBadge(r.expiry)}
        </figure>
        <div class="content">
          <div class="row"><strong>${r.name}</strong><span class="key">${r.id}</span></div>
          <div class="meta">
            <div>الفئة: <strong>${r.category}</strong></div>
            <div>تاريخ الانتهاء: <strong>${r.expiry}</strong></div>
            <div class="countdown ${left<=0?'red':''}">${left>0?`باقي ${left} يوم`:'انتهى — رجاء التجديد'}</div>
          </div>
          <div class="actions">
            <button class="btn" onclick="openAddModal(${i})">✏️ تعديل</button>
            <button class="btn btn-danger" onclick="deleteRecord(${i})">🗑 حذف</button>
          </div>
        </div>
      </article>
    `);
  });
}

function viewImage(src){ $('#largeImage').src = src; $('#imageModal').classList.remove('hidden'); }
function closeImageModal(){ $('#imageModal').classList.add('hidden'); }

function deleteRecord(i){
  if(confirm('هل تريد حذف التأمين؟')){
    records.splice(i,1);
    localStorage.setItem('records', JSON.stringify(records));
    renderCards(records);
  }
}
function confirmDeleteAll(){
  if(!records.length) return;
  if(confirm('هل انت متأكد أنك تريد حذف جميع التأمين؟')){
    records = [];
    localStorage.setItem('records','[]');
    renderCards(records);
  }
}

function filterCategory(cat){
  if(cat==='all'){ renderCards(records); return; }
  if(cat==='منتهي'){ renderCards(records.filter(r=>daysLeft(r.expiry)<=0)); return; }
  renderCards(records.filter(r=>r.category===cat));
}
function searchRecords(){
  const q = ($('#search').value || '').trim();
  if(!q){ renderCards(records); return; }
  renderCards(records.filter(r => r.name.includes(q) || r.id.includes(q)));
}

setInterval(()=> renderCards(records), 60*60*1000);
