var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function(app) {

    app.get("/", function(req, res) {

        db.Article.find({}).then(function(savedArticles){

            res.render("index",{ 
                totalArticles: savedArticles.length,
                page_title: "home" 
            });

        });
        
    });
    app.get("/saved", function(req, res) {

        db.Article.find({}).then(function(savedArticles){

            res.render("index",{ 
                data: savedArticles, 
                totalArticles: savedArticles.length,
                page_title: "saved"
             });
        });

    });

    app.get("/scrape", function(req, res) {
        var source = "https://www.engadget.com/";
        axios.get(source).then(function(response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // An empty array to save the data that we'll scrape
        var results = [];
        var articleCount = 0;


            db.Article.find({}).then(function(savedArticles){
                articleCount = savedArticles.length;

                $("article.o-hit").each(function(i, element) {
                    
                    var image = $(element).find(".lazy,.stretch-img").attr('data-original') || "";
                    var title = $(element).find("h2").text().trim() || "";
                    var excerpt =  $(element)
                                    .find("p")
                                    .text()
                                    .trim() || "";
                    var link = $(element)
                                .find(".o-hit__link")
                                .attr("href")
                                .split("?")[0];
                    
                    var category = $(element)
                                .find(".th-topic")
                                .text()
                                .trim();

                    if(link.indexOf("https://www.engadget.com") == -1){
                        link = 'https://www.engadget.com'+link;
                    }

                    if(title && image){

                            // check each article if it's in the saveArticles and include ID


                                var data = {
                                    title: title,
                                    image: image,
                                    category: category,
                                    excerpt: excerpt,
                                    source: source,
                                    link: link
                                }

                                if(savedArticles.indexOf(title)){
                                    data._id = savedArticles._id
                                } else {
                                    data._id = "";
                                }                        
                                results.push(data);
                    
                           
                        }

                });

            // Log the results once you've looped through each of the elements found with cheerio
            console.log(results);
            res.render("index",{ 
                data: results, 
                totalArticles: articleCount,
                page_title: "scrape"
            });

            }).catch(function (error) {

                // handle error
                console.log(error);

            })

        });
            
    });


    app.post("/save",function(req, res) {
        
        db.Article.create(req.body)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
          res.json(err);
        });

    });

    app.post("/delete",function(req, res) {
        
        db.Article.deleteOne({ _id: req.body._id }, function(err){
            if (!err) {
                res.json(req.body._id);
            }
            else {
                res.json("failed remove "+req.body._id);
            }
        });       

    });

    // Route for grabbing a specific Article by id, populate it with it's comment
    app.get("/comment/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("comment")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    });

    app.post("/comment/delete/:id",function(req, res) {
        
        db.Comment.deleteOne({ _id: req.params.id }, function(err){
            if (!err) {
                res.json(req.params.id);
            }
            else {
                res.json("failed remove "+req.params.id);
            }
        });       

    });

    // Route for saving/updating an Article's associated Comment
    app.post("/comment/:id", function(req, res) {
        // Create a new comment and pass the req.body to the entry
        db.Comment.create(req.body)
        .then(function(dbComment) {
            // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ 
                _id: req.params.id 
            }, { 
                note: dbComment._id 
            }, { 
                new: true 
            });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    });

}