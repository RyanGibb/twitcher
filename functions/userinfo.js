
const Twitter = require('twitter')

const client = new Twitter({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token_key: process.env.ACCESS_TOKEN_KEY,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

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
	
export const onRequestPost = async ({ request }) => {
	const { handle } = await request.json()
	if (!handle) {
		return new Response({ error: 'Missing handle' }, { status: 500 })
	}
	try {
		let user = await getUser(handle)
		return new Response(user)
	} catch (error) {
		return new Response({ error: 'Error getting user info' }, { status: 500 })
	}
}

export const onRequestGet = () => {
//	 let handle = req.body.handle
//	 if (!handle) {
//		 console.log('Missing handle')
//		 res.status(500).json({ error: 'Missing handle' })
//		 return
//	 }
//	 try {
//		 let user = await getUser(handle)
//		 res.json(user)
//	 } catch(error) {
//		 console.log(error)
//		 res.status(500).json({ error: 'Error getting user info' })
//	 }
	return new Response(`Hello`)
}
