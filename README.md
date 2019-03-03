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
  request: guess,
  handles: [
    handle1,
    handle2,
    handle3,
    ...
  ]
}

{
  request: blanked,
  handles: [
    handle1,
    handle2,
    handle3,
    ...
  ]
 }
 
{
  request: userinfo,
  handle: ...
}

### Response

{
  response: guess,
  tweet: {
    body: ...,
    handle: ...,
    timestamp: ..
   }
}

{
  response: blanked,
  tweet: {
    body: ...,
    blanked_body: ...,
    noun: ...,
    handle: ...,
    timestamp: ..,
  }
}

{
  response: userinfo,
  user: {
    valid: true/false,
    follower_count: ...,
    tweet_count: ...
   }
}
 
{
  response: error,
  human_readable_error: ...,
  error: ...
}

