const bcrypt = require('bcrypt')
const request = require('request-promise-native')
const { generateToken } = require('./helper')

module.exports = (req, res) => new Promise((resolve, reject) => {
	try {
		const {
			email = '',
			source,
			password = '',
			accessToken
		} = req.body

		if(!source)
			reject({ error: 'Expected Mutation.source got null' })

		if(!['default', 'facebook', 'google'].includes(source))
			reject({ error: 'Unexpected value for Mutation.source' })

		let user = false
		switch(source) {
			case 'default':
				DB.User.findOne({ email, isActive: true }, (err, details) => {
					if(err)
						throw new Error(err)
					
					if(!details || !bcrypt.compareSync(password, details.password))
						reject({
							status: 403,
							error: 'Invalid credentials.'
						})
					else
						resolve({
							_id: details._id,
							token: generateToken(details)
						})
				})
			break;
			case 'facebook':
				request.get({
					url: `https://graph.facebook.com/me?access_token=${accessToken}`,
					json: true
				}).then(response => {
					DB.User.findOne({ fbid: response.id }, (err, details) => {
						if(err)
							throw new Error(err)

						if(!details)
							reject({
								status: 403,
								error: 'User not found, register.'
							})
						else
							resolve({
								_id: details._id,
								token: generateToken(details)
							})
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

					DB.User.findOne({ gid: response.sub }, (err, details) => {
						if(err)
							throw new Error(err)
						
						if(!details)
							reject({
								status: 403,
								error: 'User not found, register.'
							})
						else
							resolve({
								_id: details._id,
								token: generateToken(details)
							})
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