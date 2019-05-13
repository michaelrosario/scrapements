var db = require("../models");

module.exports = function(app) {

    app.get("/", function(req, res) {

        db.Article.find({}).then(function(savedArticles){

            res.render("index",{ totalArticles: savedArticles.length });

        });
        
    });

}