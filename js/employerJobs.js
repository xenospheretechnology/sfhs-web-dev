import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    // Wait for the authentication state to be checked before loading jobs
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadEmployerJobs(user);
        } else {
            window.location.href = 'signIn.html';  // Redirect to sign in if not logged in
        }
    });
});

async function loadEmployerJobs(user) {
    const jobsQuery = query(collection(db, "jobs"), where("postedBy", "==", user.uid));
    const querySnapshot = await getDocs(jobsQuery);

    const jobList = document.getElementById("jobList");
    jobList.innerHTML = ''; // Clear job list before adding new items

    querySnapshot.forEach((doc) => {
        const jobData = doc.data();
        const jobCard = createJobCard(doc.id, jobData);  // Pass only the jobData, not jobStatus
        jobList.appendChild(jobCard);
    });
}

function createJobCard(jobId, jobData) {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    // Determine job status based on `approved` and `status` fields
    let displayStatus = "Pending";  // Default status

    if (jobData.approved) {
        displayStatus = "Approved";  // If approved, show "Approved"
    } else if (jobData.status === "rejected") {
        displayStatus = "Rejected";  // If the status is 'Rejected', show "Rejected"
    }

    jobCard.innerHTML = `
        <h3>${jobData.jobTitle}</h3>
        <p>Company: ${jobData.companyName}</p>
        <p>Status: ${displayStatus}</p>
        <button onclick="viewApplicants('${jobId}')">View Applicants</button>
    `;

    return jobCard;
}

async function viewApplicants(jobId) {
    const applicantsRef = collection(db, "applications");
    const applicantQuery = query(applicantsRef, where("jobId", "==", jobId));
    const querySnapshot = await getDocs(applicantQuery);

    let applicantsHTML = '';
    querySnapshot.forEach((doc) => {
        const applicantData = doc.data();
        applicantsHTML += `
            <div class="applicant-card">
                <p>Student: ${applicantData.studentName}</p>
                <button onclick="manageApplication('${doc.id}', 'accept')">Accept</button>
                <button onclick="manageApplication('${doc.id}', 'continue')">Continue</button>
                <button onclick="manageApplication('${doc.id}', 'reject')">Reject</button>
            </div>
        `;
    });

    // Create a modal or show the applicants in a section
    const modal = document.createElement("div");
    modal.classList.add("applicant-modal");
    modal.innerHTML = `
        <h3>Applicants for this job</h3>
        ${applicantsHTML}
        <button onclick="closeApplicantsModal()">Close</button>
    `;
    document.body.appendChild(modal);
}

async function manageApplication(applicationId, action) {
    const applicationRef = doc(db, "applications", applicationId);
    await updateDoc(applicationRef, { status: action });

    // Refresh the job listings
    loadEmployerJobs(auth.currentUser);
}

function closeApplicantsModal() {
    const modal = document.querySelector(".applicant-modal");
    if (modal) modal.remove();
}
