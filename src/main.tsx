import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./contexts/AppContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AppProvider>
      <App />
    </AppProvider>
  </ThemeProvider>
);
