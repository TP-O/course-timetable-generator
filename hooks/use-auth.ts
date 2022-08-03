import { firebaseClient } from '@/services/firebase/client'
import { getCustomToken } from '@/services'
import {
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
  User,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Storage } from '@/types'

export function useAuth() {
  const [user, setUser] = useState(firebaseClient.currentUser)

  useEffect(() => {
    signInWithCustomToken(firebaseClient, String(localStorage.getItem(Storage.LocalStorageJwtKey)))
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
  }, [])

  async function signUp(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(firebaseClient, email, password)
    await syncUser(res.user)
  }

  async function signIn(email: string, password: string) {
    const res = await signInWithEmailAndPassword(firebaseClient, email, password)
    await syncUser(res.user)
  }

  async function syncUser(user: User | null | undefined) {
    if (user) {
      setUser(user)
    }

    // Store custom token
    const { data: jwt } = await getCustomToken(String(await user?.getIdToken()))

    if (jwt === undefined) {
      localStorage.removeItem(Storage.LocalStorageJwtKey)
    } else {
      localStorage.setItem(Storage.LocalStorageJwtKey, jwt)
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
