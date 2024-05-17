import React from 'react'

import { useAuth } from '@/view/hooks/useAuth'

export function Home() {
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
  }

  return (
    <div>
      <h1>home</h1>
      <p>{JSON.stringify(user)}</p>

      <button onClick={handleLogout}>logout</button>
    </div>
  )
}
