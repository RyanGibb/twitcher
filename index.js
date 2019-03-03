
//----------------------------------------------------------------------------
//                              Twitter API
//----------------------------------------------------------------------------

var Twitter = require('twitter');
var tcom = require('thesaurus-com');
const WordPOS = require('wordpos');
const axios = require('axios');
var wordpos = new WordPOS();

var client = new Twitter({
  consumer_key: '2VrVCTagv7YKqAYwERrhSAwqy',
  consumer_secret: 'q9oWZFamxgK7jTmB1Gc8Y4SKtPr6Tjn4etFYuM9iST5jEgcfhe',
  access_token_key: '1101853152939257856-Hsoh6KAbgZXwn6jA4XjKSu0cCgNQNt',
  access_token_secret: '8z20GXZMAQnt2zA5q0n7V6Hs2Su9hFALOugeXRKAux733'
});

function getBlankedTweets(handle, callback){
  client.get('https://api.twitter.com/1.1/statuses/user_timeline.json?exclude_replies=true&include_rts=false&screen_name=' + handle, function(error, tweets, response) {
    if (error) {
      return callback(error);
    }
    let randTweet = tweets[Math.floor(Math.random()*tweets.length)];
    let body = tweet.text;
    wordpos.getPOS(body, function(obj) {
      let wordArray = obj.nouns.concat(obj.verbs, obj.adjectives, obj.adverbs);
      if (wordArray.length > 0) {
        var word = wordArray[Math.floor(Math.random()*wordArray.length)];
        let possibilites = tcom.search(word);
        let timestamp = (new Date(tweet.created_at)).toLocaleDateString();
        recent_tweets.push({body, handle, timestamp})
        callback(null, tweet);
      }
    })
    callback(null, recent_tweets);
  })
}

function getRecentTweets(handle, callback){
  client.get('https://api.twitter.com/1.1/statuses/user_timeline.json?exclude_replies=true&include_rts=false&screen_name=' + handle, function(error, tweets, response) {
    if (error) {
      return callback(error);
    }
    var recent_tweets = []
    for (let i = 0; i < tweets.length; i++) {
      let tweet = tweets[i];
      let body = tweet.text;
      let timestamp = (new Date(tweet.created_at)).toLocaleDateString();
      recent_tweets.push({
        body,
        handle,
        timestamp
      })
    }
    callback(null, recent_tweets);
  })
}

function getUser(handle, callback) {
  client.get('https://api.twitter.com/1.1/users/lookup.json?screen_name=' + handle, function(error, user_info, reponse) {
    if (error) {
      return callback(["User doesn't exist.", error]);
    }
    let tweet_count = user_info[0].statuses_count;
    let follower_count = user_info[0].followers_count;
    getRecentTweets(handle, function(error, recent_tweets) {
      if (error) {
        return callback(["Error getting tweets.", error]);
      }
      let user = {
        handle,
        follower_count,
        tweet_count,
        recent_tweets
      };
      callback(null, user);
    })
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

httpServer.listen(port, localhost, function() {
  console.log('Listening for HTTP requests on localhost, port ' + port);
});

//----------------------------------------------------------------------------
//                              WebSocket Server
//----------------------------------------------------------------------------

const ws = require('ws');

const maxLogMessageLength = 200;

const wsServer = new ws.Server({
  server: httpServer
});

wsServer.on('connection', function(ws, req) {
  console.log('WS connection');

  ws.on('close', function(code, message) {
    console.log('WS disconnection - Code ' + code);
  });

  ws.on('message', function(data) {
    let messageString = data.toString();
    console.log('WS -> rx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString));

    try {
      var receivedMessage = JSON.parse(messageString);
    } catch (error) {
      return respondError(ws, req, 'error parsing JSON request', error);
    }

    if (receivedMessage.request == 'userinfo') {
      let handle = receivedMessage.handle;
      if (!handle) {
        return respondError(ws, req, 'missing handle for userinfo request');
      }
      // query api
      getUser(handle, function(error, user) {
        if (error) {
          return respondError(ws, req, error[0], error[1]);
        }
        let response = "userinfo";
        let message = {
          response,
          user
        };
        respond(ws, req, message);
      })

    }

    else if (receivedMessage.request == 'blank') {
      let handle = receivedMessage.handle;
      if (!handle) {
        return respondError(ws, req, 'missing handle for blank request');
      }
      // query api
      getBlankedTweets(handle)
        .then(tweets => {
          let response = "blank";
          let message = {
            response,
            tweets
          };
          respond(ws, req, message);
        })
        .catch(error => {
          console.error(error);
        })
    }

    else if (receivedMessage.request == 'blanked') {
      let handle = receivedMessage.handle;
      if(!handle) {
        return respondError(ws, req, 'missing handle for blanked request');
      }
      // query api
      getBlankedTweets(handle, function(error, tweet) {
        if (error) {
          return respondError(ws, req, "Error getting tweet", error);
        }
        let response = "blanked";
        let message = {response, tweet};
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
  responseMessage = {
    response,
    human_readable_error,
    error
  };
  respond(ws, req, responseMessage);
}



function respond(ws, req, responseMessage) {
  var messageString = JSON.stringify(responseMessage);
  ws.send(messageString);
  console.log('WS <- tx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString));
};

console.log('WebSocket server running');
