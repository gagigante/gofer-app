import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'
import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const user = await login(name, password)

    if (user) {
      navigate('/home')
    }
  }

  async function handlePrint() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (window as unknown as any).ordersApi.print()
  }

  return (
    <div className="flex justify-center items-center w-svw h-svh overflow-y-hidden">
      <button type="button" onClick={handlePrint}>
        print test
      </button>
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
