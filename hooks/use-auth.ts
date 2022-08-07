import { firebaseClient } from '@/services/firebase/client'
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
  User,
} from 'firebase/auth'
import useSWR from 'swr'
import { LocalStorageKey, SwrKey, Time } from '@/enums'
import { SignInPayload } from '@/types'

export function useAuth() {
  const { data: user, mutate } = useSWR(
    SwrKey.JWT,
    async () => {
      await firebaseClient.setPersistence(browserLocalPersistence)

      return firebaseClient.currentUser
    },
    {
      dedupingInterval: Time.Hour,
    }
  )

  async function signUp(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(firebaseClient, email, password)
    await syncUser(res.user)
  }

  async function signIn(payload: SignInPayload) {
    const res = await signInWithEmailAndPassword(firebaseClient, payload.email, payload.password)
    await syncUser(res.user)
  }

  async function syncUser(user: User | null | undefined) {
    mutate(user, false)

    if (user) {
      // Store custom token
      const jwt = await user.getIdToken()
      localStorage.setItem(LocalStorageKey.JWT, jwt)
    } else {
      // Remove token if user is null
      localStorage.removeItem(LocalStorageKey.JWT)
    }
  }

  async function signOut() {
    await signOutFirebase(firebaseClient)
    await syncUser(null)
  }

  return {
    user,
    signUp,
    signIn,
    signOut,
  }
}
