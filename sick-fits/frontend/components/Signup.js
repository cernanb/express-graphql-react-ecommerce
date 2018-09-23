import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_QUERY($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      id
      email
      name
    }
  }
`

export default class Signup extends Component {
  state = { email: '', password: '', name: '' }

  handleInputChange = e =>
    this.setState({
      [e.target.name]: e.target.value
    })
  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {(signup, { loading, data, error }) => {
          return (
            <Form
              method="POST"
              onSubmit={async e => {
                e.preventDefault()
                const res = await signup()
                this.this.setState({ email: '', name: '', password: '' })
                Router.push({
                  pathname: '/items'
                })
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign Up for an Account</h2>
                <Error error={error} />
                <label htmlFor="name">
                  Name
                  <input
                    onChange={this.handleInputChange}
                    type="text"
                    name="name"
                    placeholder="name"
                    value={this.state.name}
                    required
                  />
                </label>
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
                <button type="submit">Signup</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}
