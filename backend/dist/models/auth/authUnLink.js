module.exports = (req, res) => new Promise((resolve, reject) => {
	try {
		const {
			source
		} = req.query

		if(!source)
			reject({ error: 'Expected Mutation.source got null' })

		if(!['facebook', 'google'].includes(source))
			reject({ error: 'Unexpected value for Mutation.source' })

		let dbPayload = {}
		if(source === 'facebook')
			dbPayload = { fbid: null }

		if(source === 'google')
			dbPayload = { gid: null }

		// should additionally unlink from fb/google
		DB.User.updateOne({ _id: ObjectId(req.user._id) }, dbPayload, (err, details) => {
			if(err)
				throw new Error(err)
			
			resolve({ success: true })
		})
	} catch(e) {
		console.error(e)
		reject({ status: 500 })
	}
})
.then(userData => res.status(200).json(Response(200, userData)))
.catch(({ error, status = 400 }) => res.status(status).json(Response(status, false, error)))