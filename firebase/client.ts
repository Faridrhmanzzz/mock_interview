// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDgOmtoC0ZF8U7JpzDI2y4yk2IWoFhiQdw",
    authDomain: "mock-interview-f17a8.firebaseapp.com",
    projectId: "mock-interview-f17a8",
    storageBucket: "mock-interview-f17a8.firebasestorage.app",
    messagingSenderId: "1010925584793",
    appId: "1:1010925584793:web:1508b64b19cba7a7251308",
    measurementId: "G-N9H2QV1DBT"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);