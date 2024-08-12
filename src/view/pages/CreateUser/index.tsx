import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/view/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'
import { Input } from '@/view/components/ui/input'
import { Button } from '@/view/components/ui/button'

import { type apiName, type UsersApi } from '@/api/exposes/users-api'

const formSchema = z.object({
  name: z.string().refine((s) => !s.includes(' '), 'No Spaces!'),
  password: z.string(),
  role: z.enum(['admin', 'operator']),
})

export function CreateUser() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: '',
      password: '',
      role: 'operator',
    },
    resolver: zodResolver(formSchema),
  })

  async function onSubmit({ name, password, role }: z.infer<typeof formSchema>) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.create({
      loggedUserId: user.id,
      name,
      password,
      role,
    })

    if (!err) {
      toast({
        title: 'Usuário criado com sucesso',
        duration: 3000,
      })

      navigate('..', { relative: 'path' })
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

  return (
    <div className="h-full flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Adicionar novo usuário</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid w-full items-center gap-2">
              <Input
                id="name"
                className={errors.name && 'border-red-500'}
                placeholder="Usuário"
                required
                {...register('name')}
              />

              <Input id="password" placeholder="Senha" type="password" required {...register('password')} />

              <Controller
                name="role"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-1.5">
            <Button asChild variant="outline">
              <Link to=".." relative="path">
                Cancelar
              </Link>
            </Button>
            <Button type="submit">Adicionar usuário</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
