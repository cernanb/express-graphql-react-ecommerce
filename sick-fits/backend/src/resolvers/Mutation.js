const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Checked if they are logged in
    // const { title, description, image, }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const item = await ctx.db.query.item({ where }, `{ title, id }`)

    return ctx.db.mutation.deleteItem({ where }, info)
  }
}

module.exports = Mutations
