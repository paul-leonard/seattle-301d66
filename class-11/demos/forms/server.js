// GOAL: get the information from the from and display a thank you for visiting page

'use strict';

const express = require('express');
const app = express();

const PORT = 3000;

// middleware

// tell express to look in the public directory and serve file from there
app.use(express.static('./public'));

// this is a body parser - customs agent - helps you declare what you are bringing in
app.use(express.urlencoded({extended: true}));

app.post('/contact', collectFormInformation);
app.get('/bananas', (req, res) => {
  res.send('banans!');
})

function collectFormInformation(request, response){
  // collect the data
  console.log(request.body);
  // {
  //   firstname: 'dom',
  //   lastname: 'augurson',
  //   message: 'you should always put butter on your pancakes',
  //   phone: '888-888-8888',
  //   contact: 'phone'
  // }
  const {firstname, lastname, message, phone} = request.body;
  
  // redirect to the thanks page
  response.sendFile('./thanks.html', { root: './public' });
  // response.redirect('/bananas');
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})