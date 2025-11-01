import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Nodes from './pages/Nodes'
import Tunnels from './pages/Tunnels'
import Settings from './pages/Settings'
import Logs from './pages/Logs'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/tunnels" element={<Tunnels />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

