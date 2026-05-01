import {
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowRight24Regular,
  Code24Regular,
  Star24Filled,
} from "@fluentui/react-icons";
import type { Demo } from "../types";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "box-shadow 0.2s ease",
    ":hover": {
      boxShadow: tokens.shadow16,
    },
  },
  preview: {
    height: "160px",
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  gradient: {
    width: "100%",
    height: "100%",
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackgroundHover} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
  },
  badges: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  description: {
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flexGrow: 1,
  },
});

interface DemoCardProps {
  demo: Demo;
}

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) < 30;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Agents: "🤖",
  "Language Models": "💬",
  Vision: "👁️",
  Security: "🔒",
  RAG: "📚",
  "Multi-Modal": "🎨",
  "Code Generation": "💻",
  Default: "✨",
};

export default function DemoCard({ demo }: DemoCardProps) {
  const styles = useStyles();
  const emoji = CATEGORY_EMOJI[demo.category] ?? CATEGORY_EMOJI["Default"];

  return (
    <Card className={styles.card}>
      <CardPreview className={styles.preview}>
        {demo.thumbnail_url ? (
          <img src={demo.thumbnail_url} alt={demo.title} className={styles.thumbnail} />
        ) : (
          <div className={styles.gradient}>{emoji}</div>
        )}
        <div className={styles.badges}>
          {demo.featured && (
            <Badge icon={<Star24Filled />} color="warning" size="medium">
              Featured
            </Badge>
          )}
          {isNew(demo.created_at) && (
            <Badge color="success" size="medium">
              New
            </Badge>
          )}
        </div>
      </CardPreview>

      <CardHeader
        header={
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text weight="semibold" size={400}>
              {demo.title}
            </Text>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <Badge appearance="tint" color="brand" size="small">
                {demo.category}
              </Badge>
              {demo.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} appearance="tint" color="informative" size="small">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        }
      />

      <div style={{ padding: "0 16px", flexGrow: 1 }}>
        <Text size={300} className={styles.description}>
          {demo.description}
        </Text>
      </div>

      <CardFooter style={{ display: "flex", gap: "8px" }}>
        <Button
          appearance="primary"
          icon={<ArrowRight24Regular />}
          iconPosition="after"
          size="small"
          as="a"
          href={demo.demo_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Try Demo
        </Button>

        {demo.repo_url && (
          <Button
            appearance="outline"
            icon={<Code24Regular />}
            size="small"
            as="a"
            href={demo.repo_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Repo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
