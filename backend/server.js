'use strict'
require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const cors = require('cors')
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const jwt = require('jsonwebtoken')

app.use(cors())
app.use(compression())
app.use(bodyParser.json({ limit: '5mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))
app.disable('x-powered-by')

app.use((req, res, next) => {
	if(req.headers['authorization']) {
		jwt.verify(
			(req.headers['authorization'] || '').replace('Bearer ', ''), 
			process.env.JWT_SECRET, 
			{ 
				// algorithms: ['RS256'], 
				issuer: 'https://sso.scapic.com' 
			}, 
			(err, decoded) => {
			if(err) {
				if(err.name === 'TokenExpiredError')
					res.status(401).json(Response(401))
				else 
					res.status(403).json(Response(403))
			} else {
				// Token is valid
				// In addition a redis check should be applied
				req.user = decoded.user
				next()
			}
		})
	} else next()
})

// Routes
const Routes = require('./dist')
app.use('/api', Routes)

// Listen on 0.0.0.0 for Internal IP resolution as well
app.on('fullSailAhead', () => {
	server.listen(process.env.PORT || 3001, '0.0.0.0', () => {
		console.log(`API running at http://127.0.0.1:${server.address().port}`)
	})
})

// Fire up all Engines
require('./globals')(app)