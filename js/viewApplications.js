// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, where, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
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

// Fetch recent applications related to the employer’s job postings
async function fetchRecentApplications(userId) {
    console.log("Fetching all applications for employer:", userId);
    const applicationRef = collection(db, "applications");
    const q = query(
        applicationRef,
        where("employerId", "==", userId),
        where("status", "==", "pending"), // Ensure applications are linked to jobs by the logged-in employer
        orderBy("timeCreated", "desc") // Order by most recent application
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
                const applicationId = doc.id;
                const applicationCard = document.createElement("div");
                applicationCard.classList.add("application-card");
                applicationCard.innerHTML = `
                    <p><strong>Applicant:</strong> ${application.firstName} ${application.lastName}</p>
                    <p><strong>Email:</strong> ${application.email}</p>
                    <p><strong>Job Applied For:</strong> ${application.jobTitle}</p>
                    <p><strong>Application Date:</strong> ${application.timeCreated.toDate().toLocaleDateString()}</p>
                    <button id="view-${applicationId}">View Application</button>
                `;
                recentApplication.appendChild(applicationCard);

                // Add event listener for the button dynamically
                document.getElementById(`view-${applicationId}`).addEventListener("click", () => {
                    viewApplicationDetails(applicationId);
                });
            });
        }
    } catch (error) {
        console.error("Error fetching applications:", error);
    }
}

// Function to open the modal and load application details
async function viewApplicationDetails(applicationId) {
    const modal = document.getElementById("applicationModal");
    const applicationDetailsDiv = document.getElementById("applicationDetails");

    try {
        const applicationRef = doc(db, "applications", applicationId);
        const applicationSnap = await getDoc(applicationRef);

        if (applicationSnap.exists()) {
            const application = applicationSnap.data();

            applicationDetailsDiv.innerHTML = `
                <p><strong>Applicant Name:</strong> ${application.firstName} ${application.lastName}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <p><strong>Address:</strong> ${application.streetAddress}, ${application.city}, ${application.state}, ${application.zip}</p>
                <p><strong>Date of Birth:</strong> ${application.dateOfBirth}</p>
                <p><strong>Job Applied For:</strong> ${application.jobTitle}</p>
                <p><strong>Application Date:</strong> ${application.timeCreated.toDate().toLocaleString()}</p>
                <p><strong>Message:</strong> ${application.message}</p>
                <button id="acceptApplication">Accept</button>
                <button id="rejectApplication">Reject</button>
            `;

            // Add event listeners for accept/reject buttons
            document.getElementById("acceptApplication").addEventListener("click", () => updateApplicationStatus(applicationId, "Accepted"));
            document.getElementById("rejectApplication").addEventListener("click", () => updateApplicationStatus(applicationId, "Rejected"));

            modal.style.display = "block"; // Show modal
        } else {
            alert("Application not found.");
        }
    } catch (error) {
        console.error("Error fetching application details:", error);
    }
}

// Function to update application status
async function updateApplicationStatus(applicationId, status) {
    try {
        const applicationRef = doc(db, "applications", applicationId);
        await updateDoc(applicationRef, { status: status });

        alert(`Application has been ${status.toLowerCase()}.`);
        closeModal();
    } catch (error) {
        console.error("Error updating application status:", error);
    }
}

// Function to close the modal
function closeModal() {
    document.getElementById("applicationModal").style.display = "none";
}

// Close modal if user clicks outside it
window.onclick = function(event) {
    const modal = document.getElementById("applicationModal");
    if (event.target === modal) {
        closeModal();
    }
};
