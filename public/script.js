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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const questionsContainer = document.getElementById('questions-container');

// Sign in with Google
loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .catch(error => {
            console.error("Error during sign-in:", error);
        });
});

// Sign out
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        userName.textContent = user.displayName;
        loadQuestions();
    } else {
        // User is signed out
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        questionsContainer.innerHTML = ''; // Clear questions
    }
});

// Fetch questions from Firestore
function loadQuestions() {
    db.collection('sat_questions').get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                questionsContainer.innerHTML = "<p>No questions found. Please add some to your Firestore database.</p>";
                return;
            }
            querySnapshot.forEach(doc => {
                const question = doc.data();
                const questionCard = document.createElement('div');
                questionCard.className = 'question-card';

                const questionText = document.createElement('h2');
                questionText.textContent = question.question_text; // Assuming a 'text' field in your document

                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.placeholder = 'Enter your answer';

                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';

                const resultText = document.createElement('p');
                resultText.textContent = '';

                submitButton.addEventListener('click', () => {
                    const userAnswer = answerInput.value.trim();
                    if (userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
                        resultText.textContent = 'Correct!';
                        resultText.style.color = 'green';
                    } else {
                        resultText.textContent = 'Incorrect. Try again.';
                        resultText.style.color = 'red';
                    }
                });

                questionCard.appendChild(questionText);
                questionCard.appendChild(answerInput);
                questionCard.appendChild(submitButton);
                questionCard.appendChild(resultText);
                questionsContainer.appendChild(questionCard);
            });
        })
        .catch(error => {
            console.error("Error getting documents: ", error);
            questionsContainer.innerHTML = `<p style="color: red;">Error loading questions: ${error.message}</p>`;
        });
}