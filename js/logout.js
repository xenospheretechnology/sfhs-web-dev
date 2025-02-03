import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const auth = getAuth();

function logout() {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully.");
            window.location.href = "login.html"; // Redirect to login page
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
}
