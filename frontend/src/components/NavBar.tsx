import {
  Avatar,
  Badge,
  Button,
  Switch,
  Text,
  Title2,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  DarkTheme24Regular,
  WeatherSunny24Regular,
  Settings24Regular,
  SignOut24Regular,
} from "@fluentui/react-icons";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    textDecoration: "none",
    color: "inherit",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userName: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
});

interface NavBarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function NavBar({ darkMode, onToggleDark }: NavBarProps) {
  const styles = useStyles();
  const { user, isAdmin } = useAuth();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <Title2>AI Demo Portal</Title2>
      </Link>

      <div className={styles.right}>
        <Switch
          checked={darkMode}
          onChange={onToggleDark}
          label={darkMode ? <DarkTheme24Regular /> : <WeatherSunny24Regular />}
        />

        {isAdmin && (
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <Button icon={<Settings24Regular />} appearance="subtle">
              Admin
            </Button>
          </Link>
        )}

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={styles.userName}>
              <Text weight="semibold" size={200}>
                {user.name}
              </Text>
              {isAdmin && (
                <Badge color="brand" size="small">
                  Admin
                </Badge>
              )}
            </div>
            <Avatar name={user.name} size={32} />
          </div>
        )}

        <a href="/.auth/logout" style={{ textDecoration: "none" }}>
          <Button icon={<SignOut24Regular />} appearance="subtle" size="small">
            Sign out
          </Button>
        </a>
      </div>
    </nav>
  );
}
