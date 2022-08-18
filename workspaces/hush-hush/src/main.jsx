import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import Home from './routes/home'
import Secret from './routes/secret'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import { Buffer } from 'buffer'

window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/secret' element={<Secret />} />
    </Routes>
  </BrowserRouter>
)
