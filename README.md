# Twitcher
Tweet guessing game.

Live link! https://rtg2.host.cs.st-andrews.ac.uk/twitcher/

Modes:
  1. Guess who's tweet
  2. Fill in the blanks
  3. Markov chain random tweet
  4. Multi-user and voting

## WebSocket Protocol

### Request

{
  request: userinfo,
  handle: ...
}

{
  request: blank,
  handle: ...
}

### Response

{
  response: userinfo,
  user: {
    handle: ...,
    follower_count: ...,
    tweet_count: ...
    recent_tweets: [
      {
        body: ...,
        timestamp: ..
      },
      {
        body: ...,
        timestamp: ..
      },
      ...
    ]
   }
}

{
  response: blank,
  handle: ...,
  tweat: {
    body: ...,
    word: ...,
    timestamp: ...,
    possibilities: {
      synonyms: [...],
      antonyms: [...]
    }
  }
}

{
  response: error,
  human_readable_error: ...,
  error: ...
}
