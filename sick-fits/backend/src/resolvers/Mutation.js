const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const stripe = require('../stripe')
const { hasPermission } = require('../utils')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error(`You must be logged in to do that!`)
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    )
    return item
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id
    return ctx.db.mutation.updateItem(
      {
        data: {
          ...updates
        },
        where: {
          id: args.id
        }
      },
      info
    )
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ title, id user { id } }`)
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))

    if (!ownsItem || !hasPermissions) {
      throw new Error("You don't have permission to do that")
    }
    return ctx.db.mutation.deleteItem({ where }, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    )

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error(`Invalid password`)
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return user
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Signed out successfully!' }
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } })

    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 36000000

    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })

    const mailRes = await transport.sendMail({
      from: 'cernanbdev@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(
        `Your password reset token is here! \n \n <a href="${
          process.env.FRONTEND_URL
        }/reset?resettoken=${resetToken}">Click here to reset</a>`
      )
    })

    return { message: 'Thanks' }
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error(`Passwords do not match!`)
    }

    const [user] = await ctx.db.query.users({
      where: { resetToken: args.resetToken, resetToken_gte: Date.now() - 3600000 }
    })
    if (!user) {
      throw new Error(`This token is either invalid or expired`)
    }

    const password = await bcrypt.hash(args.password, 10)

    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return user
  },
  async updatePermissions(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    )
    // check if they have permissions to do so
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.db.mutation.updateUser(
      {
        data: { permissions: { set: args.permissions } },
        where: { id: args.userId }
      },
      info
    )
  },
  async addToCart(parent, args, ctx, info) {
    // make sure they are signed in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be signed in')
    }
    // console.log(args.id)
    const [existingCartItem] = await ctx.db.query.cartItems(
      {
        where: {
          user: { id: userId },
          item: { id: args.id }
        }
      },
      info
    )
    // query the users current cart
    // check if that item is already in their cart
    // debugger
    if (existingCartItem) {
      console.log('this item is already in their cart')
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      })
    }

    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } }
        }
      },
      info
    )
    // if its not create a fresh cart item for that user
  },
  async removeFromCart(parent, args, ctx, info) {
    // find the cart item
    // make sure they own the cart item
    //delete that cart item
    const cartItem = await ctx.db.query.cartItem({ where: { id: args.id } }, `{ id, user { id}}`)

    if (!cartItem) {
      throw new Error('No CartItem found!!!')
    }

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('You do not own this cart item!!!')
    }
    console.log('deleting cart item')
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    )
  },
  async createOrder(parent, args, ctx, info) {
    // Query the current user and make sure they are signed in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be signed in')
    }

    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id 
        name 
        email 
        cart { 
          id 
          quantity 
          item { 
            title price id description image largeImage
          }
        }
      }`
    )
    // Recalculate the total for the price
    const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0)
    // Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    })
    // Convert the cart items to order items
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      }
      delete orderItem.id
      return orderItem
    })
    // Create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    })
    // Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({ where: { id_in: cartItemIds } })

    // Return the order to the client
    return order
  }
}

module.exports = Mutations
