import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC5_kDNqu22qmmhZg3GHM08hgDA6c3bflA",
  authDomain: "whatsapp-b91d7.firebaseapp.com",
  databaseURL: "https://whatsapp-b91d7-default-rtdb.firebaseio.com",
  projectId: "whatsapp-b91d7",
  storageBucket: "whatsapp-b91d7.firebasestorage.app",
  messagingSenderId: "1008560073725",
  appId: "1:1008560073725:web:e0aedaa22f7b632edbc794",
  measurementId: "G-SZTDE4J7LB",
};

// 🔥 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔐 Firebase Auth
const auth = getAuth(app);

// 🗄️ Firestore Database
const db = getFirestore(app);

// 📊 Analytics (SAFE MODE – local me hang nahi karega)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, analytics };
