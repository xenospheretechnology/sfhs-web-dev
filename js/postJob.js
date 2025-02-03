import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
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

// Handle Job Posting
document.getElementById('postJobForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get values from the form fields
    const jobTitle = document.getElementById('jobTitle').value;
    const companyName = document.getElementById('companyName').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const location = document.getElementById('location').value;
    const salary = document.getElementById('salary').value;
    const jobType = document.getElementById('jobType').value;
    const address = document.getElementById('address').value;

    try {
        // Add the job to Firestore with pending approval
        const docRef = await addDoc(collection(db, "jobs"), {
            jobTitle: jobTitle,
            companyName: companyName,
            jobDescription: jobDescription,
            location: location,
            address: address,
            salary: salary,
            jobType: jobType,
            postedBy: auth.currentUser.uid, // Get the ID of the currently signed-in user (employer)
            postedAt: new Date(),  // Timestamp for when the job was posted
            approved: false  // Mark as pending approval
        });

        console.log("Job posted successfully with ID: ", docRef.id);

        // Redirect the user to the employer dashboard after posting the job
        window.location.href = 'employerPortal.html';  
    } catch (error) {
        console.error("Error posting job: ", error);
        alert("Error posting the job. Please try again.");
    }
});

// Function for Admin to fetch unapproved jobs
async function fetchUnapprovedJobs() {
    const q = query(collection(db, "jobs"), where("approved", "==", false));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const jobData = doc.data();
        console.log(doc.id, " => ", jobData);
        // Display the unapproved job here for the admin to review and approve
        // Admin view logic here
    });
}

// Admin approves a job posting
async function approveJob(jobId) {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
        approved: true
    });
    console.log("Job approved:", jobId);
    // Optionally, you can refresh the job list for the admin
}

// Admin rejects a job posting
async function rejectJob(jobId) {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
        approved: false  // Optionally, you can delete the job or flag it as rejected
    });
    console.log("Job rejected:", jobId);
    // Optionally, you can refresh the job list for the admin
}

// Fetch Employer's Own Job Listings
async function fetchEmployerJobs() {
    const q = query(collection(db, "jobs"), where("postedBy", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const jobData = doc.data();
        console.log(doc.id, " => ", jobData);
        // Display the employer's job listing here
        // Employer job listing display logic here
    });
}

// Call the functions depending on the page context
// Uncomment these depending on where you're using the functions:
// fetchEmployerJobs(); // To fetch the employer's job listings
// fetchUnapprovedJobs(); // To fetch the unapproved jobs for admin
