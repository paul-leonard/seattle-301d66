'use strict';

require('dotenv').config();
require('ejs');

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

const app = express();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

let port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));

// Routes
app.get('/', renderHomePage);
app.get('/search', renderSearchForm);
app.post('/searches', getBookData);
app.post('/books', addBookToDatabase);
app.get('/books/:book_id', singleBookDetails);
app.get(`*`, handleError);

function renderHomePage(request, response) {
  const sql = 'SELECT * FROM books;';
  return client.query(sql)
    .then(results => {
      // console.log('renderHomePage', results.rows);
      let myBooks = results.rows;
      response.status(200).render('pages/index', {renderedContent: myBooks});
  })
  .catch(error => {
    console.log(error)
    response.render('pages/error');
  })
}

function renderSearchForm(request, response) {
  response.status(200).render('pages/searches/new.ejs');
}

function getBookData (request, response) {
  const searchQuery = request.body.search[0]; // j.k. rowling
  const searchType = request.body.search[1]; // author

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}

  // console.log('url', url);
  
  superagent.get(url)
    .then(data => {
      const bookArray = data.body.items;
      console.log('Book Array', bookArray);
      const finalBookArray = bookArray.map(book => new Book(book.volumeInfo));
      response.render('pages/searches/show', {finalBookArray: finalBookArray});
      
      // let SQL = `INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5);`;
      // let safeValues = [finalBookArray[0].author, finalBookArray[0].title, finalBookArray[0].isbn, finalBookArray[0].url, finalBookArray[0].description];
      // client.query(SQL, safeValues)
      //   .then(data => console.log(data + 'was stored'));
  
    })
    .catch(error => {
      console.log(error);
      response.render('pages/error');
    })
}

function handleError (request, response) {
  response.status(404).render('error');
} 

function addBookToDatabase(request, response) {
  const {author, title, isbn, image, description} = request.body;
  const sql = 'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  const safeValues = [author, title, isbn, image, description];
  client.query(sql, safeValues)
    .then((idFromSQL) => {
      // console.log(idFromSQL);
      response.redirect(`books/${idFromSQL.rows[0].id}`)
    }).catch((error) => {
      console.log(error);
      response.render('pages/error');
    });
}

function singleBookDetails(request, response) {
  const id = request.params.book_id;
  // console.log('singleBookDetails', id);
  // console.log('in the get one book', id);
  const sql = 'SELECT * FROM books WHERE id=$1;';
  const safeValues = [id];
  client.query(sql, safeValues)
  .then((results) => {
    // console.log('results from sql', results.rows[0]);
    const myChosenBook = results.rows[0];
    response.render('pages/books/detail', { myChosenBook: myChosenBook });
  })
  .catch(error => response.status(500).render('pages/error'));
}

// Constructor Functions
function Book(volumeInfo) {
  this.url = volumeInfo.imageLinks ? volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://'): `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = volumeInfo.title ? volumeInfo.title: ` Title Unavailable!`;
  this.author = volumeInfo.authors ? volumeInfo.authors[0]: `Author Unavailable!`;
  this.description = volumeInfo.description ? volumeInfo.description: `Description Not Found!?`;
  this.isbn = volumeInfo.industryIdentifiers[0].identifier ? volumeInfo.industryIdentifiers[0].identifier: `No number available`;
}

client.connect()
  .then(() => {
    app.listen(port, () => {
      console.log('Server is listening on port', port);
    });
  })








