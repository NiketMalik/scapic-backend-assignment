const mongoose = require('mongoose')
 
const connection = mongoose.connect(
	`${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/scapic?retryWrites=true`, 
	{
		useCreateIndex: true,
		useNewUrlParser: true
	}
)
mongoose.connection.on('error', console.error.bind(console, 'MongoDB Connection Broken.'))

const UserSchema = new mongoose.Schema({
  name: {
  	type: String,
  	validate: {
  		validator: (value) => /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g.test(value),
  		message: 'Unexpected value for Mutation.name'
  	}
  },
  email: {
  	type: String,
  	validate: {
  		validator: (value) => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test((value || "").toLowerCase()),
  		message:'Unexpected value for Mutation.email'
  	}
  },
  password: {
  	type: String,
  	default: null
  },
  fbid: {
  	type: String,
  	default: null
  },
  gid: {
  	type: String,
  	default: null
  },
  registeredOn: {
  	type: Date,
  	default: Date.now
  },
  isActive: {
  	type: Boolean,
  	default: true
  }
})

const User = mongoose.model('user', UserSchema)

global.ObjectId = mongoose.Types.ObjectId
global.DB = {
	User
}

module.exports = (app) => mongoose.connection.once('open', () => app.emit('fullSailAhead'))