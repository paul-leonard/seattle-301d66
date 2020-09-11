// GOAL: get the information from the JSON file and display it using the template on the html

'use strict';
// need a global dog array
const dogArray = [];

// grab the data from the assets
$.ajax('assets/data.json', {method: 'GET', dataType: 'JSON'})
  .then(dogInfo => {
    dogInfo.forEach(pet => {
      new Dog(pet).render();
    })
  })

// constructor function
function Dog(object){
  this.name = object.name;
  this.imagePath = object.image_url;
  this.hobbies = object.hobbies;
}

Dog.prototype.render = function(){
  // render new object instances to the page
    // copy the template
    // fill it with the information from the oject instance

  // select all the html inside of the template
  const myTemplate = $('#dog-template').html();

  // create a new section to hold my template
  const $newSection = $(`<section>${myTemplate}</section>`);

  // find the h2 tag and fill it with the name of the dog
  $newSection.find('h2').text(this.name);

  // find the p tag and fill it with the hobbies
  $newSection.find('p').text(this.hobbies);

  // find the img tag and put in the url
  $newSection.find('img').attr('src', this.imagePath);

  // append it to the main section
  $('main').append($newSection);
}


