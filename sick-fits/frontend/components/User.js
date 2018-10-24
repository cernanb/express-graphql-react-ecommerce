import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

export const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      cart {
        quantity
        id
        item {
          description
          price
          image
          title
          id
        }
      }
    }
  }
`

const User = props => {
  return (
    <Query {...props} query={CURRENT_USER_QUERY}>
      {payload => props.children(payload)}
    </Query>
  )
}

User.propTypes = {
  children: PropTypes.func.isRequired
}

export default User
