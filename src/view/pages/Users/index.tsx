import React from 'react'
import { FaTrash, FaPencilAlt } from 'react-icons/fa'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Link } from 'react-router-dom'
import { useAuth } from '@/view/hooks/useAuth'

export function Users() {
  const { user } = useAuth()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-4 overflow-auto"></div>

      <footer className="flex px-3 py-4 border-t border-border">
        {user && user.role !== 'operator' && (
          <Button asChild>
            <Link to="new">Adicionar usuário</Link>
          </Button>
        )}
      </footer>
    </div>
  )
}
