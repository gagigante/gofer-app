import React from 'react'

import { version } from '@/../package.json'

export function Home() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <h1>Home - v{version}</h1>
    </div>
  )
}
