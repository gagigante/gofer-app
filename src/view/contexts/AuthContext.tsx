import React, { type ReactNode, createContext, useMemo, useState } from 'react'

import { useToast } from '@/view/components/ui/use-toast'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextProps {
  login: (name: string, password: string) => Promise<User | undefined>
  logout: () => Promise<void>
  user: { id: string; name: string } | undefined
}

interface LoginParam {
  name: string
  password: string
}

interface User {
  id: string
  name: string
}

interface LoginReturn {
  data: User | null
  err: Error | null
}

interface Window {
  loginApi: {
    login: (data: LoginParam) => Promise<LoginReturn>
  }
}

export const AuthContext = createContext<AuthContextProps>({} satisfies AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps): ReactNode => {
  const { toast } = useToast()

  const [user, setUser] = useState<{ id: string; name: string }>()

  async function login(name: string, password: string) {
    // TODO: ipc main type safety
    const { data, err } = await (window as unknown as Window).loginApi.login({
      name,
      password,
    })

    if (err?.message === 'IncorrectCredentialsError') {
      const { dismiss } = toast({
        title: 'Usuário ou senha incorretos.',
      })

      setTimeout(() => {
        dismiss()
      }, 3000)

      return
    }

    setUser({ id: data!.name, name: data!.name })

    return data!
  }

  async function logout() {
    setUser(undefined)
  }

  const value: AuthContextProps = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
