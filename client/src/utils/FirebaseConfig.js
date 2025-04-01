
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-4fUthuExa2DdIErWichqy4UMZ2HLRyE",
  authDomain: "chatapp-68a6c.firebaseapp.com",
  projectId: "chatapp-68a6c",
  storageBucket: "chatapp-68a6c.appspot.com",
  messagingSenderId: "65141465915",
  appId: "1:65141465915:web:2d1738c7054172c163cd1e",
  measurementId: "G-26DLGRR4Q0"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth=getAuth(app);  