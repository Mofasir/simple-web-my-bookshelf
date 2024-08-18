let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist(){
    if (typeof (Storage) === undefined){
        alert('Maaf browser yang Anda gunakan tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(RENDER_EVENT, function(){
    const hasntReadBookList = document.getElementById('incompleteBookList');
    hasntReadBookList.innerHTML = '';

    const hasReadBookList = document.getElementById('completeBookList');
    hasReadBookList.innerHTML = '';

    for (const readBook of books){
        const readBookElement = createElementBook(readBook);
        if (!readBook.isComplete){
            hasntReadBookList.append(readBookElement);
        } else{
            hasReadBookList.append(readBookElement)
        }
    }
});

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('book-input');
    const searchForm = document.getElementById('searchForm');

    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
        submitForm.reset();
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        searchBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function addBook(){
    const bookTitle = document.getElementById('bookTitleInput').value;
    const bookAuthor = document.getElementById('bookAuthorInput').value;
    const bookYear = parseInt(document.getElementById('bookYearInput').value);
    const bookRead = document.getElementById('bookIsCompleteInput').checked;

    let readStatus;

    if (bookRead){
        readStatus = true;
    } else{
        readStatus = false;
    };

    const bookExist = books.find(book => book.title === bookTitle && book.author === bookAuthor && book.year === bookYear);
    if (bookExist){
        return;
    }

    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, readStatus);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = 'Berhasil Ditambahkan!';
    document.body.appendChild(info);
    setTimeout(function(){
        info.remove();
    }, 3000);
}

function generatedId(){
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return{
        id,
        title,
        author,
        year,
        isComplete
    }
}

function createElementBook(bookObject){
    const titleBook = document.createElement('h2');
    titleBook.classList.add('item-title');
    titleBook.innerText = bookObject.title;

    const detailBook = document.createElement('p');
    detailBook.classList.add('detail-book');
    detailBook.innerHTML = `${bookObject.author} <span>(${bookObject.year})</span>`;

    const bookContainer = document.createElement('div');
    bookContainer.append(titleBook, detailBook);

    const actContainer = document.createElement('div');
    actContainer.classList.add('item-action');

    const shelfContainer = document.createElement('div');
    shelfContainer.classList.add('item');
    shelfContainer.append(bookContainer);
    shelfContainer.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isComplete){
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.innerText = 'Ulangi';
        
        undoButton.addEventListener('click', function(){
            undoBookHasRead(bookObject.id);

            const info = document.createElement('div');
            info.className = 'info';
            info.textContent = 'Berhasil Dipulihkan!';
            document.body.appendChild(info);
            setTimeout(function() {
                info.remove();
            }, 3000);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerText = 'Hapus';

        deleteButton.addEventListener('click', function(){
            const isConfirmed = confirm('Apakah Anda yakin ingin menghapus buku ini?');

            if (isConfirmed){
                deleteBook(bookObject.id);

                const info = document.createElement('div');
                info.className = 'info';
                info.textContent = 'Berhasil Dihapus!';
                document.body.appendChild(info);
                setTimeout(function(){
                    info.remove();
                }, 3000);
            }
        });

        actContainer.append(undoButton, deleteButton);
        shelfContainer.append(actContainer);
    } else {
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = 'Edit';

        editButton.addEventListener('click', function(){
            editBook(bookObject.id);
        });

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        completeButton.innerText = 'Selesai';

        completeButton.addEventListener('click', function(){
            addBookToCompleted(bookObject.id);

            const info = document.createElement('div');
            info.className = 'info';
            info.textContent = 'Berhasil Dipindahkan!';
            document.body.appendChild(info);
            setTimeout(function(){
                info.remove();
            }, 3000);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerText = 'Hapus';

        deleteButton.addEventListener('click', function(){
            const isConfirmed = confirm('Apakah Anda yakin ingin menghapus buku ini?');

            if (isConfirmed){
                deleteBook(bookObject.id);

                const info = document.createElement('div');
                info.className = 'info';
                info.textContent = 'Berhasil Dihapus!';
                document.body.appendChild(info);
                setTimeout(function(){
                    info.remove();
                }, 3000);
            }
        });

        actContainer.append(completeButton, editButton, deleteButton);
        shelfContainer.append(actContainer);
    }
    return shelfContainer;
}

function deleteBook(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function undoBookHasRead(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function addBookToCompleted(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function findBook(bookId){
    for (const bookItem of books){
        if (bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId){
    for (const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

function editBook(bookId){
    const book = findBook(bookId);
    const bookTitle = document.getElementById('bookTitleInput');
    const bookAuthor = document.getElementById('bookAuthorInput');
    const bookYear = document.getElementById('bookYearInput');
    const bookRead = document.getElementById('bookIsCompleteInput');
    const submitButton = document.querySelector('#book-input > button');

    bookTitle.value = book.title;
    bookAuthor.value = book.author;
    bookYear.value = book.year;
    bookRead.checked = book.isComplete;

    submitButton.innerText = 'Perbarui Buku';
    submitButton.onclick = () => {
        if (bookTitle.value === '' || bookAuthor.value === '' || bookYear.value === '') {
            return;
        }

        const updatedBook = generateBookObject(
            book.id,
            bookTitle.value,
            bookAuthor.value,
            bookYear.value = parseInt(bookYear.value),
            bookRead.checked
        );
        const bookIndex = findBookIndex(book.id);
        books[bookIndex] = updatedBook;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        document.dispatchEvent(new Event(RENDER_EVENT));

        const info = document.createElement('div');
        info.className = 'info';
        info.textContent = 'Berhasil Diperbarui!';
        document.body.appendChild(info);
        setTimeout(function(){
            info.remove();
        }, 3000);

        submitButton.innerText = 'Simpan';
        submitButton.onclick = () => addBook();
    };
}

function saveData(){
    if (isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null){
        for (const todo of data){
            books.push(todo);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook(){
    let search = document.querySelector('#keyword').value;
    let returnSearch = document.getElementsByClassName('item');

    for (const book of returnSearch){
        let book_title = book.innerText.toUpperCase();
        let search_book = book_title.search(search.toUpperCase());
        if (search_book != -1) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    }
}
