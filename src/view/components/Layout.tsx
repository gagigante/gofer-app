import React from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/view/components/Sidebar'

export function Layout() {
  return (
    <main className="flex w-svw h-svh overflow-y-hidden">
      <Sidebar />

      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  )
}
