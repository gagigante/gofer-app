import electron from 'electron'

const { env } = process

export function isElectronInDev() {
  const isEnvSet = 'ELECTRON_IS_DEV' in env
  const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV ?? '', 10) === 1

  const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged

  return isDev
}
