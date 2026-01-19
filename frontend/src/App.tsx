import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppRouter } from './app/router'

function App() {
  // Force light mode on app load
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
