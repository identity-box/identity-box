import { useEffect, useState } from 'react'
import useSWR from 'swr'

export default function Home () {
  const { data, error } = useSWR('/api/hello', fetch)
  const [name, setName] = useState('')

  useEffect(async () => {
    if (data) {
      const { name } = await data.json()
      setName(name)
    }
  }, [data])

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return (
    <div css={{
      display: 'flex',
      height: '100vh',
      margin: 0,
      padding: 0,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Roboto Mono, monospace'
    }}
    >
      <p>hello {name}!</p>
    </div>
  )
}
