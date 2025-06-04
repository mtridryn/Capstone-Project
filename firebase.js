// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQgv28GkDqdkygmUwlZTmQCboRah531VE",
  authDomain: "dermalyze-capstone.firebaseapp.com",
  projectId: "dermalyze-capstone",
  storageBucket: "dermalyze-capstone.firebasestorage.app",
  messagingSenderId: "599179199258",
  appId: "1:599179199258:web:4e7f694ae2ce3cf8d0a2a3",
  measurementId: "G-ZBBC33WSHG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);