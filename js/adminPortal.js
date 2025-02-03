import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

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

// Fetch pending jobs (those with approved: false)
async function fetchPendingJobs() {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const pendingJobs = [];

    querySnapshot.forEach((docSnap) => {
        const job = docSnap.data();
        if (job.approved === false) {
            pendingJobs.push({ id: docSnap.id, ...job });
        }
    });

    displayPendingJobs(pendingJobs);
}

// Display pending jobs in the admin portal
function displayPendingJobs(jobs) {
    const jobListingsContainer = document.getElementById("jobList");
    jobListingsContainer.innerHTML = ""; // Clear previous listings

    jobs.forEach((job) => {
        const jobCard = document.createElement("div");
        jobCard.classList.add("job-card");

        jobCard.innerHTML = `
            <h3 class="job-title">${job.jobTitle}</h3>
            <p class="company-name">${job.companyName}</p>
            <p class="job-location">${job.location}</p>
            <p class="job-description">${job.jobDescription}</p>
            <button class="approve-btn" onclick="approveJob('${job.id}')">Approve</button>
            <button class="reject-btn" onclick="rejectJob('${job.id}')">Reject</button>
        `;

        jobListingsContainer.appendChild(jobCard);
    });
}

// Approve the job
window.approveJob = async function(jobId) {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
        approved: true
    });

    alert("Job approved!");
    fetchPendingJobs();  // Refresh the list of pending jobs
};

// Reject the job
window.rejectJob = async function(jobId) {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
        approved: "rejected"  // Store the status as 'rejected'
    });

    alert("Job rejected!");
    fetchPendingJobs();  // Refresh the list of pending jobs
};

// Fetch pending jobs on page load
fetchPendingJobs();
