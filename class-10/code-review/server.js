'use strict';

// Load Environment Variables from the .env file
// Application Dependencies
require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const superagent = require('superagent');

const pg = require('pg');
const { search } = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => {
  console.err(err);
});


const PORT = process.env.PORT || 3001;

app.get(`/location`, handleLocation);
app.get(`/weather`, handleWeather);
  // app.get(`/trails`, trailHandler);
  // app.get('*', notFoundHandler);

function handleLocation(request, response) {
  const city = request.query.city;

  const sql = `SELECT * FROM city_data WHERE search_query=$1;`;
  const safeValues = [city];
  client.query(sql, safeValues)
    .then(resultsFromSql => {
      if(resultsFromSql.rowCount){
        console.log('found the city in the database');
        const chosenCity = resultsFromSql.rows[0];
        response.status(200).send(chosenCity);
      } else {
        console.log('did not find the city');

        const url = `https://us1.locationiq.com/v1/search.php`;
        const queryObject = {
        key: process.env.GEOCODE_API_KEY,
        city, 
        format: 'JSON',
        limit: 1
        }
        superagent
          .get(url)
          .query(queryObject)
          .then(data => {
            const place = new Location(city, data.body[0]);
            // save information in the database
            // then send it to the user
            const sql = 'INSERT INTO city_data (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            const safeValues = [city, place.formatted_query, place.latitude, place.longitude];

            client.query(sql, safeValues)
              response.status(200).send(place);
            })  
        }
      })
}
      
function Location(city, geodata) {
  this.search_query = city;
  this.formatted_query = geodata.display_name;
  this.latitude = geodata.lat;
  this.longitude = geodata.lon;
}

// function Trail(object) {
//   this.name = object.name;
//   this.length = object.length;
//   this.stars = object.starVotes;
//   this.summary = object.summary;
//   this.trail_url = object.url;
//   the.conditions = object.conditionDetails;
//   this.condition_date =object.conditionDate.slice(0, 10);
//   this.condition_time = object.conditionDate.slice(11, 19);
// }
//   try {
  //     const geoData = require('./data/location.json');
//     const city = request.query.city;
//     const locationData = new Location(city, geoData);
//     // const locationData = new Location(city, geoData);
//     response.send(locationData);
//     } catch(error) {
//       response.status(500).send('this ain\'t working');
//     }
// };

//constructor function for weather
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = day.valid_date;
}

function handleWeather(request, response) {
  // console.log(request.query);

  // {
  //   id: '1',
  //   search_query: 'olympia',
  //   formatted_query: 'Olympia, Thurston County, Washington, USA',
  //   city_name: '',
  //   latitude: '47.0451022',
  //   longitude: '-122.8950075',
  //   page: '1'
  // }

  let {search_query, formatted_query, latitude, longitude} = request.query;

  // console.log(search_query, formatted_query, latitude, longitude);

  // lets check our database to see if we have data for that city
  let sql = 'SELECT * FROM weather WHERE search_query=$1;';
  let safeValues = [search_query];

  client.query(sql, safeValues)
    .then(data => {
      if(data.rowCount){
        let freshData = Date.parse(new Date().toLocaleDateString()) - Date.parse(data.rows[0].date_entered) < 864;

        if(freshData){
          console.log('this is our data.rows[0]', data.rows);
          console.log('found weather in the database');
          console.log('weather was less than 24 hours');
          response.status(200).send(data.rows);
        } else {
          console.log('we did not have dad in the db or it was not fresh');
          let key = process.env.WEATHER_API_KEY
          const url =`http://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}`;
          superagent.get(url)
            .then(data => {
              // console.log(data.body.data);
              var weatherUpdate = data.body.data;
              console.log(weatherUpdate);
              let allWeather = weatherUpdate.map(weather => {
                
                console.log(weather);
                let newWeather = new Weather(weather);
                let sql = 'INSERT INTO weather (search_query, forecast, time, date_entered) VALUES ($1, $2, $3, $4);';
                let safeValues = [search_query, newWeather.forecast, newWeather.time, new Date()];
                client.query(sql, safeValues);
  
                return newWeather;
                  
              })
                response.send(allWeather);
              }) 
          };
        } else {
          // go to superagent and get data
        }
      })
      
}


app.get('/bad-request', (request, response) => {
  throw new Error('bad request!');
});

// function trailHandler(request, response) {
//   try {
//     const lat = request.query.latitude;
//     const lon = request.query.longitude;
//     let key = process.env.TRAIL_API_KEY;
//     const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
//     superagent.get(url)
//       .then(results => {
//         let trailData = results.body.trails;
//         response.send(trailData.map(value => new Trail(value)));
//       })

//   }
//   catch (error) {
//     console.log('Error', error);
//     response.status(500).send('Zoinks Batman, He got away.');
//   }
// }
function notFoundHandler(req, res) {
  throw new Error("Whoopsie");
}


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })
  .catch(error => console.error(error));
  