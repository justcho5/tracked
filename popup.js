// load from local storage
await init();

async function init() {
  // retrieve the library from storage
  const library = await loadBooksFromStorage();
  // retrieve tabs (or what we call pages)  using the tabs.query()
  const pages = await chrome.tabs.query({ currentWindow: true });

  // add button event listener for the add button
  const button = document.getElementById("submit");
  button.addEventListener("click", handleAddBook(pages, library));
  // return { tabs, books };
}

async function loadBooksFromStorage() {
  const { books: library } = await chrome.storage.local.get("books");
  if (!library) {
    console.log("no books in storage");
    return [];
  }

  for (const book of library) {
    renderBook(book);
  }
  return library;
  // display on popup
}

function handleAddBook(pages, library) {
  return () => {
    const bookTitle = document.getElementById("topic").value;
    console.log(
      "here",
      library.filter((book) => book.title === bookTitle)
    );
    if (library.filter((book) => book.title === bookTitle).length === 0) {
      let newBook = {
        title: bookTitle,
        numPages: pages.length,
        pagesInfo: getPagesInfo(pages),
      };
      renderBook(newBook);
      library.push(newBook);
      chrome.storage.local.set({ books: library }).then(() => {
        document.getElementById("topic").value = "";
      });
    }
  };
}

function renderBook(newBook) {
  let pageElements = createPageElements(newBook);
  const bookElement = createBook(newBook);
  const pagesContainer =
    bookElement.getElementsByClassName("pages-container")[0];
  pagesContainer.append(...pageElements);
  document.querySelector("ul").append(bookElement);
}

function getPagesInfo(pages) {
  const pagesInfo = [];
  for (const page of pages) {
    // Fill in tabElement
    const pageTitle = page.title.split("-")[0].trim();
    const pageInfo = { title: pageTitle, url: page.url };

    pagesInfo.push(pageInfo);
  }
  return pagesInfo;
}
function createPageElements(newBook) {
  let pageElements = new Set();
  for (const pageInfo of newBook.pagesInfo) {
    const singlePageElement = createPage(newBook.title, pageInfo);
    // add single tab info to newBook
    pageElements.add(singlePageElement);
  }
  return pageElements;
}

function cloneTemplate(templateId) {
  const template = document.getElementById(templateId);
  const element = template.content.firstElementChild.cloneNode(true); // clones list element in template
  return element;
}
function createPage(bookTitle, pageInfo) {
  const singlePageElement = cloneTemplate("page-template");
  singlePageElement.id = `${bookTitle}-tabs`;
  const pageInfoElement = singlePageElement.querySelector(".page-title-url");
  pageInfoElement.textContent = pageInfo.title;
  pageInfoElement.href = pageInfo.url;

  return singlePageElement;
}

function createBook(newBook) {
  const element = cloneTemplate("li_template");
  element.querySelector(".numPages").textContent = `${newBook.numPages} Pages`;
  element.querySelector(".title").textContent = newBook.title;
  return element;
}

// function makeBookElement({ title, tabs }) {}
