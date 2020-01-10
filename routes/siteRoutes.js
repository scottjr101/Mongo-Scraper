// Connect to the Mongo DB
require('dotenv').config()
var mongoose = require("mongoose");
// MongoDB connection setup
var Mongo_URI = process.env.mongoURI || "mongodb://192.168.99.100/MongoScraper";
mongoose.connect(Mongo_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});

var db = require("../models");

module.exports = function (app, axios, cheerio) {

    app.get('/', function (req, res) {
        db.Article.find({}).sort({created: -1}).limit(15)
		.then(function(article) {
            res.render("index", { articles: article });
        })
        .catch(function(err) {
			res.writeContinue(err);
		});    
    });

    app.get('/delete', function (req, res) {
        db.Article.remove({}, function(err) {
            if (err) {
                console.log(err)
            }
        });
        res.redirect("/");
    });

    app.post("/note/delete/:id", function(req, res) {
        db.Note.findByIdAndRemove({ _id: req.params.id })
            // .then(function(dbNote) {
            //     console.log("This is what dbNote looks like => " + dbNote);
            //     return db.Article.findOneAndUpdate({ _id : req.params.id }, { $pull: { note: dbNote._id }}, {new: false })
            // })
            .then(function(dbArticle) {
                console.log("dbArticle with notes " + dbArticle);
                res.redirect("back");
            })
            .catch(function(err) {
                res.writeContinue(err);
            });
    
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

    // Route for saving/updating an Article's associated Note
    app.post("/save-note/:id", function(req, res) {
	console.log("saving / updating note route - req.params.id: " + req.params.id);
	console.log("saving / updating note route - req.body: " + JSON.stringify(req.body));
	
	// save the new note that gets posted to the Notes collection
	// then find an article from the req.params.id
	// and update it's "note" property with the _id of the new note
	db.Note.create(req.body)
		.then(function(dbNote) {

			return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id }}, { new: true })
            .populate("note");
		})
		// If the Article was updated successfully, send back article and its corresponding notes to the client
		.then(function(dbArticle){
			console.log("dbArticle with notes" + dbArticle);
			res.json({success: true});
		})
		.catch(function(err) {
			res.writeContinue(err);
		});
});

    app.post("/saved/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Article.findOneAndUpdate({_id: req.params.id},{$set: {saved: true}})
            .then(function (dbSaved) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbSaved);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            })
    })

    app.post("/saved/delete/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Article.findOneAndUpdate({_id: req.params.id},{$set: {saved: false}})
            .then(function (dbSaved) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbSaved);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            })
    })

    // Route for displaying all 20 saved articles, along with their notes, from the db (Saved Articles link)
    app.get("/saved", function(req, res) {
    db.Article.find({saved: true})
        .sort({created: -1})
        .limit(15)
        .populate("note")
		.then(function(article) {
			res.render("savedArticles", { articles: article });
		})
		.catch(function(err) {
			res.writeContinue(err);
		})
    })

};