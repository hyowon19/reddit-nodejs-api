var express = require('express');
var app = express();

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


// Exercise 4
app.get('/posts', function(request, response) {
  redditAPI.getAllPosts({
    numPerPage: 5,
    page: 0
  }, function(err, userPosts) {
    if (err) {
      console.log(err);
    }
    else {
       var postList = userPosts.map(function(item) {
          return (`
            <li>
              <h1 style = color:blue>${item.title}</h1>
              <a href style = color: red; font-size 13px; = ${item.url}>${item.url}</a>
              <p>${item.userId}</p>
              <p>${item.createdAt}</p>
            </li>
          `);
      });
      var layoutPage = (
       `<div id="contents">
          <h1>List of contents</h1>
          <ul class="contents-list">
            ${postList}
          </ul>
        </div>`
      );
      response.end(`${layoutPage}`);
    }
  });
});



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});