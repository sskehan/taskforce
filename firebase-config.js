// TaskForce settings. Fill these in from your Firebase project (see README.md).
// While apiKey still says PASTE, the app runs in demo mode on this phone only.

export const firebaseConfig = {
  apiKey: "AIzaSyAo9kzjFQbRZwDS1sfSOM0MmydiS8_OjB8",
  authDomain: "taskforce-2542c.firebaseapp.com",
  projectId: "taskforce-2542c",
  storageBucket: "taskforce-2542c.firebasestorage.app",
  messagingSenderId: "477984667958",
  appId: "1:477984667958:web:593f46b08f047be53c9b97"
};

// Firebase console > Project settings > Cloud Messaging > Web Push certificates > Key pair
export const vapidKey = "BHyFA8t7QvtF81v8dJ6RSrz-E1T_WMmmdTjFu60BR3FFd1HdYdzwo8E5ouYprqeDsbib-ORslcmUkeu2VZv_ebw";

// The two people who use TaskForce. Emails must match the sign-ins you create in Firebase.
export const people = [
  { key: "shaun", name: "Shaun", email: "shaun_skehan@hotmail.com" },
  { key: "lyndsey", name: "Lyndsey", email: "lyndsey_gpn@yahoo.com" }
];
