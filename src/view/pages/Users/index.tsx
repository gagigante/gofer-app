import { useState } from 'react'
import type * as z from 'zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Input } from '@/view/components/ui/input'
import { Badge } from '@/view/components/ui/badge'
import { Button } from '@/view/components/ui/button'
import { Footer } from '@/view/components/Footer'
import { TableLoading } from '@/view/components/TableLoading'
import { DeleteUserAction } from './components/DeleteUserAction'
import { UpdateUserAction } from './components/UpdateUserAction'
import { CreateUserAction } from './components/CreateUserAction'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useUsers } from '@/view/hooks/queries/users'
import { useMutateOnCreateUser, useMutateOnDeleteUser, useMutateOnUpdateUser } from '@/view/hooks/mutations/users'

import { type User } from '@/api/db/schema'
import { type UserRole } from '@/api/types/user-role'
import { type createUserSchema } from './components/CreateUserAction/schema'
import { type updateUserSchema } from './components/UpdateUserAction/schema'

import { ROLES } from '@/view/constants/ROLES'

export function Users() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [nameFilter, setNameFilter] = useState('')
  const [pagination, setPagination] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User>()
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false)
  const [isDeleteUserAlertOpen, setIsDeleteUserAlertOpen] = useState(false)

  const [search] = useDebounce(nameFilter, 250)

  const { mutateAsync: mutateOnCreate } = useMutateOnCreateUser()
  const { mutateAsync: mutateOnUpdate } = useMutateOnUpdateUser()
  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteUser()

  const { data, isFetching } = useUsers(
    { loggedUserId: user?.id ?? '', name: search, page: pagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const users = data?.users ?? []

  function handleRequestUserEdition(user: User) {
    setSelectedUser(user)
    setIsUpdateUserDialogOpen(true)
  }

  function handleRequestUserDeletion(user: User) {
    setSelectedUser(user)
    setIsDeleteUserAlertOpen(true)
  }

  async function handleCreateUser(data: z.infer<typeof createUserSchema>) {
    if (!user) return

    await mutateOnCreate(
      {
        loggedUserId: user.id,
        name: data.name,
        password: data.password,
        role: data.role,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Usuário criado com sucesso',
            duration: 3000,
          })
          setIsCreateUserDialogOpen(false)
        },
        onError: (err) => {
          if (err.message === 'UserAlreadyExistsError') {
            toast({
              title: 'Já existe um usuário com esse nome.',
              duration: 3000,
            })
            return
          }

          toast({
            title: 'Ocorreu um erro ao tentar criar o usuário. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
  }

  async function handleUpdateUser(data: z.infer<typeof updateUserSchema>) {
    if (!user) return

    await mutateOnUpdate(
      {
        loggedUserId: user.id,
        updatedName: data.name,
        currentPassword: data.password,
        newPassword: data.newPassword,
        newPasswordConfirmation: data.newPasswordConfirmation,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Usuário atualizado com sucesso',
            duration: 3000,
          })
          setIsUpdateUserDialogOpen(false)
        },
        onError: (err) => {
          if (err.message === 'IncorrectCredentialsError') {
            toast({
              title: 'Senha incorreta.',
              duration: 3000,
            })
            return
          }

          toast({
            title: 'Ocorreu um erro ao tentar atualizar o usuário. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
  }

  async function handleDeleteUser(userId: string) {
    if (!user) return

    await mutateOnDelete(
      {
        loggedUserId: user.id,
        userId,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Usuário removido com sucesso.',
            duration: 3000,
          })
          setIsDeleteUserAlertOpen(false)
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar o usuário. Tente novamente.',
            duration: 3000,
          })
          setIsDeleteUserAlertOpen(false)
        },
      },
    )
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

        {isFetching && <TableLoading columns={3} rows={5} />}

        {!isFetching && (
          <Table>
            {users.length === 0 && <TableCaption>Nenhum usuário encontrado.</TableCaption>}

            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Nível de permissão</TableHead>
                <TableHead className="min-w-[112px]"></TableHead>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>

                          <TooltipContent>
                            <p>Editar usuário</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              className="pointer-events-auto"
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
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </span>
                        </TooltipTrigger>

                        <TooltipContent>
                          <p>Apagar usuário</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination}>
        {user?.role !== 'operator' && (
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>Adicionar usuário</Button>
        )}
      </Footer>

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
