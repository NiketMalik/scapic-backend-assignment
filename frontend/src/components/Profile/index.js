import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import axios from 'axios'

import { Cookies } from 'helper'
import 'static/profile.scss'

class Profile extends Component {
	constructor() {
		super()

		this.state = {
			profileData: false
		}
		
		this.linkAccount = this.linkAccount.bind(this)
	}

	componentDidMount() {
		if(!Cookies.get('authToken')) {
			this.props.history.push('/auth/login')
			return
		}

		axios.get('/api/user/profile')
			.then(response => response.data.data)
			.then(profileData => this.setState({ profileData }, () => this.attachGplusButton()))
			.catch(error => alert(JSON.stringify(error, undefined, 2)))
	}

	attachGplusButton() {
		const linkAccount = this.linkAccount
		window.gapi.load('auth2', function(){
      const auth2 = window.gapi.auth2.init({
        client_id: '636391387213-0evlc62d28okk99gemcqb15pfil9s84q.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      })

      auth2.attachClickHandler(document.querySelector('.gplus-login'), {}, (googleUser) => {
        linkAccount('google', googleUser.getAuthResponse().id_token)
      }, function(error) {
        alert(JSON.stringify(error, undefined, 2))
      })
    })
	}

	deleteAccount() {
		axios.delete('/api/user/profile')
			.then(response => {
				Cookies.remove('authToken')
				this.props.history.push('/auth/login')
			})
			.catch(error => alert(JSON.stringify(error, undefined, 2)))
	}

	unlinkAccount(source) {
		axios.delete(`/api/auth/link?source=${source}`)
			.then(response => {
				this.setState({
					profileData: {
						...this.state.profileData,
						[source === 'facebook' ? 'fbid' : 'gid']: null
					}
				})
			})
			.catch(error => alert(JSON.stringify(error, undefined, 2)))
	}

	linkAccount(source, accessToken) {
		axios.post('/api/auth/link', { source, accessToken })
			.then(response => response.data.data)
			.then(data => {
				this.setState({
					profileData: {
						...this.state.profileData,
						[source === 'facebook' ? 'fbid' : 'gid']: data.id
					}
				})
			})
			.catch(error => alert(JSON.stringify(error, undefined, 2)))
	}

	fbHandle() {
		if(this.state.profileData.fbid)
			return this.unlinkAccount('facebook')

		window.FB.login(response => {
	    if (response.authResponse) {
	    	this.linkAccount('facebook', response.authResponse.accessToken)
	    } else alert("FB Login Denied.")
		})
	}

	gplusHandle() {
		if(this.state.profileData.gid)
			return this.unlinkAccount('google')

		document.querySelector('.gplus-login').click()
	}

	render() {
		const {
			profileData
		} = this.state

		if(!profileData)
			return 'loading...'

		return (
			<div className="container">
	  		<div className="gplus-login" />
			  <div className="profile profile--open">
			  	<div className="profile__section">
			  		<h2>{profileData.name}</h2>
			  		<span><i>{profileData._id}</i></span>
			  		<hr />

			  		<h4>Accounts</h4>
			  		<div className="social">
			  			<div className="fb-button" onClick={() => this.fbHandle()}>{!profileData.fbid ? 'Link' : 'Unlink'} with Facebook</div>
							<div className="gplus-button" onClick={() => this.gplusHandle()}>{!profileData.gid ? 'Link' : 'Unlink'} with Google</div>
			  		</div>

			  		<hr />
			  		<div className="delete" onClick={() => this.deleteAccount()}>Delete Account</div>

			  		<Link className="logout" to="/auth/login">Logout</Link>
			  	</div>
			  </div>
			</div>
		)
	}
}

export default withRouter(Profile)