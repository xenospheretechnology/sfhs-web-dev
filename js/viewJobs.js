// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { 
    getFirestore, doc, getDoc, collection, getDocs, addDoc, query, where 
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

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

let allJobs = [];
let currentUser = null;

// Function to fetch user's first name and update sidebar
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

// Track the signed-in user and update name
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User signed in:", user.uid);
        currentUser = user;
        updateUserName(user.uid);
    } else {
        console.log("No user signed in.");
        currentUser = null;
    }
});

// Function to display jobs
function displayJobs(jobList) {
    const jobListingsContainer = document.getElementById("jobListings");
    jobListingsContainer.innerHTML = "";

    if (jobList.length === 0) {
        jobListingsContainer.innerHTML = "<p>No jobs available at the moment.</p>";
    } else {
        jobList.forEach((job) => {
            const jobType = formatJobType(job.jobType);
            const locationType = formatLocationType(job.location);

            const jobCard = document.createElement("div");
            jobCard.classList.add("job-card");

            jobCard.innerHTML = `
                <h3 class="job-title">${job.jobTitle}</h3>
                <p class="company-name">${job.companyName}</p>
                <p class="job-location">${locationType}</p>
                <div class="job-details">
                    <span class="job-type">${jobType}</span>
                    <span class="salary-range">${job.salary}</span>
                </div>
                <a href="apply.html">
                    <button class="apply-btn">Apply Now</button>
                </a>
                <button class="interest-btn" data-job-id="${job.id}" data-title="${job.jobTitle}" data-company="${job.companyName}">Interested</button>
            `;

            jobListingsContainer.appendChild(jobCard);
        });

        // Attach event listeners for the Interested buttons
        document.querySelectorAll(".interest-btn").forEach(button => {
            button.addEventListener("click", handleInterestedClick);
        });
    }
}

// Function to handle clicking "Interested"
async function handleInterestedClick(event) {
    if (!currentUser) {
        alert("You must be signed in to mark jobs as interested.");
        return;
    }

    const button = event.target;
    const jobId = button.getAttribute("data-job-id");
    const jobTitle = button.getAttribute("data-title");
    const companyName = button.getAttribute("data-company");

    try {
        // Check if the student has already marked this job as Interested
        const interestedQuery = query(
            collection(db, "interested_students"),
            where("studentId", "==", currentUser.uid),
            where("jobId", "==", jobId)
        );

        const querySnapshot = await getDocs(interestedQuery);

        if (!querySnapshot.empty) {
            alert("You've already marked this job as interested!");
            return;
        }

        // Save to Firestore
        await addDoc(collection(db, "interested_students"), {
            studentId: currentUser.uid,
            jobId: jobId,
            jobTitle: jobTitle,
            companyName: companyName,
            timestamp: new Date()
        });

        alert("Job saved to Interested Jobs!");
        button.textContent = "Marked as Interested";
        button.disabled = true; // Prevent multiple submissions
    } catch (error) {
        console.error("Error saving interested job: ", error);
        alert("Error saving job. Please try again.");
    }
}

// Function to format job type
function formatJobType(type) {
    const mapping = {
        "full-time": "Full-time",
        "part-time": "Part-time",
        "internship": "Internship",
        "freelance": "Freelance"
    };
    return mapping[type] || type;
}

// Function to format location type
function formatLocationType(type) {
    const mapping = {
        "in person": "In Person",
        "hybrid": "Hybrid",
        "remote": "Remote"
    };
    return mapping[type] || type;
}

// Function to fetch jobs from Firestore
async function fetchJobs() {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    allJobs = [];

    querySnapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() };
        if (job.approved === true) {
            allJobs.push(job);
        }
    });

    displayJobs(allJobs);
}

// Fetch jobs on page load
fetchJobs();
// Function to filter jobs based on search input and dropdowns
function filterJobs() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const selectedLocation = document.getElementById("locationFilter").value;
    const selectedJobType = document.getElementById("jobTypeFilter").value;

    const filteredJobs = allJobs.filter(job => {
        const matchesSearch = job.jobTitle.toLowerCase().includes(searchQuery) ||
                              job.companyName.toLowerCase().includes(searchQuery);

        const matchesLocation = selectedLocation ? job.location === selectedLocation : true;
        const matchesJobType = selectedJobType ? job.jobType === selectedJobType : true;

        return matchesSearch && matchesLocation && matchesJobType;
    });

    displayJobs(filteredJobs);
}

// Attach event listeners for filtering
document.getElementById("searchBar").addEventListener("input", filterJobs);
document.getElementById("locationFilter").addEventListener("change", filterJobs);
document.getElementById("jobTypeFilter").addEventListener("change", filterJobs);
