var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require("express-handlebars");
var path = require("path");

var PORT = process.env.PORT || 5000;

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

require("./routes/siteRoutes")(app, axios, cheerio);

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });