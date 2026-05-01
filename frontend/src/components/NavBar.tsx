import {
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
  SignOut24Regular,
} from "@fluentui/react-icons";
import { useSwaUser } from "../hooks/useSwaUser";

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
}

export default function NavBar({ darkMode, onToggleDark }: NavBarProps) {
  const styles = useStyles();
  const user = useSwaUser();

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

        {user && (
          <Text size={200} weight="semibold">
            {user.userDetails}
          </Text>
        )}

        <Button
          icon={<SignOut24Regular />}
          appearance="subtle"
          size="small"
          as="a"
          href="/.auth/logout"
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}
