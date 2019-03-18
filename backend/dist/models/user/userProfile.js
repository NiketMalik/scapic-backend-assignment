module.exports = (req, res) => new Promise((resolve, reject) => {
	try {
		if(!req.user)
			reject({ status: 403 })

		DB.User.findOne({ _id: ObjectId(req.user._id) }, '_id name email fbid gid', (err, details) => {
			if(err)
				throw new Error(err)
			
			resolve(details)
		})
	} catch(e) {
		console.error(e)
		reject({ status: 500 })
	}
})
.then(profileData => res.status(200).json(Response(200, profileData)))
.catch(({ error, status = 403 }) => res.status(status).json(Response(status, false, error)))