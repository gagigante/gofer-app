import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi'

import { ScrollArea } from '@/view/components/ui/scroll-area'
import { Button } from '@/view/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'
import { Dialog } from './Dialog'

import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { type Theme } from '../contexts/ThemeContext'

export function Sidebar() {
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()

  return (
    <aside className="flex flex-col min-w-[240px] max-w-[240px] w-[20%] h-svh border-r border-border">
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="space-y-[6px]">
            <Button asChild variant={pathname === '/home' ? 'default' : 'ghost'} className="w-full justify-start">
              <Link to="/home">
                <FiHome className="w-4 h-4 mr-3" />
                Home
              </Link>
            </Button>

            <Button asChild variant={pathname === '/home/users' ? 'default' : 'ghost'} className="w-full justify-start">
              <Link to="/home/users">
                <FiUser className="w-4 h-4 mr-3" />
                Gerenciar usuários
              </Link>
            </Button>

            <Dialog
              title="Sair"
              description="Deseja mesmo sair?"
              cancelButton={<Button variant="outline">Cancelar</Button>}
              proceedButton={
                <Button variant="destructive" onClick={logout}>
                  Sair
                </Button>
              }
            >
              <Button variant="outline" className="w-full justify-start">
                <FiLogOut className="w-4 h-4 mr-3" />
                Sair
              </Button>
            </Dialog>
          </div>
        </div>
      </ScrollArea>

      <div className="px-3 py-4 border-t border-border">
        <Select
          value={theme}
          onValueChange={(value) => {
            setTheme(value as Theme)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  )
}
