import React, { useState, type FormEvent } from 'react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'
import { Button } from '@/view/components/ui/button'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'

// import { useAuth } from '@/view/hooks/useAuth'

export function Login() {
  const { user, login, logout } = useAuth()
  // const { toast } = useToast()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    await login(name, password)
  }

  function handleLogout() {
    logout()
  }

  return (
    <div className="flex justify-center items-center w-svw h-svh">
      {JSON.stringify(user)}

      <button onClick={handleLogout}>logout</button>
      <Card className="max-w-[360px] w-full gap-2">
        <CardHeader>
          <CardTitle>Gofer Madeiras</CardTitle>
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
          <CardFooter>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
