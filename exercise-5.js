var express = require('express'); 
var app = express(); 

var bodyParser = require('body-parser'); 
app.use(bodyParser.json());

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



app.get('/hello', function(request, response) {

  var result = request.query.name;

  response.end(`<h1>Hello ${result}!</h1>`);
});


// Exercise 2B: A wild parameter
app.get('/hello/:nameId', function(request, response) {
  var result2 = request.params.nameId;

  response.end(`<h1>Hello ${result2}!</h1>`);
});

// Exercise 3
app.get('/calculator/:operation', function(request, response) {
  var num1 = request.query.num1;
  var num2 = request.query.num2;
  var mathOp = request.params.operation;
  var mathResult = 0;
  var mathObj = {
    "operator": mathOp,
    "firstOperand": num1,
    "secondOperand": num2,
    "solution": mathResult
  };

  if (mathOp === 'add') {
    mathObj.solution = +num1 + +num2;
  }
  else if (mathOp === 'sub') {
    mathObj.solution = +num1 - +num2;
  }
  else if (mathOp === 'mult') {
    mathObj.solution = +num1 * +num2;
  }
  else if (mathOp === 'div') {
    mathObj.solution = +num1 / +num2;
  }
  else {
    mathObj.solution = "Error 400";
  }

  response.end(`<h1> ${JSON.stringify(mathObj)}</h1>`);
});

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


