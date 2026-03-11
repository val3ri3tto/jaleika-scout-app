import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PlayerForm from './pages/PlayerForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/new" element={<PlayerForm />} />
        <Route path="/player/:id" element={<PlayerForm />} />
      </Routes>
    </BrowserRouter>
  )
}
