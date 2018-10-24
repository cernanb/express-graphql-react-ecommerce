import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'
import PropTypes from 'prop-types'

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($password: String!, $confirmPassword: String!, $token: String!) {
    resetPassword(confirmPassword: $confirmPassword, password: $password, token: $token) {
      id
      email
      name
    }
  }
`

export default class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }
  state = { password: '', confirmPassword: '' }

  handleInputChange = e =>
    this.setState({
      [e.target.name]: e.target.value
    })
  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{ ...this.state, token: this.props.resetToken }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { loading, data, error }) => {
          return (
            <Form
              method="POST"
              onSubmit={async e => {
                e.preventDefault()
                const res = await resetPassword()
                this.setState({ confirmPassword: '', password: '' })
                // Router.push({
                //   pathname: '/items'
                // })
                console.log('Password reset!')
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Reset Your Password</h2>
                <Error error={error} />

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
                <label htmlFor="password">
                  Confirm Password
                  <input
                    type="password"
                    onChange={this.handleInputChange}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={this.state.confirmPassword}
                    required
                  />
                </label>
                <button type="submit">Change Password</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}
