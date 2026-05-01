import {
  Button,
  Switch,
  Title2,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  DarkTheme24Regular,
  WeatherSunny24Regular,
  SignOut24Regular,
} from "@fluentui/react-icons";
import { clearAuth } from "../lib/auth";

const useStyles = makeStyles({
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 32px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    background: tokens.colorNeutralBackground1,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
});

interface NavBarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onSignOut?: () => void;
}

export default function NavBar({ darkMode, onToggleDark, onSignOut }: NavBarProps) {
  const styles = useStyles();

  const handleSignOut = () => {
    clearAuth();
    onSignOut?.();
    window.location.reload();
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <Title2>AI Demo Portal</Title2>
      </div>

      <div className={styles.right}>
        <Switch
          checked={darkMode}
          onChange={onToggleDark}
          label={darkMode ? <DarkTheme24Regular /> : <WeatherSunny24Regular />}
        />

        <Button
          icon={<SignOut24Regular />}
          appearance="subtle"
          size="small"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}
