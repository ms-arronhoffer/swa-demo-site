import {
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
  Switch,
  Textarea,
  Select,
  makeStyles,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useState, useEffect } from "react";
import type { Demo, DemoCreate, Category } from "../types";

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
});

const EMPTY_FORM: DemoCreate = {
  title: "",
  description: "",
  category: "",
  demo_url: "",
  repo_url: "",
  thumbnail_url: "",
  featured: false,
  tags: [],
};

interface AdminDemoFormProps {
  demo?: Demo;
  categories: Category[];
  trigger: React.ReactElement;
  onSave: (data: DemoCreate, id?: string) => Promise<void>;
}

export default function AdminDemoForm({
  demo,
  categories,
  trigger,
  onSave,
}: AdminDemoFormProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DemoCreate>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demo) {
      setForm({
        title: demo.title,
        description: demo.description,
        category: demo.category,
        demo_url: demo.demo_url,
        repo_url: demo.repo_url ?? "",
        thumbnail_url: demo.thumbnail_url ?? "",
        featured: demo.featured,
        tags: [...demo.tags],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setTagInput("");
  }, [demo, open]);

  const set = (field: keyof DemoCreate, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set(
      "tags",
      form.tags.filter((t) => t !== tag)
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form, demo?.id);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>{trigger}</DialogTrigger>
      <DialogSurface style={{ maxWidth: 620 }}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            {demo ? "Edit Demo" : "Add Demo"}
          </DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <Field label="Title" required>
                <Input
                  value={form.title}
                  onChange={(_, d) => set("title", d.value)}
                  placeholder="Semantic Kernel Agent Demo"
                />
              </Field>

              <Field label="Description" required>
                <Textarea
                  value={form.description}
                  onChange={(_, d) => set("description", d.value)}
                  placeholder="2-3 sentences describing what this demo showcases…"
                  rows={3}
                />
              </Field>

              <div className={styles.row}>
                <Field label="Category" required>
                  <Select
                    value={form.category}
                    onChange={(_, d) => set("category", d.value)}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Featured">
                  <Switch
                    checked={form.featured}
                    onChange={(_, d) => set("featured", d.checked)}
                    label={form.featured ? "Yes" : "No"}
                  />
                </Field>
              </div>

              <Field label="Demo URL" required>
                <Input
                  value={form.demo_url}
                  onChange={(_, d) => set("demo_url", d.value)}
                  type="url"
                  placeholder="https://..."
                />
              </Field>

              <div className={styles.row}>
                <Field label="Repo URL">
                  <Input
                    value={form.repo_url ?? ""}
                    onChange={(_, d) => set("repo_url", d.value)}
                    type="url"
                    placeholder="https://github.com/..."
                  />
                </Field>

                <Field label="Thumbnail URL">
                  <Input
                    value={form.thumbnail_url ?? ""}
                    onChange={(_, d) => set("thumbnail_url", d.value)}
                    type="url"
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <Field label="Tags">
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    value={tagInput}
                    onChange={(_, d) => setTagInput(d.value)}
                    placeholder="Add tag…"
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    style={{ flexGrow: 1 }}
                  />
                  <Button onClick={addTag} appearance="outline" size="small">
                    Add
                  </Button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "8px",
                  }}
                >
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "2px 10px",
                        borderRadius: "999px",
                        background: "#e0e0e0",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 14,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleSave}
              disabled={
                saving ||
                !form.title ||
                !form.description ||
                !form.category ||
                !form.demo_url
              }
            >
              {saving ? "Saving…" : demo ? "Save Changes" : "Add Demo"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
