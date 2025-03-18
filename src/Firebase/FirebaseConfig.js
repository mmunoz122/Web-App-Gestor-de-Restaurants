import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAY1b-uf2Oc6dDdq3n1Ad2wQJ4SO8gAIZ4",
  authDomain: "restaurantx-4b6b0.firebaseapp.com",
  projectId: "restaurantx-4b6b0",
  storageBucket: "restaurantx-4b6b0.firebasestorage.app",
  messagingSenderId: "717629396631",
  appId: "1:717629396631:web:28c73ccd0cddc2fb5cbbd2",
  measurementId: "G-JGE52FDMN1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, collection, getDocs, addDoc, doc, deleteDoc, updateDoc };