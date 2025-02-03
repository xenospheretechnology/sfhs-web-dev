import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Firebase Configuration
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

// Fetch Users from Firestore
async function fetchUsers() {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    const userTable = document.getElementById("userTable");
    userTable.innerHTML = "";

    querySnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        const userId = userDoc.id;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.status === "banned" ? "❌ Banned" : "✅ Active"}</td>
            <td>
                ${
                    user.status === "banned"
                        ? `<button class="unban-btn" data-id="${userId}">Unban</button>`
                        : `<button class="ban-btn" data-id="${userId}">Ban</button>`
                }
            </td>
        `;

        userTable.appendChild(row);
    });

    // Ban User Event Listener
    document.querySelectorAll(".ban-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const userId = event.target.getAttribute("data-id");
            await banUser(userId);
            fetchUsers(); // Refresh the table
        });
    });

    // Unban User Event Listener
    document.querySelectorAll(".unban-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const userId = event.target.getAttribute("data-id");
            await unbanUser(userId);
            fetchUsers(); // Refresh the table
        });
    });
}

// Ban User Function
async function banUser(userId) {
    if (!confirm("Are you sure you want to ban this user?")) return;

    try {
        await updateDoc(doc(db, "users", userId), { status: "banned" });
        alert("User has been banned.");
    } catch (error) {
        console.error("Error banning user:", error);
        alert("Failed to ban user.");
    }
}

// Unban User Function
async function unbanUser(userId) {
    if (!confirm("Are you sure you want to unban this user?")) return;

    try {
        await updateDoc(doc(db, "users", userId), { status: "active" });
        alert("User has been unbanned.");
    } catch (error) {
        console.error("Error unbanning user:", error);
        alert("Failed to unban user.");
    }
}

// Load Users on Page Load
fetchUsers();
