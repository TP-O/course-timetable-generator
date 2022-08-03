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

export function useAuth() {
  const [user, setUser] = useState(firebaseClient.currentUser)

  useEffect(() => {
    signInWithCustomToken(firebaseClient, localStorage.getItem('jwt') || '')
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
      localStorage.removeItem('jwt')
    } else {
      localStorage.setItem('jwt', jwt)
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
