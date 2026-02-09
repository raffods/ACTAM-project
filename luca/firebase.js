import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbjbiewg9Iokn8gfCylQwcUS6FshKiBiE",
  authDomain: "actam-project-f090c.firebaseapp.com",
  projectId: "actam-project-f090c",
  storageBucket: "actam-project-f090c.firebasestorage.app",
  messagingSenderId: "178243201630",
  appId: "1:178243201630:web:75382fc94f9a44fd1ee2cf",
  measurementId: "G-HPJC791NME"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);