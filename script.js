/* The first line of the code will use the document object which represents the html page 
and we use addEventListener to listen out for whenever the browser fires the event DOMContentLoaded which will 
occur every time the index.html file is loaded or refreshed , this is a higher order function which allows us 
to pass in functions in this case an anonymous short hand function which will contain all the code we need for 
our js file since theres no point running code unless our document is loaded and we want it to run again every 
time the page is refreshed */
document.addEventListener("DOMContentLoaded",() => {
  /* this will store all elemnets which have  a class of searchInput using the same syntax as css  as an array like
  list of these elements as js objects allowing us to extract values input html through method calls etc. */
  const searchInputs = document.querySelectorAll(".searchInput");
 // Here we will store the element with the id of =results as a js object.
  const resultsSection = document.getElementById("results");
 /* forEach is a built in higher order function for arrayObjects here we use the searchInputs array and all it does
 is takes a element of our array and allows us to enter a function in the parentheses which it will run on each individual element 
 */
  searchInputs.forEach(input => {
    /* on that input element in our case the search bar in the navBar we call an eventListener so every time a key is pressed the browser will fire
    the event keydown when our input bar is focused which will then trigger  this higher order function , and that keydown event will be passed in as an object 
    for our short hand function , we also use async as we will want this code to pause and wait for the browser to fetch results using await for each elemnt in this loop
     */
    input.addEventListener("keydown", async (event) => {
        //this will only run if the event trigger was the user pressing enter to search
      if (event.key === "Enter") {
        // just removes trailing and extra whitespace in a string although not necessary because tvMAZE can handle whitespace and will still return related results
        const searchTerm = input.value.trim();
        /* If the user pressed enter without any input they will be prompted to actually enter something by injecting html that will be rendered on to the page via the 
        property of the searchTerm object which references the html element with the id=results and therefore the results will be rendered there  it will also break to 
        exit out of the loop ensuring the api call is not made without any input */
        if (searchTerm === "") {
          resultsSection.innerHTML = "<p class='p-4'>Please enter a search term.</p>";
          return;
        }
        /* Here we call the async function searchTVMAZE() while passing in our users finalised search input and it will await for the function call to finish  and return fulfilled to the promise value before continuing with the 
        loop that being said there wil only be one useful value in searchInputs array as the only reason theres two is one for mobile and one for bigger screens so theres not any issues with other 
        search inputs being delayed */
        await searchTVMaze(searchTerm);
      }
    });
  });
  // In order to return a promise to our previous function and also make our own await and fetch requests this also has to be an async function
  async function searchTVMaze(searchTerm) {
    // temporary placeholder to be shown inr results section.
    resultsSection.innerHTML = "<p class='p-4'>Searching...</p>";
    //try-catch used in case of network errors or parsing errors
    try {
        /*using await  means the code wont continue until the result is received and this result 
       will be a Response {object}  which we can extract the json text stream out of using its 
       methods */
      const showResponse = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchTerm)}`
      );
           
      /*using await  means the code wont continue until the result is received and this result 
       will be a Response {object}  which we can extract the json text stream out of using its 
       methods */
      const actorResponse = await fetch(
        `https://api.tvmaze.com/search/people?q=${encodeURIComponent(searchTerm)}`
      );
       /* the .json  method turns the text property from the Respone object into a an array 
       of objects (can be an object depending on api call response but usually an array of objects) */
      const shows = await showResponse.json();
      const actors = await actorResponse.json();
      // we then call displayResults function using these arraylists as arguments 
      displayResults(shows, actors);
    } catch (error) {
        // if there is an error we print this to the users screen not doing so could lead to a stack trace exposure.
      resultsSection.innerHTML = "<p class='p-4 text-red-600'>Something went wrong. Please try again.</p>";
      console.error(error);
    }
  }
  
  function displayResults(shows, actors) {
    /* within the displayResults function the first thing we want to do is clear the results section and remove the 
       "searching..." which was rendered previously */
    resultsSection.innerHTML = "";
   // Checks if both the arrays came back empty and no results were found for either the show or actor search then it prompts the user.
    if (shows.length === 0 && actors.length === 0) {
      resultsSection.innerHTML = "<p class='p-4'>No results found.</p>";
      return;
    }
    /* Checks to see if the shows result returned some matches from the api call and if it does builds a grid to store the results in with 
    a TV Shows title as well as giving this new entry an ID of showresults which we will use later to inject results into*/
    if (shows.length > 0) {
      resultsSection.innerHTML += `
        <h2 class="text-2xl font-semibold p-4">TV Shows</h2>
        <div id="showResults" class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4"></div>
      `;
      // uses the element created in the last line and stores it as a object
      const showResults = document.getElementById("showResults");
       //iterates through each entry of the shows arraylist we received from our api call and .json() transformation.
      shows.forEach(item => {
        /* we store item.show as its own variable to make things simpler even though we could just keep using item.show 
        this is a nested/child object within the objects we received for each result in our arraylist from our api call and json() function */
        const show = item.show;
        /*in that grid we created earlier we start rendering results for each response in the arraylist
         we use a ternary operators which will evaluate if any result was placed into image and if so will return truey otherwise if falsy will
         put a image placeholder just so the grid doesnt have big gaps where images should be along side backticks and template literals so we can use
         code within html strings and the template literals will render the result of the js code being ran and render the result in the html*/
         // we also use the show.name property of the show object to give an alt which can be used by html screen readers incase users are visually impaired.
         /* underneat the image display we will have  text box under each result which will contain information such as name, genres (which is an arraylist) 
         average rating , which comes from the property of rating which is a child object of show and here we use a OR operator so if the first value doesnt 
         have any result and therefore doesnt evaluate to truthy it will put "N/A" in its place */
        showResults.innerHTML += `
          <div class="bg-gray-100 rounded p-4 shadow">
            <img 
              class="w-full h-64 object-cover rounded mb-3"
              src="${show.image ? show.image.medium : "https://via.placeholder.com/210x295?text=No+Image"}"
              alt="${show.name}"
            >

            <h3 class="text-xl font-semibold">${show.name}</h3>
            <p><strong>Genres:</strong> ${show.genres.length ? show.genres.join(", ") : "N/A"}</p>
            <p><strong>Rating:</strong> ${show.rating.average || "N/A"}</p>
            <p class="mt-2 text-sm">${show.summary ? show.summary : "No summary available."}</p>
          </div>
        `;
      });
    }
    /* Checks to see if the people/actors result returned some matches from the api call and if it does builds a grid to store the results in with 
    a TV Shows title as well as giving this new entry an ID of actor results which we will use later to inject results into*/
    if (actors.length > 0) {
      resultsSection.innerHTML += `
        <h2 class="text-2xl font-semibold p-4 mt-6">Actors</h2>
        <div id="actorResults" class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4"></div>
      `;
    
      // uses the element created in the last line and stores it as a object
      const actorResults = document.getElementById("actorResults");
      //iterates through each entry of the shows arraylist we received from our api call and .json() transformation.
      actors.forEach(item => {
        /* we store item.person as its own variable to make things simpler even though we could just keep using item.person
        this is a nested/child object within the objects we received for each result in our arraylist from our api call and json() function */
        const person = item.person;
        /*in that grid we created earlier we start rendering results for each response in the arraylist
         we use a ternary operators which will evaluate if any result was placed into image and if so will return truey otherwise if falsy will
         put a image placeholder just so the grid doesnt have big gaps where images should be along side backticks and template literals so we can use
         code within html strings and the template literals will render the result of the js code being ran and render the result in the html*/
         // we also use the show.name property of the show object to give an alt which can be used by html screen readers incase users are visually impaired.
         /*Lastly just like for the shows results we have a section with details of the person such as their name , country which is a child object of person 
          country.name is a property of that child object and lastly their birthday*/
        actorResults.innerHTML += `
          <div class="bg-gray-100 rounded p-4 shadow">
            <img 
              class="w-full h-64 object-cover rounded mb-3"
              src="${person.image ? person.image.medium : "https://via.placeholder.com/210x295?text=No+Image"}"
              alt="${person.name}"
            >

            <h3 class="text-xl font-semibold">${person.name}</h3>
            <p><strong>Country:</strong> ${person.country ? person.country.name : "N/A"}</p>
            <p><strong>Birthday:</strong> ${person.birthday || "N/A"}</p>
          </div>
        `;
      });
    }
  }
});