const bcrypt = require('bcrypt')
const request = require('request-promise-native')
const { generateToken } = require('./helper')

const saveUser = (user) => {
	return new Promise((resolve, reject) => {
		user.save((err, details) => {
			if(err) {
				if(err.errors)
					reject({
						error: Object.values(err.errors).map(x => x.message)
					})
				else
					reject({ status: 500 })
			} else {
				resolve({
					_id: details._id,
					token: generateToken(details)
				})
			}
		})
	})
}

module.exports = (req, res) => new Promise((resolve, reject) => {
	try {
		const {
			name = '',
			email = '',
			source,
			password,
			accessToken
		} = req.body

		if(!source)
			reject({ error: 'Expected Mutation.source got null' })

		if(!['default', 'facebook', 'google'].includes(source))
			reject({ error: 'Unexpected value for Mutation.source' })

		switch(source) {
			case 'default':
				if(!password || password.length === 0)
					reject({ error: 'Expected Mutation.source got null' })

				DB.User.findOne({ email, isActive: true }, (err, details) => {
					if(err)
						throw new Error(err)

					if(details)
						return reject({
							error: 'User already exists'
						})
				})

				saveUser(new DB.User({ name, email, password: bcrypt.hashSync(password, 10) })).then(resolve).catch(reject)

			break;
			case 'facebook':
				request.get({
					url: `https://graph.facebook.com/me?fields=email,name&access_token=${accessToken}`,
					json: true
				}).then(response => {
					DB.User.findOne({ fbid: response.id }, (err, details) => {
						if(err)
							throw new Error(err)

						if(details)
							reject({
								error: 'User already exists'
							})
						else 
							saveUser(new DB.User({ name: response.name, email: response.email })).then(resolve).catch(reject)
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

						if(details)
							reject({
								error: 'User already exists'
							})
						else
							saveUser(new DB.User({ name: response.name, email: response.email })).then(resolve).catch(reject)
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