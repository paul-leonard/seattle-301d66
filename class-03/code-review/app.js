'use strict';

// Goal 1: we need to get the data from page-1.json and display it to the page

const uniqueKeywordArray = [];
const hornedBeastArray = [];

$.ajax('./page-1.json', {method: 'GET', dataType: 'JSON'})
  .then(animals => {
    animals.forEach(hornedBeast => {
      const beast = new Unicorn(hornedBeast);
      beast.render();
    })
    generateUniqueKeywords();
    generateDropdown();
  })

function Unicorn(object){
  this.image = object.image_url;
  this.title = object.title;
  this.description = object.description;
  this.keyword = object.keyword;
  this.horns = object.horns;

  hornedBeastArray.push(this);
}

Unicorn.prototype.render = function(){
  // get the  html inside the photo template section
  const template = $('#photo-template').html();

  // fill a new section with the template
  const $newSection = $(`<section class="${this.keyword}">${template}</section>`);

  // access the new section
  $newSection.find('h2').text(this.title);
  $newSection.find('p').text(`${this.description}. Number of horns ${this.horns}`);
  $newSection.find('img').attr('src', this.image);

  $('main').append($newSection);
}

  // need a render method - prototype - that uses templates to render our object instances


// Goal 2: we need to filter the images when a user clicks on a keyword in the dropdown menu
  // I need a list of UNIQUE keywords

function generateUniqueKeywords(){
  // loop over my hornedBeastArray and look at all the keywords
  // if the keyword is IN the uniqueKeywordArray, I'm going to do nothing
  // if it isn't, I'm going to push it into it
  hornedBeastArray.forEach(beast => {
    if(!uniqueKeywordArray.includes(beast.keyword)){
      uniqueKeywordArray.push(beast.keyword);
    }
  })

  // for(let i=0; i<hornedBeastArray.length; i++){
  //   if(!uniqueKeywordArray.includes(hornedBeastArray[i].keyword)){

  //   }
  // }
}

function generateDropdown(){
  // loop through uniqueKeywords
  // create an option tag
  // fill it with the value and text
  // and append
  uniqueKeywordArray.forEach(keyword => {
    // make a new option tag
    const $newDropdownItem = $('<option></option>');
    // add a keyword value
    $newDropdownItem.attr('value', keyword);
    // add the keyword as the text
    $newDropdownItem.text(keyword);
    // append it to the text
    $('select').append($newDropdownItem);
  })
}

function handleChange(){

    $('section').hide();
    $(`section[class=${this.value}]`).show();
  
}

$('select').on('change', handleChange);



  // I need to put that list in a dropdown menu
  // when a user click on a thing in that menu
    // everything to disappear
    // only the things with that keyword will reappear