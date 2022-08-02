import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCIpxQB4xPXBFo4Lq8_Xm27UJycg-U-ncs',
  authDomain: 'course-timetable-generator.firebaseapp.com',
  projectId: 'course-timetable-generator',
  storageBucket: 'course-timetable-generator.appspot.com',
  messagingSenderId: '434819356858',
  appId: '1:434819356858:web:0454b28ec8a7ab38b38a83',
  measurementId: 'G-YQZG2F4EK8',
}

const app = initializeApp(firebaseConfig)
export const firebaseClient = getAuth(app)
