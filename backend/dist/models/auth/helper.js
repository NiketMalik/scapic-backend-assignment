const jwt = require('jsonwebtoken')

exports.generateToken = (details) => jwt.sign(
	{ 
		user: {
			_id: details._id.toString() 
		}
	},
	process.env.JWT_SECRET,
	{
		//algorithm : 'RS256', // generate a key file
		issuer: 'https://sso.scapic.com',
		subject: details._id.toString(),
		expiresIn: 30 * 24 * 60 * 60  // 30 days 
	}
)