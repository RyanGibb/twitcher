# stackscheck2019
Tweet guessing game.

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
   
### Responce

{
  responce: guess,
  tweet: {
    handle: ...,
    timestamp: ..,
    body:
   }
}
