import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

export default class Signin extends Component {
  state = { email: '' }

  handleInputChange = e =>
    this.setState({
      [e.target.name]: e.target.value
    })
  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(requestReset, { loading, called, error }) => {
          return (
            <Form
              method="POST"
              onSubmit={async e => {
                e.preventDefault()
                const res = await requestReset()
                this.setState({ email: '' })
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Reset Your Password</h2>
                <Error error={error} />
                {!error && !loading && called && <p>Success! Check your email for a reset link!</p>}
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

                <button type="submit">Request Reset</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}
