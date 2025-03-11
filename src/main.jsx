import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="671845549558-ceaj5qh7romftff7r5cocnckuqo17cd0.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
