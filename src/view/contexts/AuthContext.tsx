import { type ReactNode, createContext, useMemo, useState } from 'react'
import { toast } from 'sonner'

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

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps): ReactNode => {
  const [user, setUser] = useState<User>()

  async function login(name: string, password: string) {
    // TODO: ipc main type safety
    const { data, err } = await (window as unknown as Window).loginApi.login({
      name,
      password,
    })

    if (err?.message === 'IncorrectCredentialsError') {
      toast('Usuário ou senha incorretos.')

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
