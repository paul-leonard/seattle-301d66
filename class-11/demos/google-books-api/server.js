'use strict';

// bring in my dependencies
const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');

// bring in my middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

// global variables
const PORT = 3000;

// routes
app.get('/', renderHomePage);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);

function renderHomePage(request, response){
  // get the books from the DB and display them  on the homepage
  // or - if there are no books, directions on how the site works
  response.render('pages/index');
}

function renderSearchForm(request, response){
  // render the search form
  response.render('pages/searches/new.ejs');
}

function collectFormInformation(request, response){
  // collect form information
  // console.log(request.body);
  // { search: [ 'Elizabeth Moon', 'author' ] }
  // { search: [ 'The magic of thinking big', 'title' ] }
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}

  superagent.get(url)
    .then(data => {
      const bookArray = data.body.items;
      const finalBookArray = bookArray.map(book => new Book(book.volumeInfo));

      response.render('pages/show', {bananas: finalBookArray});
    })
}

function Book(book){
  this.title = book.title;
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})