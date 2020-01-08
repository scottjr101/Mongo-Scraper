// Connect to the Mongo DB
var mongoose = require("mongoose");
mongoose.connect("mongodb://192.168.99.100/MongoScraper", { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
});

var db = require("../models");

module.exports = function (app, axios, cheerio) {

    app.get('/', function (req, res) {
        res.render("index");
    });



    app.get('/delete', function (req, res) {
        db.Article.deleteMany({}, function(err) {
            if (err) {
                console.log(err)
            }
        });
        res.send("database cleared");
    });

    app.get("/scrape", function (req, res) {
        axios.get("https://text.npr.org/t.php?tid=1001").then(function (response) {
            var $ = cheerio.load(response.data);
            var results = [];
            $("li").each(function (index, element) {

                // Save the text of the element in a "title" variable
                var title = $(element).find('a').text().trim();

                if (title === ('Contact Us')) {
                    return false;
                }

                var link = $(element).find('a').attr("href");

                // Save these results in an object that we'll push into the results array we defined earlier
                results.push({
                    title: title,
                    link: link
                });

            });

            db.Article.create(results)
            .then(function (dbArticle) {
                // View the added result in the console
                // console.log(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, log it
                console.log(err);
            });

            // Log the results once you've looped through each of the elements found with cheerio
            //   console.log(results);
            // Send a message to the client
            res.redirect("/");
        });
    });

    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({
                _id: req.params.id
            })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({
                    _id: req.params.id
                }, {
                    note: dbNote._id
                }, {
                    new: true
                });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

};