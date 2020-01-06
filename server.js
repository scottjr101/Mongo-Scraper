var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require("express-handlebars");
var path = require("path");

var PORT = 5000;

// Initialize Express
var app = express();

// Handlebars
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main",
      partialsDir: [
        //  path to your partials
        path.join(__dirname, 'views/partials'),
      ]
    })
  );
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.static("public"));

require("./routes/siteRoutes")(app);

axios.get("https://old.reddit.com/r/worldnews/").then(function(response) {
    var $ = cheerio.load(response.data);
    var results = [];
    $("p.title").each(function(index, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).text();
    
        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have
        var link = $(element).children().attr("href");
    
        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
          title: title,
          link: link
        });
      });
    
      // Log the results once you've looped through each of the elements found with cheerio
      console.log(results);
    
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });