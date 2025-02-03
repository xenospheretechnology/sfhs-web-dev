// Get user role from sessionStorage
const userRole = sessionStorage.getItem('userRole');

// Redirect based on role
if (userRole === 'admin') {
    window.location.href = 'adminPortal.html';
} else if (userRole === 'employer') {
    window.location.href = 'employerPortal.html';
} else if (userRole === 'student') {
    window.location.href = 'studentPortal.html';
} else {
    // If no role is found, redirect to Sign In page
    console.log('No role found. Redirecting to sign-in...');
    window.location.href = 'signIn.html';
}
