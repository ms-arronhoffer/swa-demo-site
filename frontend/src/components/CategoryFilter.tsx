import { Button, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  bar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "24px",
  },
  pill: {
    borderRadius: "999px",
  },
});

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const styles = useStyles();

  return (
    <div className={styles.bar}>
      {["All", ...categories].map((cat) => (
        <Button
          key={cat}
          className={styles.pill}
          appearance={selected === cat ? "primary" : "outline"}
          size="small"
          onClick={() => onChange(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
