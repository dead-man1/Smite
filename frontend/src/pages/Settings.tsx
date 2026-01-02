import { useState, useEffect } from 'react'
import api from '../api/client'

interface FrpSettings {
  enabled: boolean
  port: number
  token?: string
}

interface TelegramSettings {
  enabled: boolean
  bot_token?: string
  admin_ids: string[]
  backup_enabled?: boolean
  backup_interval?: number
  backup_interval_unit?: string
}

interface SettingsData {
  frp: FrpSettings
  telegram: TelegramSettings
}

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    frp: { enabled: false, port: 7000 },
    telegram: { enabled: false, admin_ids: [] }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/settings', settings)
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      await loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateFrp = (updates: Partial<FrpSettings>) => {
    setSettings(prev => ({
      ...prev,
      frp: { ...prev.frp, ...updates }
    }))
  }

  const updateTelegram = (updates: Partial<TelegramSettings>) => {
    setSettings(prev => ({
      ...prev,
      telegram: { ...prev.telegram, ...updates }
    }))
  }

  const addAdminId = () => {
    const newId = prompt('Enter admin user ID:')
    if (newId && newId.trim()) {
      updateTelegram({
        admin_ids: [...settings.telegram.admin_ids, newId.trim()]
      })
    }
  }

  const removeAdminId = (index: number) => {
    updateTelegram({
      admin_ids: settings.telegram.admin_ids.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* FRP Communication Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">FRP Communication</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use FRP reverse tunnel for panel-node communication instead of direct HTTP.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="frp-enabled"
                checked={settings.frp.enabled}
                onChange={(e) => updateFrp({ enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="frp-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable FRP Communication
              </label>
            </div>

            {settings.frp.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    FRP Port
                  </label>
                  <input
                    type="number"
                    value={settings.frp.port}
                    onChange={(e) => updateFrp({ port: parseInt(e.target.value) || 7000 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="7000"
                    min="1"
                    max="65535"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Port where FRP server listens for node connections
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    FRP Token (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.frp.token || ''}
                    onChange={(e) => updateFrp({ token: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Leave empty for no authentication"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Optional authentication token for FRP connections
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Telegram Bot Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Telegram Bot</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Configure Telegram bot for remote panel management via Telegram.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="telegram-enabled"
                checked={settings.telegram.enabled}
                onChange={(e) => updateTelegram({ enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="telegram-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Telegram Bot
              </label>
            </div>

            {settings.telegram.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bot Token
                  </label>
                  <input
                    type="password"
                    value={settings.telegram.bot_token || ''}
                    onChange={(e) => updateTelegram({ bot_token: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter bot token from @BotFather"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Get your bot token from @BotFather on Telegram
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin User IDs
                  </label>
                  <div className="space-y-2">
                    {settings.telegram.admin_ids.map((id, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={id}
                          onChange={(e) => {
                            const newIds = [...settings.telegram.admin_ids]
                            newIds[index] = e.target.value
                            updateTelegram({ admin_ids: newIds })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => removeAdminId(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addAdminId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Admin ID
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    User IDs of Telegram users who can use the bot. Get your ID from @userinfobot
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Automatic Backup</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="backup-enabled"
                      checked={settings.telegram.backup_enabled || false}
                      onChange={(e) => updateTelegram({ backup_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="backup-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Automatic Backup
                    </label>
                  </div>

                  {settings.telegram.backup_enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Backup Interval
                          </label>
                          <input
                            type="number"
                            value={settings.telegram.backup_interval || 60}
                            onChange={(e) => updateTelegram({ backup_interval: parseInt(e.target.value) || 60 })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="60"
                            min="1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Interval Unit
                          </label>
                          <select
                            value={settings.telegram.backup_interval_unit || 'minutes'}
                            onChange={(e) => updateTelegram({ backup_interval_unit: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Panel will automatically send backup files to all admin users at the specified interval.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
