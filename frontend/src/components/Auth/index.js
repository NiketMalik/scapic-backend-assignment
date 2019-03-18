import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'

import { Cookies } from 'helper'
import axios from 'axios'

import 'static/auth.scss'

class Auth extends Component {
	constructor() {
		super()

		this.state = {
			name: '',
			email: '',
			password: '',
			googleLoaded: false
		}

		this.doAuth = this.doAuth.bind(this)
	}

	componentDidMount() {
		Cookies.remove('authToken')

		const doAuth = this.doAuth
	 	window.gapi.load('auth2', function(){
      const auth2 = window.gapi.auth2.init({
        client_id: '636391387213-0evlc62d28okk99gemcqb15pfil9s84q.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      })

      auth2.attachClickHandler(document.querySelector('.gplus-button'), {}, (googleUser) => {
        doAuth({ accessToken: googleUser.getAuthResponse().id_token, source: 'google' })
      }, function(error) {
        alert(JSON.stringify(error, undefined, 2))
      })
    })
	}

	fbLogin() {
		window.FB.login((response) => {
	    if (response.authResponse) {
	    	this.doAuth({ accessToken: response.authResponse.accessToken, source: 'facebook' })
	    } else alert("FB Login Denied.")
		})
	}

	handleSubmit = e => {
		const section = this.props.match.params.section
		const {
			name,
			email,
			password
		} = this.state

		const payload = {
			email,
			password,
			source: 'default'
		}

		if(section === 'register' && !/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g.test(name))
			return alert('Invalid Name')
		else
			payload.name = name

		if(!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test((email || "").toLowerCase()))
			return alert('Invalid Email')

		if(!password)
			return alert('Password cannot be empty')

		this.doAuth(payload)
	}

	doAuth(payload) {
		const section = this.props.match.params.section

		axios.post(`/api/auth/${section}`, payload).then(response => {
			Cookies.set('authToken', response.data.data.token)
			axios.defaults.headers['authorization'] = `Bearer ${response.data.data.token}`
			this.props.history.push('/profile')
		}).catch(err => {
			if(err.response && err.response.data)
				alert(JSON.stringify(err.response.data.message, undefined, 2))
			else
				alert('Cannot reach API server')
		})
	}

	render() {
		const section = this.props.match.params.section

		return (
	  	<div className="container">
			  <div className="profile profile--open">
					<div className="profile__social">
						<div className="fb-button" onClick={() => this.fbLogin()}>Facebook</div>
						<div className="dummy" />
						<div className="gplus-button">Google</div>
					</div>

			    <div className="profile__form">
			      <div className="profile__fields">
			        {
			        	section === 'register' &&
			        	<div className="field">
			          	<input type="name" id="fieldUser" className="input" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} required />
			          	<label for="fieldUser" className="label">Name</label>
			        	</div>
			        }
			        <div className="field">
			          <input type="email" id="fieldUser" className="input" value={this.state.email} onChange={e => this.setState({ email: e.target.value })} required />
			          <label for="fieldUser" className="label">Email</label>
			        </div>
			        <div className="field">
			          <input type="password" id="fieldPassword" className="input" value={this.state.password} onChange={e => this.setState({ password: e.target.value })} required/>
			          <label for="fieldPassword" className="label">Password</label>
			        </div>
			        <div className="profile__footer">
			          <button className="btn" onClick={this.handleSubmit}>{section}</button>
			        </div>
			      </div>
			     	{
				    	section === 'login' &&
					    <div className="nav">Not a member? <Link to="/auth/register">Register Now</Link></div>
				    }

				    {
				    	section === 'register' &&
					    <div className="nav">Already a member? <Link to="/auth/login">Login Now</Link></div>
				    }
			    </div>
			  </div>
			</div>
		)
	}
}

export default withRouter(Auth)