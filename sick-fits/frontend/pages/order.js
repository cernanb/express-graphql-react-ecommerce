import PleaseSignin from '../components/PleaseSignin'
import Order from '../components/Order'

export default props => (
  <div>
    <PleaseSignin>
      <Order id={props.query.id} />
    </PleaseSignin>
  </div>
)
