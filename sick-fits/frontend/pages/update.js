import Link from 'next/link'

import UpdateItem from '../components/UpdateItem'

export default props => (
  <div>
    <UpdateItem id={props.query.id} />
  </div>
)
