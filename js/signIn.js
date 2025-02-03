import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";

// Firebase config (same as before)
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
const auth = getAuth(app);
const db = getFirestore(app);

// Handle Sign In
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;

      // Get user role from Firestore
      getDoc(doc(db, "users", user.uid))
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;

            // Store the role in sessionStorage (or handle it based on your needs)
            sessionStorage.setItem('userRole', userRole);

            console.log("User signed in, role:", userRole);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
          alert("Error fetching user role.");
        });
    })
    .catch((error) => {
      const errorMessage = error.message;
      console.error("Error signing in:", errorMessage);
      alert(errorMessage);  // Show error message
    });
});
