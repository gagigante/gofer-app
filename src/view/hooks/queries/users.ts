import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type ListUsersRequest, type ListUsersResponse } from '@/api/controllers/users-controller'
import { type apiName, type UsersApi } from '@/api/exposes/users-api'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useUsers(
  { loggedUserId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListUsersRequest,
  options?: Omit<UseQueryOptions<ListUsersResponse['data']>, 'queryKey'>,
) {
  const key = ['users', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, UsersApi>).usersApi.list({
        loggedUserId,
        name,
        page,
        itemsPerPage,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
