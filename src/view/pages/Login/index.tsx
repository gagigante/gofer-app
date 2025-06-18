import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'
import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'

import { version } from '@/../package.json'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsLoading(true)

    const user = await login(name, password)

    if (user) {
      navigate(user.role !== 'operator' ? '/home' : '/orders')
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center w-svw h-svh overflow-y-hidden">
      <Card className="max-w-[360px] w-full gap-2">
        <CardHeader>
          <CardTitle>Gofer</CardTitle>
        </CardHeader>

        <form
          onSubmit={async (e) => {
            await handleLogin(e)
          }}
        >
          <CardContent className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Usuário"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-1">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              Entrar
            </Button>

            <span className="text-xs text-muted-foreground">v.{version}</span>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
