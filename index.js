
//----------------------------------------------------------------------------
//                              Twitter API
//----------------------------------------------------------------------------

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: '2VrVCTagv7YKqAYwERrhSAwqy',
  consumer_secret: 'q9oWZFamxgK7jTmB1Gc8Y4SKtPr6Tjn4etFYuM9iST5jEgcfhe',
  access_token_key: '1101853152939257856-Hsoh6KAbgZXwn6jA4XjKSu0cCgNQNt',
  access_token_secret: '8z20GXZMAQnt2zA5q0n7V6Hs2Su9hFALOugeXRKAux733'
});

function getTweet(screen_name, callback){
  client.get('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + screen_name + '&count=1', function(error, tweets, reponse) {
    if (error) {
      // return error json
      return null;
    }
    let body = tweets[0].text;
    let timestamp = tweets[0].created_at;
    let tweet = {body, screen_name, timestamp};
    callback(tweet);
  })
}

getTweet("realDonaldTrump", function(tweet) {
  console.log(tweet);
})

//----------------------------------------------------------------------------
//                              HTTP Server
//----------------------------------------------------------------------------

const express = require('express');
const http = require('http');

//let port = process.getuid(); // type "id" on Linux for uid value
//if (port < 1024) port += 10000; // do not use privileged ports
let port = 21200;

const app = express();
const static_dir = 'static';

app.use(express.static(static_dir));

const httpServer = http.createServer(app);
const localhost = '127.0.0.1';

httpServer.listen(port, localhost, function () {
  console.log('Listening for HTTP requests on localhost, port ' + port);
});

//----------------------------------------------------------------------------
//                              WebSocket Server
//----------------------------------------------------------------------------

const ws = require('ws');

const maxLogMessageLength = 200;

const wsServer = new ws.Server({server: httpServer});

wsServer.on('connection', function(ws, req) {
  console.log('WS connection');

  ws.on('close', function(code, message) {
    console.log('WS disconnection - Code ' + code);
  });

  ws.on('message', function(data) {
    let messageString = data.toString();
    console.log('WS -> rx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString)
    );

    try {
      var receivedMessage = JSON.parse(messageString);
    }
    catch(error) {
      respondError(ws, req, 'error parsing JSON request', error);
      return;
    }

    if (receivedMessage.request == 'guess') {
      let handles = receivedMessage.handles;
      if(!handles) {
        respondError(ws, req, 'missing handles for "guess" request');
      }
      // select random tweet
      // query api
    }
    else {
      respondError(ws, req, 'unsupported request "' + receivedMessage.request + '"');
    }

  })
});

function respondError(ws, req, human_readable_error, error) {
  let responce = 'error';
  responceMessage = {responce, human_readable_error, error};
  respond(ws, req, responceMessage);
}



function respond(ws, req, responceMessage) {
  var messageString = JSON.stringify(responceMessage);
  ws.send(messageString);
  console.log('WS <- tx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString)
  );
};

console.log('WebSocket server running');
