import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Subtitle1,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Delete24Regular,
  Edit24Regular,
  Star24Filled,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import AdminDemoForm from "../components/AdminDemoForm";
import NavBar from "../components/NavBar";
import type { Category, Demo, DemoCreate } from "../types";

const useStyles = makeStyles({
  page: { minHeight: "100vh" },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  section: {
    marginBottom: "48px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
});

interface AdminProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Admin({ darkMode, onToggleDark }: AdminProps) {
  const styles = useStyles();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = () => {
    return Promise.all([
      fetch("/api/demos").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([d, c]) => {
      setDemos(d);
      setCategories(c);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDemo = async (data: DemoCreate, id?: string) => {
    const url = id ? `/api/demos/${id}` : "/api/demos";
    const method = id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await loadData();
  };

  const handleDeleteDemo = async (id: string) => {
    await fetch(`/api/demos/${id}`, { method: "DELETE" });
    setDemos((prev) => prev.filter((d) => d.id !== id));
    setDeletingId(null);
  };

  const handleAddCategory = async (name: string, description?: string) => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className={styles.page}>
      <NavBar darkMode={darkMode} onToggleDark={onToggleDark} />

      <div className={styles.content}>
        <div className={styles.header}>
          <Title1>Admin Console</Title1>
          <AdminDemoForm
            categories={categories}
            trigger={
              <Button appearance="primary" icon={<Add24Regular />}>
                Add Demo
              </Button>
            }
            onSave={handleSaveDemo}
          />
        </div>

        {/* ── Demos Table ─────────────────────────────────────────────── */}
        <div className={styles.section}>
          <Subtitle1 style={{ marginBottom: 16, display: "block" }}>
            Demos ({demos.length})
          </Subtitle1>

          {loading ? (
            <Text>Loading…</Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Views</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos.map((demo) => (
                  <TableRow key={demo.id}>
                    <TableCell>
                      <TableCellLayout>
                        <Text weight="semibold">{demo.title}</Text>
                      </TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="tint" color="brand">
                        {demo.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{demo.view_count}</TableCell>
                    <TableCell>
                      {demo.featured && (
                        <Badge icon={<Star24Filled />} color="warning" size="small">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <AdminDemoForm
                          demo={demo}
                          categories={categories}
                          trigger={
                            <Button
                              icon={<Edit24Regular />}
                              appearance="subtle"
                              size="small"
                            />
                          }
                          onSave={handleSaveDemo}
                        />

                        <Dialog
                          open={deletingId === demo.id}
                          onOpenChange={(_, d) =>
                            setDeletingId(d.open ? demo.id : null)
                          }
                        >
                          <DialogTrigger disableButtonEnhancement>
                            <Button
                              icon={<Delete24Regular />}
                              appearance="subtle"
                              size="small"
                            />
                          </DialogTrigger>
                          <DialogSurface>
                            <DialogBody>
                              <DialogTitle>Delete Demo</DialogTitle>
                              <DialogContent>
                                Are you sure you want to delete{" "}
                                <strong>{demo.title}</strong>? This cannot be
                                undone.
                              </DialogContent>
                              <DialogActions>
                                <DialogTrigger disableButtonEnhancement>
                                  <Button appearance="secondary">Cancel</Button>
                                </DialogTrigger>
                                <Button
                                  appearance="primary"
                                  onClick={() => handleDeleteDemo(demo.id)}
                                  style={{
                                    background: tokens.colorStatusDangerBackground3,
                                  }}
                                >
                                  Delete
                                </Button>
                              </DialogActions>
                            </DialogBody>
                          </DialogSurface>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* ── Categories ──────────────────────────────────────────────── */}
        <div className={styles.section}>
          <CategoryManager
            categories={categories}
            onAdd={handleAddCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>
    </div>
  );
}

/* ── inline category manager ───────────────────────────────────────────── */

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, description?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    await onAdd(name.trim(), desc.trim() || undefined);
    setName("");
    setDesc("");
    setAdding(false);
  };

  return (
    <div>
      <Subtitle1 style={{ display: "block", marginBottom: 16 }}>
        Categories
      </Subtitle1>

      <div style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
        <Field label="Name">
          <Input
            value={name}
            onChange={(_, d) => setName(d.value)}
            placeholder="New category name"
          />
        </Field>
        <Field label="Description">
          <Input
            value={desc}
            onChange={(_, d) => setDesc(d.value)}
            placeholder="Optional"
          />
        </Field>
        <div style={{ alignSelf: "flex-end" }}>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={handleAdd}
            disabled={adding || !name.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {categories.map((cat) => (
          <span
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: "999px",
              border: `1px solid ${tokens.colorNeutralStroke1}`,
            }}
          >
            <Text size={200}>{cat.name}</Text>
            <button
              onClick={() => onDelete(cat.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: tokens.colorNeutralForeground3,
                fontSize: 14,
                padding: 0,
              }}
              title={`Delete ${cat.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
