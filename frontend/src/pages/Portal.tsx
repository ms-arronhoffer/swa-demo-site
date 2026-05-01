import {
  Skeleton,
  SkeletonItem,
  Subtitle1,
  Text,
  Title1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import CategoryFilter from "../components/CategoryFilter";
import DemoCard from "../components/DemoCard";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import type { Category, Demo } from "../types";
import { apiFetch } from "../lib/api";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
  },
  hero: {
    padding: "48px 32px 32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    padding: "0 32px 48px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  empty: {
    padding: "64px 32px",
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
});

interface PortalProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Portal({ darkMode, onToggleDark }: PortalProps) {
  const styles = useStyles();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/demos").then((r) => r.json()),
      apiFetch("/api/categories").then((r) => r.json()),
    ]).then(([demoData, catData]) => {
      setDemos(demoData);
      setCategories(catData);
      setLoading(false);
    });
  }, []);

  const handleView = useCallback((id: string) => {
    apiFetch(`/api/demos/${id}`).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = demos;
    if (selectedCategory !== "All") {
      result = result.filter((d) => d.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [demos, selectedCategory, search]);

  const featured = filtered.filter((d) => d.featured);
  const rest = filtered.filter((d) => !d.featured);

  return (
    <div className={styles.page}>
      <NavBar darkMode={darkMode} onToggleDark={onToggleDark} />

      <div className={styles.hero}>
        <Title1>AI Demo Gallery</Title1>
        <Text
          size={400}
          style={{ display: "block", marginTop: 8, color: tokens.colorNeutralForeground3 }}
        >
          Explore hands-on AI demos. Click any card to try it live.
        </Text>

        <div className={styles.controls}>
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter
            categories={categories.map((c) => c.name)}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 340, borderRadius: 8 }}>
              <SkeletonItem style={{ height: "100%" }} />
            </Skeleton>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Text size={600}>🔍</Text>
          <Subtitle1 style={{ display: "block", marginTop: 8 }}>
            No demos found
          </Subtitle1>
          <Text style={{ color: tokens.colorNeutralForeground3 }}>
            Try adjusting your search or category filter.
          </Text>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div style={{ padding: "0 32px 8px", maxWidth: 1200, margin: "0 auto" }}>
              <Subtitle1>⭐ Featured</Subtitle1>
            </div>
          )}
          <div className={styles.grid}>
            {[...featured, ...rest].map((demo) => (
              <DemoCard key={demo.id} demo={demo} onView={handleView} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
