import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Loadable from 'react-loadable'

import axios from 'axios'
import { Cookies } from 'helper'

axios.defaults.baseURL = 'http://localhost:3001'

if(Cookies.get('authToken'))
  axios.defaults.headers['authorization'] = `Bearer ${Cookies.get('authToken')}`

const Landing = Loadable({
  loader: () => import(/* webpackChunkName: "landing" */ 'components/Landing'),
  loading: () => ''
})

const Auth = Loadable({
  loader: () => import(/* webpackChunkName: "auth" */ 'components/Auth'),
  loading: () => ''
})

const Profile = Loadable({
  loader: () => import(/* webpackChunkName: "auth" */ 'components/Profile'),
  loading: () => ''
})

class App extends Component {
  render() {
    return (
      <Router>
        <Route path="/" exact component={Landing} />
        <Route path="/auth/:section(login|register)" exact component={Auth} />
        <Route path="/profile" exact component={Profile} />
      </Router>
    )
  }
}

export default App;
