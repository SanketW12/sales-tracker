import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_FIREBASE_API_KEY ?? "",
  authDomain: "medical-sales-b9cef.firebaseapp.com",
  projectId: "medical-sales-b9cef",
  storageBucket: "medical-sales-b9cef.firebasestorage.app",
  messagingSenderId: "966873323024",
  appId: "1:966873323024:web:24c95be39025b7f0961c95",
};

// Initialize Firebase
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const MAX_RETRIES = 1;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      retry: MAX_RETRIES,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>

    <div className="z-50">
      <ToastContainer
        position="bottom-center"
        className="z-[9999]" // Tailwind utility for z-index
      />
    </div>
  </StrictMode>
);
