"use strict";

//dependencies
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT;
const express = require("express");
const app = express();
app.use(cors());
const superagent = require("superagent");
let pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', homePage);
app.get('/searches/new', renderSearchPage);
app.post('/searches', searchHandle);
app.get('*', errorHandler);

// Route functions
function searchHandle(request, response) {
  //console.log(request.body.items);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (searchType === 'title') { url += `+intitle:${searchQuery}` }
  if (searchType === 'author') { url += `+inauthor:${searchQuery}` }
  superagent.get(url)
    .then(bookInfo => {
      // console.log(bookInfo.body.items[0].volumeInfo.industryIdentifiers[0].identifier);
      // console.log(bookInfo.body.items[0].volumeInfo.imageLinks);
      const bookArray = bookInfo.body.items;
      const finalBookArray = bookArray.map(book => new Book(book));
      const sql = `INSERT INTO books (title, author, isbn, image_url, descript) VALUES ($1, $2, $3, $4, $5);`;
      const safeValues = [finalBookArray[0].title, finalBookArray[0].author, finalBookArray[0].isbn, finalBookArray[0].image, finalBookArray[0].description];
      client.query(sql, safeValues)
        .then((results) => {
          console.log(results.rows);
        });
      response.render('pages/searches/show.ejs', { finalBookArray: finalBookArray });
    })
    .catch((error) => {
      console.error('error', error);
      response.status(500).send('Unable to process request, please try again.');
    });
}

function renderSearchPage(request, response) {
  response.status(200).render('pages/searches/new.ejs');
}

function homePage(request, response) {
  let sql = `SELECT * FROM books;`;
  client.query(sql)
    .then(results => console.log(results.rows[0]));
  response.status(200).render('pages/index');
}

// Constructor Functions
function Book(book) {
  this.title = book.volumeInfo.title ? book.volumeInfo.title : 'book not found';
  this.author = book.volumeInfo.authors ? book.volumeInfo.authors : 'author not found';
  this.description = book.volumeInfo.description;
  this.image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : "https://i.imgur.com/J5LVHEL.jpg";
  this.isbn = book.volumeInfo.industryIdentifiers[0].identifier;
}

function errorHandler(request, respond) {
  respond.status(404).send('Unable to process request, please try again.');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })