import { FluentProvider, webLightTheme, webDarkTheme } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import Portal from "./pages/Portal";
import Login from "./components/Login";
import { isAuthenticated } from "./lib/auth";
import type { Config } from "./types";

export default function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [config, setConfig] = useState<Config | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/config.json")
      .then((r) => r.json())
      .then((c: Config) => {
        setConfig(c);
        setAuthed(isAuthenticated(c.passwordHash));
      });
  }, []);

  const theme = darkMode ? webDarkTheme : webLightTheme;
  const bg = darkMode ? "#1a1a2e" : "#f5f5f5";

  if (!config) return null;

  if (!authed) {
    return (
      <FluentProvider theme={theme}>
        <Login passwordHash={config.passwordHash} onLogin={() => setAuthed(true)} />
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={theme}>
      <div style={{ minHeight: "100vh", background: bg }}>
        <Portal config={config} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      </div>
    </FluentProvider>
  );
}
