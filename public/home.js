import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHcIX8KRCqwXinohjkj69hoUNx2Jijg0E",
    authDomain: "sat-surge.firebaseapp.com",
    projectId: "sat-surge",
    storageBucket: "sat-surge.firebasestorage.app",
    messagingSenderId: "954241362586",
    appId: "1:954241362586:web:099faf85df771ecf24cd2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in, stay on this page.
    } else {
        // No user is signed in, redirect to login page.
        window.location.href = 'login.html';
    }
});

// Add a logout button to the UI
const logoutButton = document.createElement('button');
logoutButton.id = 'logout-btn';
logoutButton.textContent = 'Logout';
logoutButton.addEventListener('click', () => {
    signOut(auth);
});

// Add the logout button to the user profile section
const userProfile = document.getElementById('user-profile');
if(userProfile) {
    userProfile.appendChild(logoutButton);
}