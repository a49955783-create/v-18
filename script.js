let data = JSON.parse(localStorage.getItem('insuranceData')) || [];

function login(type) {
  if (type === 'admin') {
    let pass = prompt("أدخل كلمة المرور");
    if (pass !== "955783") return;
  }
  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  renderCards();
}

function openForm() {
  document.getElementById('form-modal').style.display = 'block';
}
function closeForm() {
  document.getElementById('form-modal').style.display = 'none';
}
function openImage(src) {
  document.getElementById('image-modal').style.display = 'block';
  document.getElementById('modal-img').src = src;
}
function closeImage() {
  document.getElementById('image-modal').style.display = 'none';
}
document.getElementById('insurance-form').addEventListener('submit', function(e) {
  e.preventDefault();
  let obj = {
    name: document.getElementById('name').value,
    nationalId: document.getElementById('nationalId').value,
    category: document.getElementById('category').value,
    expiryDate: document.getElementById('expiryDate').value,
    image: document.getElementById('image').files[0] ? URL.createObjectURL(document.getElementById('image').files[0]) : ''
  };
  data.push(obj);
  localStorage.setItem('insuranceData', JSON.stringify(data));
  renderCards();
  closeForm();
});

function renderCards() {
  let container = document.getElementById('cards-container');
  container.innerHTML = '';
  data.forEach((item, i) => {
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image}" onclick="openImage('${item.image}')">
      <h3>${item.name}</h3>
      <p>${item.nationalId}</p>
      <p>${item.category}</p>
      <p>${item.expiryDate}</p>
      <button onclick="deleteCard(${i})">إزالة</button>
    `;
    container.appendChild(card);
  });
}

function deleteCard(i) {
  if (confirm("هل أنت متأكد من الحذف؟")) {
    data.splice(i, 1);
    localStorage.setItem('insuranceData', JSON.stringify(data));
    renderCards();
  }
}

function clearAll() {
  if (confirm("هل تريد حذف الكل؟")) {
    data = [];
    localStorage.removeItem('insuranceData');
    renderCards();
  }
}

function searchCards() {
  let val = document.getElementById('search').value;
  let container = document.getElementById('cards-container');
  container.innerHTML = '';
  data.filter(item => item.name.includes(val) || item.nationalId.includes(val))
      .forEach((item, i) => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${item.image}" onclick="openImage('${item.image}')">
          <h3>${item.name}</h3>
          <p>${item.nationalId}</p>
          <p>${item.category}</p>
          <p>${item.expiryDate}</p>
          <button onclick="deleteCard(${i})">إزالة</button>
        `;
        container.appendChild(card);
      });
}

function filterCards(cat) {
  let container = document.getElementById('cards-container');
  container.innerHTML = '';
  data.filter(item => cat === 'all' || item.category === cat)
      .forEach((item, i) => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${item.image}" onclick="openImage('${item.image}')">
          <h3>${item.name}</h3>
          <p>${item.nationalId}</p>
          <p>${item.category}</p>
          <p>${item.expiryDate}</p>
          <button onclick="deleteCard(${i})">إزالة</button>
        `;
        container.appendChild(card);
      });
}
