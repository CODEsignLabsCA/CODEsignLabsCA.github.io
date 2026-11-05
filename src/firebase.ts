import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Mapeo seguro con el estándar de variables de entorno de Astro
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 1. Inicializar la instancia global de Firebase
export const app = initializeApp(firebaseConfig);

// 2. Inicializar y exportar la Base de Datos Firestore
export const db = getFirestore(app);

// 3. Inicializar Analytics protegiendo los entornos estáticos y de servidor de Astro
export const analytics = typeof window !== "undefined" && await isSupported()
  ? getAnalytics(app)
  : null;
