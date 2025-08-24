import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
       apiKey: "AIzaSyBs2RWVQhtX1sGAbvkPlbhwf4dFOO7JBDg",
    authDomain: "otobeas-bus.firebaseapp.com",
    projectId: "otobeas-bus",
    storageBucket: "otobeas-bus.appspot.com",
    messagingSenderId: "993445503923",
    appId: "1:993445503923:web:a4d3a35f9b41d1ef98a1c6",
    measurementId: "G-NMSKMRQW0S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("google-signin-btn").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("email");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    $("#name").val(user.displayName);
    $("#email").val(user.email);
});
