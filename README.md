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

### Response

{
  response: userinfo,
  valid: true/false,
  user: {
    follower_count: ...,
    tweet_count: ...
    recent-tweets: [
      {
        body: ...,
        handle: ...,
        timestamp: ..
      },
      {
        body: ...,
        handle: ...,
        timestamp: ..
      },
      ...
    ]
   }
}
 
{
  response: error,
  human_readable_error: ...,
  error: ...
}

