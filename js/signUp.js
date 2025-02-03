import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";

// Firebase config
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

// Handle Sign Up
document.querySelector('#signUpForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fName = document.getElementById('fName').value;
    const lName = document.getElementById('lName').value;
    const pNumber = document.getElementById('pNumber').value;
    const role = document.getElementById('role').value;  // Get the selected role

    // Validate phone number (ensuring it's 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(pNumber)) {
        alert("Please enter a valid phone number with exactly 10 digits.");
        return;  // Prevent form submission if the phone number is invalid
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;

            // Store user info in Firestore
            setDoc(doc(db, "users", user.uid), {
                firstName: fName,
                lastName: lName,
                phoneNumber: pNumber,
                email: email,
                role: role,  // Save the user's role
            })
            .then(() => {
                console.log("User information saved successfully!");

                // Save the role to sessionStorage
                sessionStorage.setItem('userRole', role);

                // Show thank you message
                alert("Thank you, your account has been created. Sign in on the homepage!");

                // Redirect to the homepage after the message
                window.location.href = 'index.html';  // Adjust the homepage URL if needed
            })
            .catch((error) => {
                console.error("Error saving user info:", error);
                alert("Error saving user information.");
            });
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Error signing up:", errorMessage);
            alert(errorMessage);  // Show error message
        });
});
