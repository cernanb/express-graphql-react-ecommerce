import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`

export default class Signin extends Component {
  state = { email: '', password: '' }

  handleInputChange = e =>
    this.setState({
      [e.target.name]: e.target.value
    })
  render() {
    return (
      <Mutation mutation={SIGNIN_MUTATION} variables={this.state} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {(signin, { loading, data, error }) => {
          return (
            <Form
              method="POST"
              onSubmit={async e => {
                e.preventDefault()
                const res = await signin()
                this.setState({ email: '', name: '', password: '' })
                Router.push({
                  pathname: '/items'
                })
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign In to Your Account</h2>
                <Error error={error} />

                <label htmlFor="email">
                  Email
                  <input
                    onChange={this.handleInputChange}
                    type="email"
                    name="email"
                    placeholder="email"
                    value={this.state.email}
                    required
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    onChange={this.handleInputChange}
                    name="password"
                    placeholder="password"
                    value={this.state.password}
                    required
                  />
                </label>
                <button type="submit">Signin</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}
