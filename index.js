
require("dotenv").config();

// Twitter API

const Twitter = require('twitter');
const tcom = require('thesaurus-com');
const WordPOS = require('wordpos');
const wordpos = new WordPOS();

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const tweet_url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?exclude_replies=true&include_rts=false&screen_name='

const user_url = 'https://api.twitter.com/1.1/users/lookup.json?screen_name='

clientGetPromise = (...args) => {
  return new Promise( (resolve, reject) => 
    client.get(...args,
      (error, data, response) => {
        if (error) reject(error)
        resolve( [data, response] )
      }
    )
  );
}

wordGetPOSPromise = (...args) => {
  return new Promise(resolve => 
    wordpos.getPOS(...args, obj => resolve(obj))
  );
}

async function getBlankedTweets(handle){
  let [tweets, _] = await clientGetPromise(tweet_url + handle);
  let recent_tweets_max_len = tweets.length;
  let recent_tweets = [];
  for (let i = 0; i < tweets.length; i+=1) {
    let tweet = tweets[i];
    let body = tweet.text;
    let obj = await wordGetPOSPromise(body);
    let wordArray = obj.nouns.concat(obj.verbs, obj.adjectives, obj.adverbs);
    if (wordArray.length > 0) {
      var word = wordArray[Math.floor(Math.random()*wordArray.length)];
      let possibilities = tcom.search(word);
      let body = tweet.text;
      let timestamp = (new Date(tweet.created_at)).toLocaleDateString();
      recent_tweets.push({body, timestamp, word, possibilities})
      if (recent_tweets.length >= recent_tweets_max_len) {
        return recent_tweets;
      }
    }
    else {
      recent_tweets_max_len -= 1;
    }
  }
}

async function getRecentTweets(handle){
  let [tweets, _] = await clientGetPromise(tweet_url + handle);
  var recent_tweets = [];
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
  return recent_tweets;
}

async function getUser(handle) {
  try {
    var [user_info, _] = await clientGetPromise(user_url + handle)
  } catch(error) {
    console.log(error);
    throw "User doesn't exist";
  }
  try {
    var [recent_tweets, _] = await getRecentTweets(handle)
  } catch(error) {
    console.log(error);
    throw "Error getting tweets";
  }
  let user = {
    "handle":           handle,
    "follower_count":   user_info[0].followers_count,
    "tweet_count":      user_info[0].statuses_count,
    "profile_pic_url":  user_info[0].profile_image_url,
    "recent_tweets":    recent_tweets
  }
  return user;
}

// HTTP Server

const express = require('express');
const http = require('http');

const port = process.env.PORT || 8080;

const app = express();
const static_dir = 'static';

app.use(express.static(static_dir));

const httpServer = http.createServer(app);

httpServer.listen(port, function() {
  console.log('Listening for HTTP requests on port ' + port);
});

// WebSocket Server

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

  ws.on('message', async function(data) {
    let messageString = data.toString();
    console.log('WS -> rx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString));

    try {
      var receivedMessage = JSON.parse(messageString);
    } catch(error) {
      console.log(error)
      return respondError(ws, req, 'Error parsing JSON request');
    }

    if (receivedMessage.request == 'userinfo') {
      let handle = receivedMessage.handle;
      if (!handle) {
        return respondError(ws, req, 'Missing handle for userinfo request');
      }
      // query api
      try {
        var user = await getUser(handle);
      } catch(error) {
        console.log(error)
        return respondError(ws, req, error);
      }
      let response = "userinfo";
      let message = {
        response,
        user
      };
      respond(ws, req, message);
    }

    else if (receivedMessage.request == 'blank') {
      let handle = receivedMessage.handle;
      if(!handle) {
        return respondError(ws, req, 'Missing handle for blank request');
      }
      // query api
      try {
        var recent_tweets = await getBlankedTweets(handle);
      } catch(error) {
        console.log(error)
        return respondError(ws, req, "Error getting tweets");
      }
      let response = "blank";
      let message = {response, recent_tweets};
      respond(ws, req, message);
    }

    else {
      respondError(ws, req, 'Unsupported request "' + receivedMessage.request + '"');
    }

  })
});

function respondError(ws, req, error) {
  let response = 'error';
  responseMessage = {
    response,
    error
  };
  respond(ws, req, responseMessage);
}

function respond(ws, req, responseMessage) {
  var messageString = JSON.stringify(responseMessage);
  ws.send(messageString);
  console.log('WS <- tx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString));
};
