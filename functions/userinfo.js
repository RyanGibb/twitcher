
const Twitter = require('twitter')

export const onRequestGet = () => {
//   transmissionLog('userinfo -> rx ' + JSON.stringify(req.body))
//   let handle = req.body.handle
//   if (!handle) {
//     console.log('Missing handle')
//     res.status(500).json({ error: 'Missing handle' })
//     return
//   }
//   try {
//     let user = await getUser(handle)
//     res.json(user)
//   } catch(error) {
//     console.log(error)
//     res.status(500).json({ error: 'Error getting user info' })
//   }
    return new Response("hello")
}
