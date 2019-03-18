const request = require('request-promise-native')

module.exports = (req, res) => new Promise((resolve, reject) => {
	try {
		const {
			source,
			accessToken
		} = req.body

		if(!source)
			reject({ error: 'Expected Mutation.source got null' })

		if(!['facebook', 'google'].includes(source))
			reject({ error: 'Unexpected value for Mutation.source' })

		switch(source) {
			case 'facebook':
				request.get({
					url: `https://graph.facebook.com/me?access_token=${accessToken}`,
					json: true
				}).then(response => {
					DB.User.updateOne({ _id: ObjectId(req.user._id) }, { fbid: response.id }, (err, details) => {
						if(err)
							throw new Error(err)
						
						resolve({ id: response.id })
					})
				}).catch(err => reject({ status: 403 }))
			break;
			case 'google':
				request.get({
					url: `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`,
					json: true
				}).then(response => {
					if(response.aud !== process.env.GOOGLE_AUD_ID)
						return reject({ status: 403 })
					DB.User.updateOne({ _id: ObjectId(req.user._id) }, { gid: response.sub }, (err, details) => {
						if(err)
							throw new Error(err)
						
						resolve({ id: response.sub })
					})
				}).catch(err => reject({ status: 403 }))
			break;
		}
	} catch(e) {
		console.error(e)
		reject({ status: 500 })
	}
})
.then(userData => res.status(200).json(Response(200, userData)))
.catch(({ error, status = 400 }) => res.status(status).json(Response(status, false, error)))