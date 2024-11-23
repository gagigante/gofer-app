import { version } from '@/../package.json'

export function Home() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <h1>v.{version}</h1>
    </div>
  )
}
