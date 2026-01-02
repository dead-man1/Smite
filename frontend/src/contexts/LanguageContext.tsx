import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'fa'

interface Translations {
  login: {
    title: string
    subtitle: string
    username: string
    password: string
    usernamePlaceholder: string
    passwordPlaceholder: string
    signIn: string
    signingIn: string
    loginFailed: string
    checkCredentials: string
  }
  dashboard: {
    title: string
    subtitle: string
    totalNodes: string
    totalTunnels: string
    cpuUsage: string
    memoryUsage: string
    currentUsage: string
    active: string
    systemResources: string
    quickActions: string
    createNewTunnel: string
    addNode: string
    addServer: string
    loadingDashboard: string
  }
  common: {
    loading: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    login: {
      title: 'Smite',
      subtitle: 'Tunnel Management Platform',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      loginFailed: 'Login failed. Please check your credentials.',
      checkCredentials: 'Login failed. Please check your credentials.',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your system status and resources',
      totalNodes: 'Total Nodes',
      totalTunnels: 'Total Tunnels',
      cpuUsage: 'CPU Usage',
      memoryUsage: 'Memory Usage',
      currentUsage: 'Current usage',
      active: 'active',
      systemResources: 'System Resources',
      quickActions: 'Quick Actions',
      createNewTunnel: 'Create New Tunnel',
      addNode: 'Add Node',
      addServer: 'Add Server',
      loadingDashboard: 'Loading dashboard...',
    },
    common: {
      loading: 'Loading...',
    },
  },
  fa: {
    login: {
      title: 'اسمیت',
      subtitle: 'پلتفرم مدیریت تونل',
      username: 'نام کاربری',
      password: 'رمز عبور',
      usernamePlaceholder: 'نام کاربری خود را وارد کنید',
      passwordPlaceholder: 'رمز عبور خود را وارد کنید',
      signIn: 'ورود',
      signingIn: 'در حال ورود...',
      loginFailed: 'ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید.',
      checkCredentials: 'ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید.',
    },
    dashboard: {
      title: 'داشبورد',
      subtitle: 'نمای کلی وضعیت سیستم و منابع',
      totalNodes: 'کل نودها',
      totalTunnels: 'کل تونل‌ها',
      cpuUsage: 'استفاده از CPU',
      memoryUsage: 'استفاده از حافظه',
      currentUsage: 'استفاده فعلی',
      active: 'فعال',
      systemResources: 'منابع سیستم',
      quickActions: 'اقدامات سریع',
      createNewTunnel: 'ایجاد تونل جدید',
      addNode: 'افزودن نود',
      addServer: 'افزودن سرور',
      loadingDashboard: 'در حال بارگذاری داشبورد...',
    },
    common: {
      loading: 'در حال بارگذاری...',
    },
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
    if (lang === 'fa') {
      document.body.style.fontFamily = "'Vazirmatn', sans-serif"
    } else {
      document.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
    if (language === 'fa') {
      document.body.style.fontFamily = "'Vazirmatn', sans-serif"
    } else {
      document.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    dir: language === 'fa' ? 'rtl' : 'ltr',
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

