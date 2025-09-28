import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

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
const db = getFirestore(app);
const geminiApiKey = "AIzaSyBAP3pZOO15J7EuUII7LvAxAzrfooF7h0A";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

let currentQuestionText = ''; // To store the text of the clicked question

const mainContainer = document.getElementById('main-container');
const questionsContainer = document.getElementById('questions-container');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');

// Auth state listener
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        mainContainer.style.display = 'block';
        loadQuestions();
    } else {
        // User is signed out
        mainContainer.style.display = 'none';
        questionsContainer.innerHTML = ''; // Clear questions
        // Redirect to login page
        window.location.href = 'index.html';
    }
});

// Fetch questions from Firestore
async function loadQuestions() {
    try {
        const querySnapshot = await getDocs(collection(db, 'sat_questions'));
        if (querySnapshot.empty) {
            questionsContainer.innerHTML = "<p>No questions found. Please add some to your Firestore database.</p>";
            return;
        }
        querySnapshot.forEach(doc => {
            const question = doc.data();
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card';

            // Add a click listener to the card
            questionCard.addEventListener('click', () => {
                currentQuestionText = question.question_text;
                // Optional: Add a visual indicator that the card is selected
                document.querySelectorAll('.question-card').forEach(card => card.classList.remove('selected'));
                questionCard.classList.add('selected');
            });

            const questionText = document.createElement('h3');
            questionText.textContent = question.question_text; // Assuming a 'text' field in your document

            const answerInput = document.createElement('input');
            answerInput.type = 'text';
            answerInput.placeholder = 'Enter your answer';

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';

            const resultText = document.createElement('p');
            resultText.textContent = '';

            submitButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event from firing
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
    } catch (error) {
        console.error("Error getting documents: ", error);
        questionsContainer.innerHTML = `<p style="color: red;">Error loading questions: ${error.message}</p>`;
    }
}

// Chat functionality
const chat = model.startChat();

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    appendMessage(messageText, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    try {
        // Prepend the current question text to the message
        const messageWithContext = currentQuestionText 
            ? `Question: "${currentQuestionText}"

My question is: ${messageText}`
            : messageText;

        const result = await chat.sendMessageStream(messageWithContext);
        let text = '';
        const geminiMessageElement = appendMessage('', 'gemini');
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            text += chunkText;
            geminiMessageElement.textContent = text;
        }
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        appendMessage("Sorry, I couldn't get a response. Please try again.", 'gemini');
    } finally {
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
    }
}

function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    const p = document.createElement('p');
    p.textContent = text;
    messageElement.appendChild(p);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return p;
}