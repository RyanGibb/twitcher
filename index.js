
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
  client.get('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + screen_name, function(error, tweets, response) {
    if (error) {
      return callback(error);
    }
    if (tweets.length < 1) {
      return callback(screen_name + " has no tweets.")
    }
    let randTweet  = tweets[Math.floor(Math.random()*tweets.length)];
    let body = randTweet.text;
    let timestamp = randTweet.created_at;
    let tweet = {body, screen_name, timestamp};
    callback(null, tweet);
  })
}

function getUser(screen_name, callback){
  client.get('https://api.twitter.com/1.1/users/lookup.json?screen_name=' + screen_name, function(error, user, reponse) {
    let valid = false;
    if (error) {
      let userinfo = {valid};
      return callback(userinfo);
    }
    valid = true;
    let tweet_count = user[0].statuses_count;
    let follower_count = user[0].followers_count;
    let userinfo = {valid, follower_count, tweet_count};
    callback(userinfo);
  })
}


//----------------------------------------------------------------------------
//                              HTTP Server
//----------------------------------------------------------------------------

const express = require('express');
const http = require('http');

let port = process.getuid(); // type "id" on Linux for uid value
if (port < 1024) port += 10000; // do not use privileged ports
//let port = 21200;

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
      return respondError(ws, req, 'error parsing JSON request', error);
    }

    if (receivedMessage.request == 'guess') {
      let handles = receivedMessage.handles;
      if(!handles) {
        return respondError(ws, req, 'missing handles for "guess" request');
      }
      // select random handle
      let randHandle = handles[Math.floor(Math.random()*handles.length)];
      // query api
      getTweet(randHandle, function(error, tweet) {
        if (error) {
          return respondError(ws, req, "Error getting tweet.", error);
        }
        let response = "guess";
        let message = {response, tweet};
        respond(ws, req, message);
      })
    }

    else if (receivedMessage.request == 'userinfo') {
      let handle = receivedMessage.handle;
      if(!handle) {
        return respondError(ws, req, 'missing handle for "userinfo" request');
      }
      getUser(handle, function(user) {
        let response = "userinfo";
        let message = {response, user};
        respond(ws, req, message);
      })
    }

    else {
      respondError(ws, req, 'unsupported request "' + receivedMessage.request + '"');
    }

  })
});

function respondError(ws, req, human_readable_error, error) {
  let response = 'error';
  responseMessage = {response, human_readable_error, error};
  respond(ws, req, responseMessage);
}



function respond(ws, req, responseMessage) {
  var messageString = JSON.stringify(responseMessage);
  ws.send(messageString);
  console.log('WS <- tx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString)
  );
};

console.log('WebSocket server running');
