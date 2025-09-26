let records = JSON.parse(localStorage.getItem("records")) || [];

function login(role) {
  if(role === 'admin') {
    let pass = prompt("ادخل كلمة السر:");
    if(pass === "20025") {
      document.getElementById("intro").classList.add("hidden");
      document.getElementById("main").classList.remove("hidden");
    } else {
      alert("كلمة السر غير صحيحة!");
    }
  } else {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("main").classList.remove("hidden");
    document.querySelectorAll(".actions button").forEach(btn => btn.style.display = "none");
  }
}

function openAddModal(editIndex = null) {
  document.getElementById("modal").classList.remove("hidden");
  if(editIndex !== null) {
    const r = records[editIndex];
    document.getElementById("name").value = r.name;
    document.getElementById("id").value = r.id;
    document.getElementById("category").value = r.category;
    document.getElementById("expiry").value = r.expiry;
    document.getElementById("editIndex").value = editIndex;
  } else {
    document.getElementById("insuranceForm").reset();
    document.getElementById("editIndex").value = "";
  }
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("insuranceForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const id = document.getElementById("id").value;
  const category = document.getElementById("category").value;
  const expiry = document.getElementById("expiry").value;
  const image = document.getElementById("image").files[0];
  const editIndex = document.getElementById("editIndex").value;

  const saveRecord = (imgData) => {
    const record = { name, id, category, expiry, image: imgData };
    if(editIndex) records[editIndex] = record;
    else records.push(record);
    localStorage.setItem("records", JSON.stringify(records));
    renderCards(records);
    closeModal();
  };

  if(image) {
    const reader = new FileReader();
    reader.onload = () => saveRecord(reader.result);
    reader.readAsDataURL(image);
  } else {
    saveRecord(editIndex ? records[editIndex].image : null);
  }
});

function renderCards(data) {
  const container = document.getElementById("cards");
  container.innerHTML = "";
  data.forEach((r, i) => {
    const daysLeft = Math.ceil((new Date(r.expiry) - new Date()) / (1000*60*60*24));
    container.innerHTML += `
      <div class="card">
        ${r.image ? `<img src="${r.image}" onclick="viewImage('${r.image}')">` : ""}
        <h3>${r.name}</h3>
        <p>هوية: ${r.id}</p>
        <p>الفئة: ${r.category}</p>
        <p>تاريخ الانتهاء: ${r.expiry}</p>
        <p class="${daysLeft <= 0 ? 'expired-text' : ''}">${daysLeft > 0 ? "باقي " + daysLeft + " يوم" : "انتهى — رجاء التجديد"}</p>
        <button onclick="openAddModal(${i})">✏️ تعديل</button>
        <button onclick="deleteRecord(${i})">🗑 حذف</button>
      </div>`;
  });
}

function deleteRecord(i) {
  if(confirm("هل تريد حذف التأمين؟")) {
    records.splice(i, 1);
    localStorage.setItem("records", JSON.stringify(records));
    renderCards(records);
  }
}

function confirmDeleteAll() {
  if(confirm("هل انت متأكد أنك تريد حذف جميع التأمين؟")) {
    records = [];
    localStorage.setItem("records", JSON.stringify(records));
    renderCards(records);
  }
}

function filterCategory(cat) {
  if(cat === "all") renderCards(records);
  else if(cat === "منتهي") renderCards(records.filter(r => new Date(r.expiry) < new Date()));
  else renderCards(records.filter(r => r.category === cat));
}

function searchRecords() {
  const q = document.getElementById("search").value;
  renderCards(records.filter(r => r.name.includes(q) || r.id.includes(q)));
}

function viewImage(src) {
  document.getElementById("largeImage").src = src;
  document.getElementById("imageModal").classList.remove("hidden");
}

function closeImageModal() {
  document.getElementById("imageModal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => renderCards(records));
