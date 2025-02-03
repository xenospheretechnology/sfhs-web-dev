import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for the authentication state to load
onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("You must be logged in to apply for a job.");
        window.location.href = "signIn.html"; // Redirect to login page if not signed in
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const jobSelect = document.getElementById("job");
    const form = document.getElementById("applyForm");

    // Fetch approved jobs to populate dropdown
    async function loadJobs() {
        try {
            const querySnapshot = await getDocs(collection(db, "jobs"));
            querySnapshot.forEach((doc) => {
                const jobData = doc.data();
                if (jobData.approved === true) { // Only show approved jobs
                    let option = document.createElement("option");
                    option.value = doc.id; // Use doc.id as jobId
                    option.textContent = `${jobData.jobTitle} at ${jobData.companyName}`; 
                    jobSelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error("Error loading jobs:", error);
        }
    }

    await loadJobs(); // Populate jobs dropdown

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to apply for a job.");
            return;
        }

        const jobId = jobSelect.value;
        if (!jobId) {
            alert("Please select a job listing.");
            return;
        }

        // Fetch job details to get employerId and jobTitle (we'll also fetch the jobTitle here)
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
            alert("Selected job does not exist.");
            return;
        }

        const employerId = jobSnap.data().postedBy; // Get employerId from job listing
        const jobTitle = jobSnap.data().jobTitle;  // Get jobTitle from job details

        // Collect form values and create application data
        const applicationData = {
            jobId: jobId,
            jobTitle: jobTitle,
            companyName: jobSnap.data().companyName,
            employerId: employerId,
            studentId: user.uid,
            firstName: document.getElementById("fName").value,
            middleInitial: document.getElementById("mInitial").value || "",
            lastName: document.getElementById("lName").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("pNumber").value,
            streetAddress: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            zip: document.getElementById("zip").value,
            dateOfBirth: document.getElementById("dob").value,
            message: document.getElementById("extraInfo").value || "",
            timeCreated: serverTimestamp(),
            status: "pending", // Default application status
        };

        console.log("Submitting application data:", applicationData); // Log application data

        try {
            // Add the application data to the Firestore "applications" collection
            await addDoc(collection(db, "applications"), applicationData);

            alert("Application submitted successfully!");
            location.reload(); // Reload the page after submission
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application. Please try again.");
            location.reload(); // Reload the page on error
        }
    });
});
