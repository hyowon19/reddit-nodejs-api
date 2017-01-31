var express = require('express');
var app = express();

app.get('/hello', function(request,response){
  
  var result = request.query.name;
  
  response.end(`<h1>Hello ${result}!</h1>`);
});


// 2B: A wild parameter
app.get('/hello/:nameId', function(request, response) {
  var result2 =  request.params.nameId;
  
  response.end(`<h1>Hello ${result2}!</h1>`);
});
  
//3
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
  
  if(mathOp === 'add') {
    mathObj.solution = +num1 + +num2;
  }
  else if(mathOp === 'sub') {
    mathObj.solution = +num1 - +num2;
  }
  else if(mathOp === 'mult') {
    mathObj.solution = +num1 * +num2;
  }  
  else if(mathOp === 'div') {
    mathObj.solution = +num1 / +num2;
  }
  else {
    mathObj.solution = "Error 400";
  }
  
  response.end(`<h1> ${JSON.stringify(mathObj)}</h1>`);
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});