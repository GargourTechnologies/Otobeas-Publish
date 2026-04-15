var signInConfig = document.getElementById("signin-config");
var returnUrl = signInConfig.dataset.returnUrl;
var enableGoogle = signInConfig.dataset.google == "True";
var enableFacebook = signInConfig.dataset.facebook == "True";

const firebaseConfig = {
    apiKey: "AIzaSyBs2RWVQhtX1sGAbvkPlbhwf4dFOO7JBDg",
    authDomain: "otobeas-bus.firebaseapp.com",
    projectId: "otobeas-bus",
    storageBucket: "otobeas-bus.appspot.com",
    messagingSenderId: "993445503923",
    appId: "1:993445503923:web:a4d3a35f9b41d1ef98a1c6",
    measurementId: "G-NMSKMRQW0S"
};

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}
const auth = getAuth(app);

// Google Signin
if (enableGoogle) {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("google-signin-btn")?.addEventListener("click", async () => {
            disableButtons();
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            provider.addScope("email");

            try {
                const result = await signInWithPopup(auth, provider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const googleIdToken = credential.idToken;

                $.ajax({
                    type: 'POST',
                    url: "/Account/SignInGoogle",
                    data: { 'idToken': googleIdToken, 'photo': result.user.photoURL },
                    success: function (res) {
                        if (res.isValid) signInSL(returnUrl);
                        else {
                            saveF(res.message);
                            enableButtons();
                        }
                    },
                    error: function (err) {
                        saveF(err);
                        enableButtons();
                    }
                });
            } catch (error) {
                enableButtons();
            }
        });
    });
}

// Facebook Signin
if (enableFacebook) {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("fb-signin-btn")?.addEventListener("click", async () => {
            disableButtons();
            const provider = new FacebookAuthProvider();
            provider.addScope("email");

            try {
                const result = await signInWithPopup(auth, provider);
                const credential = FacebookAuthProvider.credentialFromResult(result);
                const accessToken = credential.accessToken;

                $.ajax({
                    type: 'POST',
                    url: "/Account/SignInFacebook",
                    data: { 'accessToken': accessToken, 'photo': result.user.photoURL },
                    success: function (res) {
                        if (res.isValid) signInSL(returnUrl);
                        else {
                            saveF(res.message);
                            enableButtons();
                        }
                    },
                    error: function (err) {
                        saveF(err);
                        enableButtons();
                    }
                });
            } catch (error) {
                enableButtons();
            }
        });
    });
}

window.SignIn = function () {
    try {
        disableButtons();
        var form1 = document.getElementById('signInForm');
        var formData = new FormData(form1);

        $.ajax({
            type: 'POST',
            url: "/Account/SignIn",
            data: formData,
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.isValid) {
                    signInSL(returnUrl);
                } else {
                    saveF(res.message);
                    enableButtons();
                }
            },
            error: function (err) {
                saveF(err);
                enableButtons();
            }
        });

        return false; // prevent default
    } catch (ex) {
        saveF(ex);
        enableButtons();
    }
}

function disableButtons() {
    document.getElementById("fb-signin-btn")?.setAttribute("disabled", true);
    document.getElementById("google-signin-btn")?.setAttribute("disabled", true);
    document.getElementById("Save")?.setAttribute("disabled", true);
}

function enableButtons() {
    document.getElementById("fb-signin-btn")?.removeAttribute("disabled");
    document.getElementById("google-signin-btn")?.removeAttribute("disabled");
    document.getElementById("Save")?.removeAttribute("disabled");
}
