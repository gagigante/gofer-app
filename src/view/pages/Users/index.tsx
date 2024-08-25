import React, { useEffect, useState } from 'react'
import type * as z from 'zod'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Input } from '@/view/components/ui/input'
import { Badge } from '@/view/components/ui/badge'
import { Button } from '@/view/components/ui/button'
import { Footer } from './Footer'
import { DeleteUserAction } from './DeleteUserAction'
import { UpdateUserAction } from './UpdateUserAction'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'

import { ROLES } from '@/view/constants/ROLES'
import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

import { type User } from '@/api/models/User'
import { type apiName, type UsersApi } from '@/api/exposes/users-api'
import { type updateUserSchema } from './UpdateUserAction/schema'

export function Users() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [nameFilter, setNameFilter] = useState('')
  const [pagination, setPagination] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User>()
  const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false)
  const [isDeleteUserAlertOpen, setIsDeleteUserAlertOpen] = useState(false)

  async function loadUsers(name = '', page = 1) {
    if (!user) return

    const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.list({
      loggedUserId: user.id,
      name,
      page,
      itemsPerPage: ITEMS_PER_PAGE,
    })

    if (!err) {
      setUsers(data.users)
      setTotal(data.total)
    }
  }

  useEffect(() => {
    loadUsers(nameFilter, pagination)
  }, [nameFilter, pagination])

  function handleRequestUserEdition(user: User) {
    setSelectedUser(user)
    setIsUpdateUserDialogOpen(true)
  }

  function handleRequestUserDeletion(user: User) {
    setSelectedUser(user)
    setIsDeleteUserAlertOpen(true)
  }

  async function handleUpdateUser(formData: z.infer<typeof updateUserSchema>) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.update({
      loggedUserId: user.id,
      updatedName: formData.name,
      currentPassword: formData.password,
      newPassword: formData.newPassword,
      newPasswordConfirmation: formData.newPasswordConfirmation,
    })

    if (err?.message === 'IncorrectCredentialsError') {
      toast({
        title: 'Senha incorreta.',
        duration: 3000,
      })

      return
    }

    await loadUsers()
    setIsUpdateUserDialogOpen(false)
  }

  async function handleDeleteUser(userId: string) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.delete({
      loggedUserId: user.id,
      userId,
    })

    if (err) {
      toast({
        title: 'Houve um erro ao apagar o usuário. Tente novamente.',
        duration: 3000,
      })
    } else {
      toast({
        title: 'Usuário removido com sucesso.',
        duration: 3000,
      })

      loadUsers()
      setIsUpdateUserDialogOpen(false)
    }
  }

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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Nível de permissão</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map(({ id, name, role }) => {
              const isDeletable = user?.id !== id && role !== 'super-admin'
              const isEditable = user?.id === id

              return (
                <TableRow key={id}>
                  <TableCell>
                    <div className="flex">
                      <p className="font-medium">{name}</p>
                      {user?.id === id && (
                        <Badge className="ml-2" variant="outline">
                          Eu
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="default">{ROLES[role]}</Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-1.5">
                    {isEditable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const user = users.find((item) => item.id === id)

                          if (user) {
                            handleRequestUserEdition(user)
                          }
                        }}
                      >
                        <FaPencilAlt className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!isDeletable}
                      onClick={() => {
                        const user = users.find((item) => item.id === id)

                        if (user) {
                          handleRequestUserDeletion(user)
                        }
                      }}
                    >
                      <FaTrash className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Footer role={user?.role} page={pagination} total={total} onChange={setPagination} />

      <UpdateUserAction
        isOpen={isUpdateUserDialogOpen}
        selectedUserName={selectedUser?.name ?? ''}
        onUpdateUser={handleUpdateUser}
        onClose={() => {
          setIsUpdateUserDialogOpen(false)
        }}
      />

      <DeleteUserAction
        isOpen={isDeleteUserAlertOpen}
        onDelete={async () => {
          if (!selectedUser) return

          await handleDeleteUser(selectedUser.id)
        }}
        onClose={() => {
          setIsDeleteUserAlertOpen(false)
        }}
      />
    </div>
  )
}
