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
                                .text();

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

}