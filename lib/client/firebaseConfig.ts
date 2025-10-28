// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANvdw49ObZtmPiAwTh_tHKx8mFTfJyLRs",
  authDomain: "misconduct-complain-project.firebaseapp.com",
  projectId: "misconduct-complain-project",
  storageBucket: "misconduct-complain-project.firebasestorage.app",
  messagingSenderId: "677066504348",
  appId: "1:677066504348:web:a3cf3ce5b573b71b355559",
  measurementId: "G-FF68LKGCVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);