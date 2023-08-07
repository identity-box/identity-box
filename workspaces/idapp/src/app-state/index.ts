import { atom } from 'recoil'

type GlobalAppConfig = {
  backupEnabled: boolean
}

const applicationConfig = atom<GlobalAppConfig>({
  key: 'backupEnabled',
  default: {
    backupEnabled: false
  }
})

export { applicationConfig }
