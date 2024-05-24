import React, { type ReactNode, createContext, useMemo, useState } from 'react'

import { useToast } from '@/view/components/ui/use-toast'

import { type UserRole } from '@/api/types/user-role'

interface User {
  id: string
  name: string
  role: UserRole
}

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextProps {
  login: (name: string, password: string) => Promise<User | undefined>
  logout: () => Promise<void>
  user: User | undefined
}

interface LoginParam {
  name: string
  password: string
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

  const [user, setUser] = useState<User>()

  async function login(name: string, password: string) {
    // TODO: ipc main type safety
    const { data, err } = await (window as unknown as Window).loginApi.login({
      name,
      password,
    })

    if (err?.message === 'IncorrectCredentialsError') {
      toast({
        title: 'Usuário ou senha incorretos.',
        duration: 3000,
      })

      return
    }

    setUser({ id: data!.id, name: data!.name, role: data!.role })

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
