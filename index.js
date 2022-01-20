
require("dotenv").config()

// Twitter API

const Twitter = require('twitter')
const thesaurus = require('thesaurus')
const WordPOS = require('wordpos')
const wordpos = new WordPOS()

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const tweet_url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?exclude_replies=true&include_rts=false&tweet_mode=extended&screen_name='

const user_url = 'https://api.twitter.com/1.1/users/lookup.json?screen_name='

clientGetPromise = (...args) => {
  return new Promise( (resolve, reject) =>
    client.get(...args,
      (error, data, response) => {
        if (error) reject(error)
        resolve( [data, response] )
      }
    )
  )
}

wordGetPOSPromise = (...args) => {
  return new Promise(resolve =>
    wordpos.getPOS(...args, obj => resolve(obj))
  )
}

async function getUser(handle) {
  try {
    let [user_info, _] = await clientGetPromise(user_url + handle)
    let user = {
      'follower_count':    user_info[0].followers_count,
      'tweet_count':       user_info[0].statuses_count,
      'profile_image_url': user_info[0].profile_image_url
    }
    return user
  } catch(error) {
    console.log(error)
    throw 'User doesn\'t exist'
  }
}

async function getRecentTweets(handle){
  let [tweets, _] = await clientGetPromise(tweet_url + handle)
  console.log(tweets)
  var recent_tweets = []
  for (let i = 0; i < tweets.length; i++) {
    let tweet = tweets[i]
    let body = tweet.full_text.replace(/(?:https?):\/\/[\n\S]+/g, '').trim()
    let timestamp = (new Date(tweet.created_at)).tolocalestring("en-GB")
	if (body != "") {
      recent_tweets.push({
        body,
        timestamp
      })
	}
  }
  return recent_tweets
}

async function getBlankedTweets(handle){
  let [tweets, _] = await clientGetPromise(tweet_url + handle)
  let recent_tweets = []
  for (let i = 0; i < tweets.length; i+=1) {
    let tweet = tweets[i]
    let body = tweet.full_text.replace(/(?:https?):\/\/[\n\S]+/g, '').trim()
    let obj = await wordGetPOSPromise(body)
    let words = obj.nouns.concat(obj.verbs, obj.adjectives, obj.adverbs)
	for (let j = 0; j < words.length; j+=1) {
	  let word = words[j]
	  let possibilities = thesaurus.find(word)
	  if (possibilities.length > 1) {
		let timestamp = (new Date(tweet.created_at)).tolocalestring("en-GB")
        recent_tweets.push({body, timestamp, word, possibilities})
		// only one entry per tweek
		break;
	  }
    }
  }
  return recent_tweets
}

// HTTP Server

const express = require('express')
const port = process.env.PORT || 8080
const app = express()
const static_dir = 'static'

app.use(express.json())
app.use(express.static(static_dir))

app.post('/userinfo', async (req, res) => {
  transmissionLog('userinfo -> rx ' + JSON.stringify(req.body))
  let handle = req.body.handle
  if (!handle) {
    console.log('Missing handle')
    res.status(500).json({ error: 'Missing handle' })
    return
  }
  try {
    let user = await getUser(handle)
    res.json(user)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'Error getting user info' })
  }
})

app.post('/recentTweets', async (req, res) => {
  transmissionLog('userinfo -> rx ' + JSON.stringify(req.body))
  let handle = req.body.handle
  if (!handle) {
    console.log('Missing handle')
    res.status(500).json({ error: 'Missing handle' })
    return
  }
  try {
    let recent_tweets = await getRecentTweets(handle)
    res.json(recent_tweets)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'Error getting recent tweets' })
  }
})

app.post('/recentTweetsBlanked', async (req, res) => {
  transmissionLog('blank -> rx ' + JSON.stringify(req.body))
  let handle = req.body.handle
  if(!handle) {
    console.log('Missing handle')
    res.status(500).json({ error: 'Missing handle' })
    return
  }
  try {
    let recent_tweets = await getBlankedTweets(handle)
    res.json(recent_tweets)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'Error getting blanked recent tweets' })
  }
})

app.listen(port, () => {
  console.log('Listening for HTTP requests on port ' + port)
})

const maxTransmitionLogLength = 200

function transmissionLog(message){
  console.log((message.length > maxTransmitionLogLength ? message.slice(0, maxTransmitionLogLength) + '...' : message))
}
