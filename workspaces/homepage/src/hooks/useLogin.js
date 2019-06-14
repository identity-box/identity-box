import { useState, useEffect } from 'react'
import { navigate } from 'gatsby'

const useLogin = location => {
  const [ loggedIn, setLoggedIn ] = useState(false)
  useEffect(() => {
    if (!(location.state && location.state.authenticated)) {
      navigate('/login')
    } else {
      setLoggedIn(true)
    }
  })

  return loggedIn
}

export { useLogin }
