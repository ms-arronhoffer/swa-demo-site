import { FluentProvider, webLightTheme, webDarkTheme } from "@fluentui/react-components";
import { useState } from "react";
import Portal from "./pages/Portal";

export default function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div style={{ minHeight: "100vh", background: darkMode ? "#1a1a2e" : "#f5f5f5" }}>
        <Portal darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      </div>
    </FluentProvider>
  );
}
