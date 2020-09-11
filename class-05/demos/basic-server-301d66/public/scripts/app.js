// GOAL: when the user enters a city (we don't really care what city at this point), we will display information on Seattle
  // display a map of Seattle
  // display the name of Seattle
  // display restaurants of Seattle


function fetchCityData(event){
  event.preventDefault();

  console.log('in the fetchCityData')

  // collect the search that the user inputs
  let searchQuery = $('#input-search').val();
  console.log(searchQuery)

  $.ajax('./fake-data/location.json', { method: 'GET', dataType: 'JSON', data: { city: searchQuery } })
    .then(dataThatIGotBack => {
      console.log(dataThatIGotBack);
      showTitle(dataThatIGotBack);
      createMap(dataThatIGotBack);
      getRestaurants(dataThatIGotBack.search_query);

      // $('#title').append(showTitle(dataThatIGotBack));
    })
    // $('#title').append(title);
  }


function showTitle(locationObject){
  // 1. get the template
  let template = $('#name-template').html();

  // 2. mash template with data
  let html = Mustache.render(template, locationObject.search_query);

  // 3. append to the index
  $('#title').append(html);
}

function createMap(locationObject){
  let map = $('#map-template').html();
  let area = Mustache.render(map, locationObject.search_query);
  $('#map').append(area);
}

function getRestaurants(location){
  $.ajax('/fake-data/restaurants.json', {method:'GET', dataType: 'JSON', data:{city:location}})
    .then(dataFromRestaurants => {
      console.log(dataFromRestaurants)
      dataFromRestaurants.forEach(restaurant => {
        showRestaurants(restaurant);
      })
    })
}

function showRestaurants(restaurantObject){
  let template = $('#restaurant-template').html();
  let html = Mustache.render(template, restaurantObject);
  $('#restaurant-results').append(html);
}

function setEventListener(){
  // listen for the user to enter the name of the city
  $('#search-form').on('submit', fetchCityData);
}

$('document').ready(function(){
  setEventListener();
})