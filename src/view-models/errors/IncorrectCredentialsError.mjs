export class IncorrectCredentialsError extends Error {
  constructor() {
    super('Incorrect login or password.')
  }
}