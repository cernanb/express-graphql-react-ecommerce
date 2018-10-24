import Reset from '../components/Reset'
export default props => {
  console.log(props)
  return (
    <div>
      <p>Reset Your Password {props.query.resettoken}</p>
      <Reset resetToken={props.query.resettoken} />
    </div>
  )
}
