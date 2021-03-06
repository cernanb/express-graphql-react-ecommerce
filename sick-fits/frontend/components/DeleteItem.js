import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { ALL_ITEMS_QUERY } from './Items'

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

export default class DeleteItem extends Component {
  update = (cache, payload) => {
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY })
    console.log(data)
    data.items = data.items.filter(i => i.id !== payload.data.deleteItem.id)
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data })
  }
  render() {
    return (
      <Mutation mutation={DELETE_ITEM_MUTATION} variables={{ id: this.props.id }} update={this.update}>
        {(deleteItem, { error }) => {
          return (
            <button
              onClick={() => {
                if (confirm('Sure you want to delete?')) {
                  deleteItem().catch(err => alert(err.message))
                }
              }}
            >
              {this.props.children}
            </button>
          )
        }}
      </Mutation>
    )
  }
}
