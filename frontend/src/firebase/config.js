// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";


// const firebaseConfig = {
//   apiKey: "AIzaSyDVDVc_dXoD2eutEESdCK4t11lFqOc60Y8",
//   authDomain: "ai-notes-manager-6b464.firebaseapp.com",
//   projectId: "ai-notes-manager-6b464",
//   storageBucket: "ai-notes-manager-6b464.firebasestorage.app",
//   messagingSenderId: "343440514129",
//   appId: "1:343440514129:web:ac358b879d66d4b303ec70"
// };


// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDVDVc_dXoD2eutEESdCK4t11lFqOc60Y8",
  authDomain: "ai-notes-manager-6b464.firebaseapp.com",
  projectId: "ai-notes-manager-6b464",
  storageBucket: "ai-notes-manager-6b464.firebasestorage.app",
  messagingSenderId: "343440514129",
  appId: "1:343440514129:web:ac358b879d66d4b303ec70"
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "asia-south2");
