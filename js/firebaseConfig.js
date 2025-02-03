// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvQX0WytJufg3eB3mNvPqhiWdzIOgfbr8",
  authDomain: "sfhs-jobs.firebaseapp.com",
  projectId: "sfhs-jobs",
  storageBucket: "sfhs-jobs.firebasestorage.app",
  messagingSenderId: "821032658591",
  appId: "1:821032658591:web:20fda9afe6e99245b124aa",
  measurementId: "G-RJX04MSCKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);