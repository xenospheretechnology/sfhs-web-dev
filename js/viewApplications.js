// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCvQX0WytJufg3eB3mNvPqhiWdzIOgfbr8",
    authDomain: "sfhs-jobs.firebaseapp.com",
    projectId: "sfhs-jobs",
    storageBucket: "sfhs-jobs.appspot.com",
    messagingSenderId: "821032658591",
    appId: "1:821032658591:web:20fda9afe6e99245b124aa",
    measurementId: "G-RJX04MSCKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // Ensure Firebase Auth is linked to the initialized app

// Wait for authentication state to load before fetching data
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.uid);
        fetchRecentApplications(user.uid);
    } else {
        console.log("No user signed in.");
    }
});

// Fetch recent jobs posted by the logged-in employer

// Fetch recent applications related to the employer’s job postings
async function fetchRecentApplications(userId) {
    console.log("Fetching all applications for employer:", userId);
    const applicationRef = collection(db, "applications");
    const q = query(
        applicationRef,
        where("employerId", "==", userId), // Ensure applications are linked to jobs by the logged-in employer
        orderBy("timeCreated", "desc"),     // Order by most recent application
    );

    try {
        const querySnapshot = await getDocs(q);
        const recentApplication = document.getElementById("recentApplication");
        recentApplication.innerHTML = "";
        
        if (querySnapshot.empty) {
            recentApplication.innerHTML = "<p>No applications available.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const application = doc.data();
                const applicationCard = document.createElement("div");
                applicationCard.classList.add("application-card");
                applicationCard.innerHTML = `
                    <p>Applicant: ${application.firstName} ${application.lastName}</p>
                    <p>Email: ${application.email}</p>
                    <p>Job Applied For: ${application.jobTitle}</p>
                    <p>Application Date: ${application.timeCreated.toDate().toLocaleDateString()}</p>
                    <button onclick="viewApplicationDetails('${doc.id}')">View Application</button>
                `;
                recentApplication.appendChild(applicationCard);
            });
        }
    } catch (error) {
        console.error("Error fetching applications:", error);
    }
}

// View job details
function viewJobDetails(jobId) {
    window.location.href = `jobDetails.html?jobId=${jobId}`;
}

// View application details
function viewApplicationDetails(applicationId) {
    window.location.href = `applicationDetails.html?applicationId=${applicationId}`;
}
