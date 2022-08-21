import { Link } from 'react-router-dom'

const ButtonBlack = ({ to, children }) => (
  <Link to={to}>
    <div className='bg-black hover:bg-red-900 p-2 rounded text-white'>
      {children}
    </div>
  </Link>
)

export { ButtonBlack }
