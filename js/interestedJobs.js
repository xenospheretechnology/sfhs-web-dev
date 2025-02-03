// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Firebase configuration
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

// Fetches and displays the student's name in the sidebar
async function updateStudentName(uid) {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const studentName = userData.firstName || "Student";

    // Update the sidebar text
    document.querySelector(".sidebar h2").innerHTML = `Welcome, <br><strong>${studentName}</strong>`;
  }
}

// Load and display the interested jobs for the logged-in user
async function loadInterestedJobs(studentId) {
  const jobContainer = document.getElementById("interestedJobs");
  jobContainer.innerHTML = ''; // Clear the container

  try {
    const jobsRef = collection(db, "interested_students");
    const jobsQuery = query(
      jobsRef,
      where("studentId", "==", studentId)
    );

    const querySnapshot = await getDocs(jobsQuery);

    if (querySnapshot.empty) {
      jobContainer.innerHTML = "<p>No interested jobs found.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const jobData = doc.data();

        const jobCard = document.createElement('div');
        jobCard.classList.add('job-card');

        jobCard.innerHTML = `
          <h3>${jobData.jobTitle || "Job Title"}</h3>
          <p><strong>Company:</strong> ${jobData.companyName || "Company Name"}</p>
        `;
        jobContainer.appendChild(jobCard);
      });
    }
  } catch (error) {
    console.error("Error loading interested jobs:", error);
    jobContainer.innerHTML = "<p>Error loading interested jobs.</p>";
  }
}

// Monitor authentication state and load data when a user is signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Update the student's name and load their interested jobs
    updateStudentName(user.uid);
    loadInterestedJobs(user.uid);
  } else {
    // If no user is logged in, redirect to sign-in page
    window.location.href = 'signIn.html';
  }
});
