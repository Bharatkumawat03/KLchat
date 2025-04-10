import { initializeApp } from "firebase/app";
import "firebase/messaging";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { postApi } from "./api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const getOrRegisterServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers not supported");
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.update();
    }

    let registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
        }
      );
      console.log("new service worker registered ", registration);

      if (registration.installing) {
        console.log("service worker installing");
      }
    } else {
      // console.log('using curr service worker ', registration);
    }

    return registration;
  } catch (error) {
    console.error("service worker registration failed ", error);
    throw error;
  }
};

export const getFirebaseToken = async () => {
  try {
    const serviceWorkerRegistration = await getOrRegisterServiceWorker();

    if (!serviceWorkerRegistration) {
      console.error("service worker registration failed");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_REACT_APP_VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!token) {
      console.error("no firebase token available");
      return null;
    }

    console.log("firebase token ", token);

    const res = await postApi("/save-token", { fcmToken: token });
    console.log("Token saved:", res.data);

    return token;
  } catch (error) {
    console.error("error getting Firebase token ", error);
    return null;
  }
};

export const onForegroundMessage = () =>
  new Promise((resolve) => onMessage(messaging, (payload) => resolve(payload)));
