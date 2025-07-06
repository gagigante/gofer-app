import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import { type UsersApi, type apiName } from '@/api/exposes/users-api'
import {
  type CreateUserRequest,
  type CreateUserResponse,
  type UpdateUserRequest,
  type UpdateUserResponse,
  type DeleteUserRequest,
  type DeleteUserResponse,
} from '@/api/controllers/users-controller'

export function useMutateOnCreateUser() {
  return useMutation<CreateUserResponse['data'], Error, CreateUserRequest>({
    mutationFn: async ({ loggedUserId, name, password, role }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.create({
        loggedUserId,
        name,
        password,
        role,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })

      return response
    },
  })
}

export function useMutateOnUpdateUser() {
  return useMutation<UpdateUserResponse['data'], Error, UpdateUserRequest>({
    mutationFn: async ({ loggedUserId, updatedName, currentPassword, newPassword, newPasswordConfirmation }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.update({
        loggedUserId,
        updatedName,
        currentPassword,
        newPassword,
        newPasswordConfirmation,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['users'] })])

      return response
    },
  })
}

export function useMutateOnDeleteUser() {
  return useMutation<DeleteUserResponse['data'], Error, DeleteUserRequest>({
    mutationFn: async ({ loggedUserId, userId }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.delete({
        loggedUserId,
        userId,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })

      return response
    },
  })
}
