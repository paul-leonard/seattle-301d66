'use strict';

const express = require('express');
const app = express();

// allows me to go into my .env file and get my variables out of it and use them in THIS file
require('dotenv').config();

const PORT = process.env.PORT;

// tells express to look inside of a public folder for an index file and serve that file first
app.use(express.static('./public'));
 
// app.get('/', function (request, response) {
//   response.send('Hello World');
// });

// app.get('/bananas', (request, response)=> {
//   response.send('I am on a banana route');
// })

// app.get('/location', (request, response)=> {
//   // do something cool to get information on that location
//   response.send('here is information on your location')
// })
 
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})