const ENTER = 'Enter';
const ESCAPE = 'Escape';
const ELEMENTS_COUNT = 5;

const addButton = document.querySelector('#button-add');
const addInput = document.querySelector('.input-todo');
const elementList = document.querySelector('.elem-list');
const filterButtons = document.querySelector('.buttons-container');
const pagesList = document.querySelector('.pages-list');
const checkAllAndDelete = document.querySelector('.first-li');

let todos = [];
let filterType = 'all';
let currentPage = 1;
let checkedAll = false;

const pagination = (calculatePage) => {
  let pageNumber = '';

  for (let i = 1; i <= calculatePage; i += 1) {
    const activeClass = (i === currentPage) ? 'active-page' : '';
    pageNumber
            += `<button class="pagination-button ${activeClass}">${i}</button>`;
  }
  pagesList.innerHTML = pageNumber;
};

const createListItem = (id, status, text) => {
  const checked = status ? 'checked' : '';
  const listItem = `<li data-id="${id}">
  <input type="checkbox" class="completed" ${checked} />
  <span class="text">${text}</span>
  <input class="edit" type="text" hidden />
  <button class="delete-button">X</button>
  </li>`;
  return listItem;
};

const filtration = () => {
  let array = [];

  switch (filterType) {
    case 'active':
      array = todos.filter((element) => !element.status);
      return array;
    case 'completed':
      array = todos.filter((element) => element.status);
      return array;
    default:
      return [...todos];
  }
};

const setCount = () => {
  const buttons = filterButtons.children;
  const countForActive = todos.filter((element) => !element.status).length;
  const countForCompleted = todos.filter((element) => element.status).length;

  buttons[0].innerHTML = `All(${todos.length})`;
  buttons[1].innerHTML = `Active(${countForActive})`;
  buttons[2].innerHTML = `Completed(${countForCompleted})`;
};

const render = () => {
  setCount();
  let todoList = '';
  const arrayOfItems = filtration();
  const calculatePage = Math.ceil(arrayOfItems.length / ELEMENTS_COUNT);

  arrayOfItems.slice((currentPage * ELEMENTS_COUNT - ELEMENTS_COUNT), currentPage * ELEMENTS_COUNT)
    .forEach((element) => {
      todoList += createListItem(element.id, element.status, element.text);
    });

  pagination(calculatePage);

  elementList.setAttribute('todo-list', todoList);
  elementList.innerHTML = todoList;
};

const setCurrentPage = (event) => {
  if (event.target.className !== 'pages-list') {
    currentPage = Number(event.target.innerHTML);
    render();
  }
};

const saveOrCancelValue = (event) => {
  const currentSpan = event.target.parentNode.children[1];
  const editInput = event.target;
  const liId = event.target.parentNode.dataset.id;

  if (event.key === ENTER) {
    currentSpan.hidden = false;
    todos.forEach((element) => {
      const text = element;
      if (element.id === Number(liId)) text.text = editInput.value;
      render();
    });
    editInput.hidden = true;
  }
  if (event.key === ESCAPE) {
    currentSpan.hidden = false;
    editInput.hidden = true;
  }
};

const saveOnBlur = (event) => {
  if (event.sourceCapabilities !== null) {
    const currentSpan = event.target.parentNode.children[1];
    const editInput = event.target;
    const liId = event.target.parentNode.dataset.id;
    
    currentSpan.hidden = false;
    todos.forEach((element) => {
      const text = element;
      if (element.id === Number(liId)) text.text = editInput.value;
    });
    editInput.hidden = true;
    render();
  }
};

const editTodo = (event, parent) => {
  const currentSpan = event.target;
  const editInput = parent.children[2];

  currentSpan.hidden = true;
  editInput.hidden = false;
  editInput.value = currentSpan.innerHTML;
  editInput.focus();

  editInput.addEventListener('keydown', saveOrCancelValue);
  editInput.addEventListener('blur', saveOnBlur);
};

const pageNext = () => {
  const lastPage = Math.ceil(todos.length / ELEMENTS_COUNT);
  currentPage = currentPage < lastPage ? lastPage : currentPage;
};

const pageBack = () => {
  const lastPage = Math.ceil(todos.length / ELEMENTS_COUNT);
  currentPage = currentPage > lastPage ? lastPage : currentPage;
};

const createTodo = () => {
  const shielding = _.escape(addInput.value.replace(/\s+/g, ' ').trim());
  const textArray = shielding.split('');
  let inputText = '';

  textArray.forEach((element, index) => {
    if (index % 40 === 0) {
      inputText += '\n';
    }
    inputText += element;
  });

  if (inputText !== '' && inputText.length < 255) {
    const obj = {
      text: inputText,
      status: false,
      id: Date.now(),
    };
    todos.push(obj);
    addInput.value = '';

    if (checkAllAndDelete.children[0].disabled === true) {
      checkAllAndDelete.children[0].disabled = false;
    }

    pageNext();
    render();
  }
};

const handleClick = (event) => {
  if (event.key === ENTER) {
    createTodo();
  }
};

const deactivateCheckAll = () => {
  checkAllAndDelete.children[0].disabled = true;
  checkAllAndDelete.children[0].checked = false;
};

const checkAllOnGeneralStatus = () => {
  if (todos.every((element) => element.status === true)) {
    checkAllAndDelete.children[0].checked = true;
  } else {
    checkAllAndDelete.children[0].checked = false;
  }
}

const choiceFunction = (event) => {
  const { className, parentNode } = event.target;
  const { id } = parentNode.dataset;

  if (className === 'completed') {
    todos.forEach((element) => {
      const status = element;
      if (element.id === Number(id)) status.status = !element.status;
    });

    checkAllOnGeneralStatus();
    render();
  }
  if (className === 'text' && event.detail === 2) {
    editTodo(event, parentNode);
  }
  if (className === 'delete-button') {
    todos = todos.filter((element) => element.id !== Number(id));
    pageBack();
    if (todos.length === 0) deactivateCheckAll();
    render();
  }
};

const setActiveClassForButton = (activeElement, children) => {
  for (let i = 0; i < children.length; i += 1) {
    if (children[i] === activeElement) {
      activeElement.classList.add('active');
    } else {
      children[i].classList.remove('active');
    }
  }
};

const setFilterType = (event) => {
  // const { children } = event.target.parentNode.children;
  const buttonClass = event.target.className;

  if (buttonClass === 'button-all') {
    filterType = 'all';
    setActiveClassForButton(event.target.parentNode.children[0], event.target.parentNode.children);
  }
  if (buttonClass === 'button-active') {
    filterType = 'active';
    setActiveClassForButton(event.target.parentNode.children[1], event.target.parentNode.children);
  }
  if (buttonClass === 'button-completed') {
    filterType = 'completed';
    setActiveClassForButton(event.target.parentNode.children[2], event.target.parentNode.children);
  }

  currentPage = 1;
  render();
};

const transactionsWithAll = (event) => {
  const classOfElement = event.target.className;
  if (classOfElement === 'first-checkbox') {
    todos.forEach((element) => {
      const status = element;
      status.status = !checkedAll;
    });
    checkedAll = !checkedAll;
    render();
  }
  if (classOfElement === 'delete-select-button') {
    todos = todos.filter((element) => element.status === false);
    if (todos.length === 0) deactivateCheckAll();
    render();
  }
};

addButton.addEventListener('click', createTodo);
addInput.addEventListener('keydown', handleClick);
elementList.addEventListener('click', choiceFunction);
filterButtons.addEventListener('click', setFilterType);
pagesList.addEventListener('click', setCurrentPage);
checkAllAndDelete.addEventListener('click', transactionsWithAll);