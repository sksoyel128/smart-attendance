// src/config/firebase.js



// 1. Firebase core functions import karo
import { initializeApp } from "firebase/app";

// 2. Firebase services import karo (auth, firestore, storage)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 3. Firebase config paste karo (console se copy kiya tha)
const firebaseConfig = {
  apiKey: "AIzaSyDac2AaGW7Q5OW1x4r7s33TnZqUTN9146I",
  authDomain: "college-26788.firebaseapp.com",
  projectId: "college-26788",
  storageBucket: "college-26788.firebasestorage.app",
  messagingSenderId: "510710268131",
  appId: "1:510710268131:web:3462bbbc425036c90e45d6",
  measurementId: "G-SYQL3JG0HQ"
};


// 4. App initialize karo
const app = initializeApp(firebaseConfig);

// 5. Firebase services export karo
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
