// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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

/**
 * Fetches and displays the student's first name in the sidebar.
 * @param {string} uid - The UID of the signed-in student.
 */
async function updateStudentName(uid) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const studentName = userData.firstName || "Student";

      // Update the sidebar text
      document.querySelector(".sidebar h2").innerHTML = `Welcome, <br><strong>${studentName}</strong>`;
    }
  } catch (error) {
    console.error("Error fetching student name:", error);
  }
}

/**
 * Loads and displays the applications for the given student UID.
 * @param {string} studentId - The UID of the student.
 */
async function loadApplications(studentId) {
  const applicationsContainer = document.getElementById("myApplications");
  applicationsContainer.innerHTML = ''; // Clear the container

  try {
    const applicationsRef = collection(db, "applications");
    const applicationsQuery = query(
      applicationsRef,
      where("studentId", "==", studentId),
      orderBy("timeCreated", "desc"),
      limit(3)
    );

    const querySnapshot = await getDocs(applicationsQuery);

    if (querySnapshot.empty) {
      applicationsContainer.innerHTML = "<p>No applications found.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const appData = doc.data();

        const appCard = document.createElement('div');
        appCard.classList.add('job-card'); 

        appCard.innerHTML = `
          <h3>${appData.jobTitle || "Job Title"}</h3>
          <p><strong>Company:</strong> ${appData.companyName || "Company Name"}</p>
          <p><strong>Application Date:</strong> ${appData.timeCreated.toDate().toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${appData.status || "Pending"}</p>
        `;
        applicationsContainer.appendChild(appCard);
      });
    }
  } catch (error) {
    console.error("Error loading applications:", error);
    applicationsContainer.innerHTML = "<p>Error loading applications.</p>";
  }
}

// Monitor authentication state and load data when a user is signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateStudentName(user.uid);
    loadApplications(user.uid);
  } else {
    window.location.href = 'signIn.html';
  }
});
