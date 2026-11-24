// TaskForce settings. Fill these in from your Firebase project (see README.md).
// While apiKey still says PASTE, the app runs in demo mode on this phone only.

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE.firebaseapp.com",
  projectId: "PASTE",
  storageBucket: "PASTE.appspot.com",
  messagingSenderId: "PASTE",
  appId: "PASTE"
};

// Firebase console > Project settings > Cloud Messaging > Web Push certificates > Key pair
export const vapidKey = "PASTE_VAPID_KEY";

// The two people who use TaskForce. Emails must match the sign-ins you create in Firebase.
export const people = [
  { key: "shaun", name: "Shaun", email: "PASTE_SHAUN_EMAIL" },
  { key: "lyndsey", name: "Lyndsey", email: "PASTE_LYNDSEY_EMAIL" }
];
