import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaTrash, FaPencilAlt } from 'react-icons/fa'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Badge } from '@/view/components/ui/badge'
import { Pagination } from '@/view/components/Pagination'

import { useAuth } from '@/view/hooks/useAuth'

import { ROLES } from '@/view/constants/ROLES'
import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

import { type User } from '@/api/models/User'
import { type apiName, type UsersApi } from '@/api/exposes/users-api'

export function Users() {
  const { user } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [nameFilter, setNameFilter] = useState('')
  const [pagination, setPagination] = useState(1)

  useEffect(() => {
    async function loadUsers(name = '', page = 1) {
      if (!user) return

      const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.list({
        loggedUserName: user.name,
        name,
        page,
        itemsPerPage: ITEMS_PER_PAGE,
      })

      if (!err) {
        setUsers(data.users)
        setTotal(data.total)
      }
    }

    loadUsers(nameFilter, pagination)
  }, [nameFilter, pagination])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Gerenciar usuários</h2>

        <Input
          className="mb-4"
          placeholder="Buscar por nome de usuário"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value)
            setPagination(1)
          }}
        />
      </div>

      <footer className="flex px-3 py-4 border-t border-border">
        <Pagination currentPage={pagination} total={total} onChangePage={setPagination} />

        {user && user.role !== 'operator' && (
          <Button asChild>
            <Link to="new">Adicionar usuário</Link>
          </Button>
        )}
      </footer>
    </div>
  )
}
