import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC7TTjeHfqn59XenvOT8eT_6epVbuX3Yts",
  authDomain: "smart-buoy-p39.firebaseapp.com",
  databaseURL: "https://smart-buoy-p39-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smart-buoy-p39",
  storageBucket: "smart-buoy-p39.firebasestorage.app",
  messagingSenderId: "54608535924",
  appId: "1:54608535924:web:f4c8141f5adea93e8d8c21",
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
