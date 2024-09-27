export class ProductWithThisBarCodeALreadyExistsError extends Error {
  constructor() {
    super('ProductWithThisBarCodeALreadyExistsError')
  }
}
