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
  request: checkhandle,
  handle: ...
}

### Response

{
  response: guess,
  tweet: {
    handle: ...,
    timestamp: ..,
    body:
   }
}


{
  request: checkhandle,
  valid: true/false
}

