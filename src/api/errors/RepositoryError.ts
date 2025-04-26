import { type LibsqlError } from '@libsql/client'

export class RepositoryError extends Error {
  private code: string
  private errorBodyMessage: string

  constructor(error: LibsqlError) {
    super('RepositoryError', { cause: error.cause })

    this.code = error.code
    this.errorBodyMessage = error.message
  }
}
