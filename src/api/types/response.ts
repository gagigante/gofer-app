export type Response<T> = { data: T; err: null } | { data: null; err: Error }
