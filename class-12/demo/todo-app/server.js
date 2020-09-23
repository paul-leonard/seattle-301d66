'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
require('ejs');
const methodOverride = require('method-override');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const PORT = process.env.PORT;

// routes
app.get('/', renderHomePage); // pages/index.ejs
app.get('/add', showForm); // pages/layout/add-view.ejs
app.post('/add', collectFormInformation);
app.get('/task/:task_id', getOneTask); // pages/layout/detail-view.ejs
app.put('/update/:task_id', updateOneTask);

function renderHomePage(request, response){
  // go into the database
  const sql = 'SELECT * FROM tasks;';
  client.query(sql)
    .then(results => {
      // get all of my tasks
      const allTasks = results.rows;
      // render them to the page
      response.status(200).render('pages/index.ejs', {toDoList: allTasks});
    })
}

function showForm(request, response){
  // render the page that has the form on it
  response.status(200).render('pages/layout/add-view');
}

function collectFormInformation(request, response){
  // collect the information from the form
  // console.log(request.body);
  // {
  //   title: 'sort through stuff',
  //   description: 'parse the house',
  //   category: 'haunted',
  //   contact: 'me',
  //   status: 'not done'
  // }
  const {title, description, category, contact, status} = request.body;

  // put it in the database

  const sql = 'INSERT INTO tasks (title, description, category, contact, status) VALUES ($1, $2, $3, $4, $5) RETURNING id;';

  const safeValues = [title, description, category, contact, status];

  client.query(sql, safeValues)
    .then(results => {
      const id = results.rows[0].id;
      console.log('results from sql', id)
      // redirect to the individual task when done
      response.redirect(`/task/${id}`);
    })
}

function getOneTask(request, response){
  const id = request.params.task_id;
  console.log('in the get one task', id)

  // now that I have the id, I can use it to look up the task in the database using the id, pull it out and display it to the user

  const sql = 'SELECT * FROM tasks WHERE id=$1;';
  const safeValues = [id];
  client.query(sql, safeValues)
    .then(results => {
      // results.rows will look like this: [{my task}]
      const myChosenTask = results.rows[0];
      response.render('pages/layout/detail-view', {task: myChosenTask});
    })
}

function updateOneTask(request, response){
  const id = request.params.task_id;
  const {title, description, status} = request.body;
  // go into the database
  // find the task with that id
  // update that task
  // redirect back to the updated task

  let sql = 'UPDATE tasks SET title=$1, description=$2, status=$3 WHERE id=$4;';
  let safeValues = [title, description, status, id];
  client.query(sql, safeValues);
  response.status(200).redirect(`/task/${id}`);
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })