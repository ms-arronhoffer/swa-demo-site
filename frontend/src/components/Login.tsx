import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Title2,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { sha256, setAuthenticated } from "../lib/auth";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "32px",
    borderRadius: "8px",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    minWidth: "320px",
    background: tokens.colorNeutralBackground1,
  },
});

interface LoginProps {
  passwordHash: string;
  onLogin: () => void;
}

export default function Login({ passwordHash, onLogin }: LoginProps) {
  const styles = useStyles();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const hash = await sha256(password);
    if (hash === passwordHash) {
      setAuthenticated(passwordHash);
      onLogin();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <Title2>AI Demo Portal</Title2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="Access Password"
            validationMessage={error}
            validationState={error ? "error" : "none"}
          >
            <Input
              type="password"
              value={password}
              onChange={(_, d) => setPassword(d.value)}
              placeholder="Enter password"
            />
          </Field>
          <Button type="submit" appearance="primary" disabled={loading || !password}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
