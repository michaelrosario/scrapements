var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 8080;

var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

// Set Handlebars
var exphbs = require("express-handlebars");
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main",
      helpers: {
        partial: function(uri, name) {
          // This helper allows us to load dynamic partials
          // Where the variable contains uri+"/"+name
          // Usage: {{> (partial variable) }}
          return uri + "/" + name.toString();
        },
        equal: function(lvalue, rvalue, options) {
          // This allows us to compare two values
          // Usage: {{#equal var1 var2}}
          if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
            return options.inverse(this);
          } else {
            return options.fn(this);
          }
        },
        lowercase: function(name) {
          // performs string operation lowercase
          // Usage: {{lowercase "Text"}}
          return name.toLowerCase().replace(/\s/g, "-");
        },
        stringify: function(data) {
          // Use this tool to output JSON
          // Usage {{stringify OBJECT}}
          return JSON.stringify(data);
        }
      }
    })
  );
  app.set("view engine", "handlebars");
  
  // Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapements", { useNewUrlParser: true });

require("./routes/api-routes.js")(app); // load our routes and pass in our app and fully configured passport

// Start the server
app.listen(PORT, function() {
    console.log("App running on port http://localhost:" + PORT + "/");
});
  