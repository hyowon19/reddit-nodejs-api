var express = require('express'); 
var app = express(); 

// var bodyParser = require('body-parser'); 
// app.use(bodyParser.json());

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



// Exericse 5
app.get('/createContent', function(request, response) {
    response.send(
      `<form action="/createContent" method="POST">
        <div>
          <input type="text" name="url" placeholder="Enter a URL to content">
        </div>
        <div>
          <input type="text" name="title" placeholder="Enter the title of your content">
        </div>
        <button type="submit">Create!</button>
      </form>`
      );
});



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


