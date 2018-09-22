import Items from '../components/Items'

export default props => (
  <div>
    <Items id={props.id} page={+props.query.page || 1} />
  </div>
)
