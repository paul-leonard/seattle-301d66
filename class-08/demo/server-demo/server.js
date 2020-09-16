'use strict';

// Reads the .env file and creates process.env.THINGS
require('dotenv').config();

// Bring in the express library to build a server
const express = require('express');

// Bring in the cors "middleware" to open up access
const cors = require('cors');

// Bring in superagent so we can run remote requests
const superagent = require('superagent');

// Bring in the postgres client library so we can connect to db
const pg = require('pg');

// Initialize Express
const app = express();

// Initialize Postgres
// Need to tell pg.Client where our DB is
const client = new pg.Client(process.env.DATABASE_URL);

// Incorporate "cors" to allow access to the server
app.use(cors());

// Declare global variables
const PORT = process.env.PORT;

let locations = {};

// Route Definitions

// Express basics and examples
app.get('/', handleHomePage);
app.get('/data', handleGetData);
app.get('/bad', makeAnErrorHappen);

// Code review for city explorer (cache locations, yelp header)
app.get('/location', handleGetLocation);
app.get('/yelp', handleGetYelp);

// SQL Demos
app.get('/people', handleGetPeople);
app.get('/add', handleAddPeople);

// * matches everything, use it as a catchall
app.use('*', (req, res) => {
  res.status(404).send('Not Found');
});

// Callback with 4 params is always the error handler
// That is express magic.
app.use((err, req, res, next) => {
  res.status(500).send(`Server Error: ${err.message}`);
});

// Route Handlers
function handleHomePage(req, res) {
  res.status(200).send('A-OK');
}

function handleGetData(req, res) {
  let data = {
    family: ['John', 'Cathy', 'Zach', 'Allie'],
    pet: "Rosie",
    jobs: [
      {
        title: 'instructor',
        place: 'code fellows',
        responsibilities: ['teaching', 'drawing']
      },
      {
        title: 'coder',
        place: 'CDK'
      }
    ]
  };

  console.log(JSON.stringify(data, null, 2))

  res.status(200).json(data);
}

function handleGetLocation(req, res) {

  // Get the city from the request
  // http://localhost:3000?city=Seattle
  // "Seattle" is found: req.query.city

  // if this is in my database....
  // Run a query on the city the user asked for
  // If the DB has it, send THAT, otherwise do the below
  if (locations[req.query.city]) {
    console.log('getting city from memory', req.query.city)
    res.status(200).json(locations[req.query.city]);
  }
  else {

    console.log('getting city from API', req.query.city)

    let url = `https://us1.locationiq.com/v1/search.php`;

    let queryObject = {
      key: process.env.GEOCODE_API_KEY,
      city: req.query.city,
      format: 'json',
      limit: 1
    };

    superagent.get(url).query(queryObject)
      // if
      .then(dishes => {
        let data = dishes.body[0];
        let location = {
          latitude: data.lat,
          longitude: data.lon,
          name: data.display_name
        };

        // Store in the DB, please, not memory
        // INSERT
        locations[req.query.city] = location;

        res.status(200).json(location);
      })
      // else
      .catch(err => {
        throw new Error(err.message);
      })

  }
}

function handleGetYelp(req, res) {
  // get the lat/lon/location from req.query (?=&=)
  let lat = req.query.lat;
  let lon = req.query.lon;
  let location = req.query.location;

  // Make a URL
  let url = 'https://api.yelp.com/v3/businesses/search';

  // Query Object
  let queryObject = {
    location: location,
  }

  // Superagent Request
  // add a header to it
  superagent.get(url)
    .query(queryObject)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(response => {
      // Loop over the .businesses[] and send each
      // to a constructor
      res.status(200).json(response.body);
    })
    .catch(err => {
      console.error(err);
      throw new Error(err.message);
    });
}

function handleGetPeople(req, res) {
  // run a select from our people table
  const SQL = "SELECT * FROM people";

  // Get the results from the database with the client
  client.query(SQL)
    .then(results => {
      // Send those to the browser
      if (results.rowCount >= 1) {
        // A good developer runs this through a constructor
        // to normalize and shape it...
        res.status(200).json(results.rows);
      }
      else {
        res.status(500).send('No Results Found');
      }
    })
    .catch(e => {
      throw new Error(e.message)
    })

}

function handleAddPeople(req, res) {
  // http://localhost:3000/add?first_name=John&last_name=Cokos&age=52
  // get name, age from the URL
  let firstName = req.query.first_name;
  let lastName = req.query.last_name;
  let userAge = req.query.age;

  // Create a query that inserts it
  const SQL = `INSERT INTO people (first_name, last_name, age) VALUES ($1, $2, $3)`;

  const safeValues = [firstName, lastName, userAge];

  // Run the query
  client.query(SQL, safeValues)
    .then(results => {
      res.redirect('/people');
    })
    .catch(e => { throw new Error(e.message) })
}

function makeAnErrorHappen(req, res) {
  throw new Error("Whoopsie");
}

function startServer() {
  app.listen(PORT, () => {
    console.log('Server is listening on port', PORT);
  });
}

client.connect()
  .then(startServer)
  .catch(e => console.log(e))

/*

The long way ....

client.connect()
  .then( () => {
    app.listen(PORT, () => {
    console.log('Server is listening on port', PORT);
  })
  .catch(e => console.log(e))

*/
