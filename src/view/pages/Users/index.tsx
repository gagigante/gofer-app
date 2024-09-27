import React, { useEffect, useState } from 'react'
import type * as z from 'zod'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { type User } from '@prisma/client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Input } from '@/view/components/ui/input'
import { Badge } from '@/view/components/ui/badge'
import { Button } from '@/view/components/ui/button'
import { Footer } from './components/Footer'
import { DeleteUserAction } from './components/DeleteUserAction'
import { UpdateUserAction } from './components/UpdateUserAction'
import { CreateUserAction } from './components/CreateUserAction'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'

import { ROLES } from '@/view/constants/ROLES'
import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

import { type UserRole } from '@/api/types/user-role'
import { type apiName, type UsersApi } from '@/api/exposes/users-api'
import { type createUserSchema } from './components/CreateUserAction/schema'
import { type updateUserSchema } from './components/UpdateUserAction/schema'

export function Users() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [nameFilter, setNameFilter] = useState('')
  const [pagination, setPagination] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User>()
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
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

  async function handleCreateUser(formData: z.infer<typeof createUserSchema>) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.create({
      loggedUserId: user.id,
      name: formData.name,
      password: formData.password,
      role: formData.role,
    })

    if (!err) {
      toast({
        title: 'Usuário criado com sucesso',
        duration: 3000,
      })

      await loadUsers()
      setIsCreateUserDialogOpen(false)
    }

    if (err) {
      if (err.message === 'UserAlreadyExistsError') {
        toast({
          title: 'Já existe um usuário com esse nome.',
          duration: 3000,
        })
      } else {
        toast({
          title: 'Ocorreu um erro ao tentar criar o usuário. Tente novamente.',
          duration: 3000,
        })
      }
    }
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
    }

    setIsDeleteUserAlertOpen(false)
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
                    <Badge variant="default">{ROLES[role as UserRole]}</Badge>
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

      <Footer
        role={user?.role}
        page={pagination}
        total={total}
        onChange={setPagination}
        onRequestCreateUser={() => {
          setIsCreateUserDialogOpen(true)
        }}
      />

      <CreateUserAction
        isOpen={isCreateUserDialogOpen}
        onCreateUser={handleCreateUser}
        onClose={() => {
          setIsCreateUserDialogOpen(false)
        }}
      />

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
