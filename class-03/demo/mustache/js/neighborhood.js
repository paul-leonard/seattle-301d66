'use strict';

// GOAL: display my data set using mustache to index.html
const allHoodArray = [];

// need a constructor
  // run each of my objects through the contructor to make an array of object instances
function Hood(obj){
  this.name = obj.name;
  this.city = obj.city;
  this.population = obj.population;
  this.founded = obj.founded;
  this.body = obj.body;

  allHoodArray.push(this);
}

Hood.prototype.createHtml = function(){
  // 1. get template from html
  let template = $('#hoods').html();

  // 2. use Mustache to "create" new html by merging the template with the object instance that I have
  let html = Mustache.render(template, this);

  // 3. return the "html" from this method
  return html;
}

neighborhoodDataSet.forEach(neighborhood => {
  new Hood(neighborhood);
})

allHoodArray.forEach(place => {
  $('main').append(place.createHtml());
})

// use mustache to make html

// make a render function