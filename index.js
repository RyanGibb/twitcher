
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
const port = process.env.PORT || 8080;
const app = express();
const static_dir = 'static';

app.use(express.urlencoded())
app.use(express.static(static_dir));

app.post('/userinfo', async (req, res) => {
  transmissionLog('userinfo -> rx ' + JSON.stringify(req.body))
  let handle = req.body.handle;
  if (!handle) {
    console.log('Missing handle for userinfo request')
    res.status(500).json({ error: 'Missing handle for userinfo request' });
    return;
  }
  try {
    let user = await getUser(handle);
    res.json(user);
  } catch(error) {
    console.log(error)
    res.status(500).json({ error });
  }
});

app.post('blank', async (req, res) => {
  transmissionLog('blank -> rx ' + JSON.stringify(req.body))
  let handle = req.body.handle;
  if(!handle) {
    console.log('Missing handle for userinfo request')
    res.status(500).json({ error: 'Missing handle for userinfo request' });
    return;
  }
  try {
    let recent_tweets = await getBlankedTweets(handle);
    res.json(recent_tweets)
  } catch(error) {
    console.log(error);
    res.status(500).json({ error: 'Error getting tweets' });
  }
});

app.listen(port, () => {
  console.log('Listening for HTTP requests on port ' + port);
});

const maxTransmitionLogLength = 200;

function transmissionLog(message){
  console.log((message.length > maxTransmitionLogLength ? message.slice(0, maxTransmitionLogLength) + "..." : message));
}
