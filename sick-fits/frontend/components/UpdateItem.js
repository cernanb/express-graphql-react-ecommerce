import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import gql from 'graphql-tag'
import Router from 'next/router'
import Error from './ErrorMessage'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`

export const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int) {
    updateItem(id: $id, title: $title, description: $description, price: $price) {
      id
      title
      description
      price
    }
  }
`

class UpdateItem extends Component {
  state = {}

  updateItem = async (e, updateItemMutation) => {
    e.preventDefault()

    const res = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state
      }
    })
    Router.push({
      pathname: '/item',
      query: { id: res.data.updateItem.id }
    })
  }

  handleInputChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          console.log(data.item.title)
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.updateItem(e, updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleInputChange}
                      />
                    </label>
                    <label htmlFor="price">
                      Price
                      <input
                        onChange={this.handleInputChange}
                        type="number"
                        id="price"
                        name="price"
                        placeholder="price"
                        defaultValue={data.item.price}
                        required
                      />
                    </label>
                    <label htmlFor="description">
                      Description
                      <textarea
                        onChange={this.handleInputChange}
                        id="description"
                        name="description"
                        placeholder="description"
                        defaultValue={data.item.description}
                        required
                      />
                    </label>
                    <button type="submit">
                      Sav
                      {loading ? 'ing' : 'e'} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem
