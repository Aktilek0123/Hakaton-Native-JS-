const API = "http://localhost:8000/books";

// ? стягиваем лист
let list = document.querySelector(".list");

// ? стягиваем все Buttons
let btnAdd = document.querySelector("#add_btn");

let btnClose = document.querySelector(".btn-close");
let btnSave = document.querySelector(".btn-save");
let btnEdit = document.querySelector(".btn-edit");

// ? стягиваем модалтное окно
let mainModal = document.querySelector(".main-modal");

// ? стягиваем Inputs
let inpImage = document.querySelector("#image");
let inpTitle = document.querySelector("#input-title");
let inpAuthor = document.querySelector("#input-author");
let inpGenre = document.querySelector("#input-genre");
let inpDate = document.querySelector("#input-date");
let inpDescr = document.querySelector("#input-descr");

// ? глобальная область видимости для добавления
let editId = 0;

// ? search
let searchInp = document.querySelector("#search_input");
let searchVal = "";

// ? pagination
let pageList = document.querySelector(".page-list");
let prev = document.querySelector("#prev");
let next = document.querySelector("#next");

let currentPage = 1; // текущая страница
let pageTotalCount = 1; // общее количество

// ! слушатель событий на добавление
btnAdd.addEventListener("click", function () {
  mainModal.style.display = "block";
  btnSave.style.display = "initial";
  btnEdit.style.display = "none";
});

// ! слушатель событий на кнопку Close
btnClose.addEventListener("click", function () {
  mainModal.style.display = "none";
  inpImage.value = "";
  inpTitle.value = "";
  inpAuthor.value = "";
  inpGenre.value = "";
  inpDate.value = "";
  inpDescr.value = "";
});

// ! слушатель событий на Save
btnSave.addEventListener("click", async function () {
  let obj = {
    image: inpImage.value,
    title: inpTitle.value,
    author: inpAuthor.value,
    genre: inpGenre.value,
    date: inpDate.value,
    descr: inpDescr.value,
  };
  // проверка на заполненность
  if (
    !obj.image.trim() ||
    !obj.title.trim() ||
    !obj.author.trim() ||
    !obj.genre.trim() ||
    !obj.date.trim() ||
    !obj.descr.trim()
  ) {
    alert("Заполните поля");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  // очищение  inputs
  inpImage.value = "";
  inpTitle.value = "";
  inpAuthor.value = "";
  inpGenre.value = "";
  inpDate.value = "";
  inpDescr.value = "";

  render();
});

// ! отображение Books
async function render() {
  let books = await fetch(
    `${API}?q=${searchVal}&_page=${currentPage}&_limit=3`
  ).then((res) => res.json());

  drawPaginationButtons();

  list.innerHTML = "";

  books.forEach((elem) => {
    let card = document.createElement("div");
    card.innerHTML = `
      <div class="card" >
     <img src="${elem.image}" alt="..." class="card-image" >
      <div class="card-cont">
      <p id="card_title">Title: ${elem.title}</p>
      <p id="card_auth">Author: ${elem.author}</p>
      <p id="card_genr">Genre: ${elem.genre}</p>
      <p id="card_date">Date: ${elem.date}</p>
      <p id="card_descr">Description: ${elem.descr}</p>
      </div>
      <div class="btn-edit-delete">
      <button onclick="deleteCard(${elem.id} )" id="delete">DELETE</button>
      <button onclick="editCard(${elem.id})" id="edit">EDIT</button>
      </div>
      </div>`;
    list.append(card);
  });

  mainModal.style.display = "none";
}
render();

// !Delete fucntion
async function deleteCard(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  render();
}

// !Edit function
async function editCard(id) {
  editId = id;
  mainModal.style.display = "block";
  btnSave.style.display = "none";
  btnEdit.style.display = "initial";

  let res = await fetch(`${API}/${id}`);
  let data = await res.json();

  inpImage.value = data.image;
  inpTitle.value = data.title;
  inpAuthor.value = data.author;
  inpGenre.value = data.genre;
  inpDate.value = data.date;
  inpDescr.value = data.descr;
}

// ! слушатель событий на Edit
btnEdit.addEventListener("click", async () => {
  let obj = {
    image: inpImage.value,
    title: inpTitle.value,
    author: inpAuthor.value,
    genre: inpGenre.value,
    date: inpDate.value,
    descr: inpDescr.value,
  };

  await fetch(`${API}/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  render();
});

// ! search
searchInp.addEventListener("input", (e) => {
  searchVal = e.target.value; // записывает значение поисковика в переменную searchVal
  currentPage = 1;
  render();
});

function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 3);
      pageList.innerHTML = "";
      for (let i = 1; i <= pageTotalCount; i++) {
        //  создаем кнопки с цифрой]
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item active"><a class="page-link page-number" href="#">${i}</a></li>`;
          pageList.append(page1);
        } else {
          let page2 = document.createElement("li");
          page2.innerHTML = `<li class="page-item"><a class="page-link page-number" href="#">${i}</a></li>`;
          pageList.append(page2);
        }
      }

      // ? красить в серый цвет наши кнопки prev/next кнопки
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});
