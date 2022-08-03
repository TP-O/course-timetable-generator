import { axiosClient } from './axios'

export function getCustomToken(tokenId: string) {
  return axiosClient.post('/jwt', {
    token: tokenId,
  })
}
