import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUsers, FiLogOut, FiClipboard, FiDollarSign, FiShoppingCart, FiBox, FiArchive } from 'react-icons/fi'

import { Separator } from '@/view/components/ui/separator'
import { ScrollArea } from '@/view/components/ui/scroll-area'
import { Button } from '@/view/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'
import { Alert } from './Alert'

import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { type Theme } from '../contexts/ThemeContext'

export function Sidebar() {
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false)

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

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/home/reports">
                <FiClipboard className="w-4 h-4 mr-3" />
                Relatórios
              </Link>
            </Button>

            <Separator className="my-4" />

            <Button
              asChild
              variant={pathname.includes('/home/orders') ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Link to="/home/orders">
                <FiDollarSign className="w-4 h-4 mr-3" />
                Pedidos
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/home/budgets">
                <FiShoppingCart className="w-4 h-4 mr-3" />
                Orçamentos
              </Link>
            </Button>

            <Separator className="my-4" />

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/home/customers">
                <FiUsers className="w-4 h-4 mr-3" />
                Clientes
              </Link>
            </Button>

            <Button
              asChild
              variant={pathname.includes('/home/products') ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Link to="/home/products">
                <FiBox className="w-4 h-4 mr-3" />
                Produtos
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/home/stock">
                <FiArchive className="w-4 h-4 mr-3" />
                Estoque
              </Link>
            </Button>

            <Separator className="my-4" />

            {user && user.role !== 'operator' && (
              <Button
                asChild
                variant={pathname.includes('/home/users') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Link to="/home/users">
                  <FiUsers className="w-4 h-4 mr-3" />
                  Gerenciar usuários
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsLogoutAlertOpen(true)
              }}
            >
              <FiLogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
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

      <Alert
        title="Sair"
        description="Deseja mesmo sair?"
        cancelButton={<Button variant="outline">Cancelar</Button>}
        proceedButton={
          <Button variant="destructive" onClick={logout}>
            Sair
          </Button>
        }
        isOpen={isLogoutAlertOpen}
        onClose={() => {
          setIsLogoutAlertOpen(false)
        }}
      />
    </aside>
  )
}
