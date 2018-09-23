import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import gql from 'graphql-tag'
import Router from 'next/router'
import Error from './ErrorMessage'

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(title: $title, description: $description, price: $price, image: $image, largeImage: $largeImage) {
      id
    }
  }
`

class CreateItem extends Component {
  state = { title: '', description: '', image: '', largeImage: '', price: 0 }

  handleInputChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  uploadFile = async e => {
    console.log('uploading file...')
    const { files } = e.target
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')

    const res = await fetch(`https://api.cloudinary.com/v1_1/cernan-bernardo/image/upload`, {
      method: 'POST',
      body: data
    })

    const file = await res.json()
    console.log(file)
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error, called, data }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault()
              const res = await createItem()
              console.log(res)
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id }
              })
            }}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  onChange={this.uploadFile}
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                />
                {this.state.image && <img src={this.state.image} alt="Upload Preview" />}
              </label>
              <label htmlFor="title">
                Title
                <input
                  onChange={this.handleInputChange}
                  type="text"
                  id="title"
                  name="title"
                  placeholder="title"
                  value={this.state.title}
                  required
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
                  value={this.state.price}
                  required
                />
              </label>
              <label htmlFor="description">
                Price
                <textarea
                  onChange={this.handleInputChange}
                  id="description"
                  name="description"
                  placeholder="description"
                  value={this.state.description}
                  required
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
