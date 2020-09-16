'use strict';

// Reads the .env file and creates process.env.THINGS
require('dotenv').config();

// Bring in the express library to build a server
const express = require('express');

// Bring in the cors "middleware" to open up access
const cors = require('cors');

// Bring in superagent so we can run remote requests
const superagent = require('superagent');

// Initialize Express
const app = express();

// Incorporate "cors" to allow access to the server
app.use(cors());

// Declare global variables
const PORT = process.env.PORT;

// Route Definitions
app.get('/', handleHomePage);
app.get('/data', handleGetData);
app.get('/bad', makeAnErrorHappen);
app.get('/location', handleGetLocation);
app.get('/yelp', handleGetYelp);

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
      res.status(200).json(location);
    })
    // else
    .catch(err => {
      throw new Error(err.message);
    })
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
      console.log(response.body);
      res.status(200).json(response.body);
    })
    .catch(err => {
      console.error(err);
      throw new Error(err.message);
    });
}

function makeAnErrorHappen(req, res) {
  throw new Error("Whoopsie");
}

app.listen(PORT, () => {
  console.log('Server is listening on port', PORT);
});
