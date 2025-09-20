import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHcIX8KRCqwXinohjkj69hoUNx2Jijg0E",
    authDomain: "sat-surge.firebaseapp.com",
    projectId: "sat-surge",
    storageBucket: "sat-surge.firebasestorage.app",
    messagingSenderId: "954241362586",
    appId: "1:954241362586:web:099faf85df771ecf24cd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

const userNameInput = document.getElementById('user-name');
const profilePicInput = document.getElementById('profile-pic');
const saveBtn = document.getElementById('save-btn');

let currentUser;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userNameInput.value = user.displayName || '';
    } else {
        // User is not signed in, redirect to login page
        window.location.href = 'index.html';
    }
});

saveBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const newName = userNameInput.value.trim();
    const newPic = profilePicInput.files[0];

    let photoURL = currentUser.photoURL;

    if (newPic) {
        const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
        await uploadBytes(storageRef, newPic);
        photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(currentUser, {
        displayName: newName,
        photoURL: photoURL
    });

    alert('Profile updated successfully!');
    window.location.href = 'index.html';
});
