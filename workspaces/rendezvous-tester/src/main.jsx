import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import Home from './routes/home'
import RendezvousClient from './routes/rendezvous-client'
import RendezvousTunnelSender from './routes/rendezvous-tunnel-sender'
import RendezvousTunnelReceiver from './routes/rendezvous-tunnel-receiver'
import './index.css'
import { Buffer } from 'buffer'

window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/rendezvous-client' element={<RendezvousClient />} />
      <Route path='/rendezvous-tunnel-sender' element={<RendezvousTunnelSender />} />
      <Route path='/rendezvous-tunnel-receiver' element={<RendezvousTunnelReceiver />} />
    </Routes>
  </BrowserRouter>
)
