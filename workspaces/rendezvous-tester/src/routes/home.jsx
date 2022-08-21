import { ButtonBlack } from '../components/ButtonBlack'

const Home = () => (
  <div className='flex flex-col justify-center items-center h-screen'>
    <p>What would you like to test?</p>
    <div className='h-5' />
    <ButtonBlack to='/rendezvous-client'>Rendezvous Client</ButtonBlack>
    <div className='h-5' />
    <ButtonBlack to='/rendezvous-tunnel-sender'>Rendezvous Tunnel</ButtonBlack>
  </div>
)

export default Home
