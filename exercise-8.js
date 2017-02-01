var express = require('express'); 
var app = express(); 
app.use(express.static('static_files'))

var bodyParser = require('body-parser'); 
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

const pug = require('pug');
app.set('view engine', 'pug');

//// Inserting REDDIT
// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'hyowon19', // CHANGE THIS :)
  password: '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);



// Exercise 8

app.get('/posts', function(request, response) {
  redditAPI.getAllPosts({
    numPerPage: 5,
    page: 0
  }, function(err, userPosts) {
    if (err) {
      console.log(err);
    }
    else {
       response.render('post-list', {posts: userPosts});
    }
  });
});


app.get('/createContent', function(request, response) { 
    response.render('create-content');
});


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});