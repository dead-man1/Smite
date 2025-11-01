import { useEffect, useState, useRef } from 'react'
import api from '../api/client'

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs?limit=100')
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && logs.length === 0) {
    return <div className="text-center py-12">Loading logs...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Logs</h1>

      <div className="bg-gray-900 rounded-lg border border-gray-200 p-4 font-mono text-sm overflow-auto" style={{ maxHeight: '600px' }}>
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={getLevelColor(log.level)}>[{log.level}]</span>{' '}
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export default Logs

