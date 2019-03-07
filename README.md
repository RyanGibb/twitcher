# Twitcher
Tweet guessing game.

![alt text](https://github.com/RyanGibb/twitcher/blob/master/static/alternate.jpg)

Live link! https://rtg2.host.cs.st-andrews.ac.uk/twitcher/

Modes:
  1. Guess who's tweet
  2. Fill in the blanks
  3. Markov chain random tweet
  4. Multi-user and voting

<!---
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
    tweet_count: ...,
    profile_pic_url: ...,
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
  recent_tweets: [
    {
      body: ...,
      word: ...,
      timestamp: ...,
      possibilities: {
        synonyms: [...],
        antonyms: [...]
    },
    ...
  }
}
{
  response: error,
  human_readable_error: ...,
  error: ...
}
-->
