// GOAL: creat an index with two links: list and quantites
// list -> an .ejs view with a list of our food items
// quantity -> an .ejs view with a list of our food items and how many

'use strict';

const express = require('express');
const app = express();
require('ejs');

const PORT = 3000;

// tells express to looks for a 'views' folder
app.set('view engine', 'ejs');

app.get('/', renderHome);
app.get('/listroute', renderList);

function renderHome(request, response){
  response.render('index');
}

function renderList(request, response){
  console.log('in renderList');
  response.render('list.ejs', {myShoppingList: list});
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})

let list = ['apples', 'celery', 'butter', 'milk', 'eggs'];


