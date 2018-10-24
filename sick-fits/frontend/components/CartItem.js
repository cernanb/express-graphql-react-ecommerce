import React, { Component } from 'react'
import formatMoney from '../lib/formatMoney'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import RemoveFromCart from './RemoveFromCart'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`

const CartItem = ({ item }) => {
  if (!item.item)
    return (
      <CartItemStyles>
        <p>This item has been removed</p>
        <RemoveFromCart id={item.id} />
      </CartItemStyles>
    )
  return (
    <CartItemStyles>
      <img width="100" src={item.item.image} alt={item.item.title} />
      <div className="cart-item-details">
        <h3>{item.item.title}</h3>
        <p>
          {formatMoney(item.item.price * item.quantity)}
          {' - '}
          <em>
            {item.quantity} &times; {formatMoney(item.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={item.id} />
    </CartItemStyles>
  )
}

CartItem.propTypes = {
  item: PropTypes.object.isRequired
}

export default CartItem
