import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Portal from "./pages/Portal";
import Admin from "./pages/Admin";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        />
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div
        style={{
          minHeight: "100vh",
          background: darkMode ? "#1a1a2e" : "#f5f5f5",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Portal darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
              }
            />
            <Route
              path="/admin"
              element={
                isAdmin ? (
                  <Admin
                    darkMode={darkMode}
                    onToggleDark={() => setDarkMode((d) => !d)}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </FluentProvider>
  );
}
