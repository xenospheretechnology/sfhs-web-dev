// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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
 * Fetches and updates the student's first name in the sidebar.
 * @param {string} uid - The UID of the student.
 */
async function updateUserName(uid) {
  console.log("Fetching user data for UID (Document ID):", uid);

  try {
    const userDocRef = doc(db, "users", uid); // Fetch document using UID as ID
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const firstName = userData.firstName || "Student";
      console.log("User found:", firstName);

      document.querySelector(".sidebar h2").innerHTML = `Welcome, <br><strong>${firstName}</strong>`;
    } else {
      console.warn("User document not found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
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
    // Reference to the applications collection
    const applicationsRef = collection(db, "applications");

    // Create a query to filter applications by the logged-in student's UID.
    // Order the applications by timestamp (most recent first)
    const applicationsQuery = query(
      applicationsRef,
      where("studentId", "==", studentId),
      orderBy("timeCreated", "desc")
    );

    const querySnapshot = await getDocs(applicationsQuery);

    // If no applications are found, display a message.
    if (querySnapshot.empty) {
      applicationsContainer.innerHTML = "<p>No applications found.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const appData = doc.data();

        // Create a card for each application
        const appCard = document.createElement('div');
        appCard.classList.add('job-card');  // Reusing your job-card CSS styling

        // Customize the fields below based on your Firestore structure.
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

// Monitor authentication state and load applications when a user is signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in:", user.uid);
    updateUserName(user.uid); // Update student name
    loadApplications(user.uid); // Load applications
  } else {
    console.log("No user signed in. Redirecting to sign-in page.");
    window.location.href = 'signIn.html';
  }
});
