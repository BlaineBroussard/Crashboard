import { Button, Stack, TextField } from "@mui/material";
import { useState, type ChangeEvent } from "react";
import { Material } from "./entities";

interface AddNewItemProps<T> {
  createEmptyItem: () => T;
}
export default function AddNewItems<T extends Record<string, any>>({
  createEmptyItem,
}: AddNewItemProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<T>(createEmptyItem());

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(createEmptyItem());
    setEditingIndex(null);
  };

  const handleAddItem = () => {
    if (editingIndex !== null) {
      setItems((current) =>
        current.map((item, index) => (index === editingIndex ? form : item)),
      );
    } else {
      setItems((current) => [...current, form]);
    }

    resetForm();
  };

  const handleEditItem = (item: T, index: number) => {
    setForm(item);
    setEditingIndex(index);
  };

  return (
    <Stack spacing={2}>
      {Object.entries(form).map(([key, value]) => (
        <TextField
          key={key}
          label={key}
          name={key}
          value={value as any}
          onChange={handleChange}
        />
      ))}

      <Button variant="contained" onClick={handleAddItem}>
        {editingIndex === null ? "Add Material" : "Save Changes"}
      </Button>
      {editingIndex !== null && (
        <Button variant="text" onClick={resetForm}>
          Cancel edit
        </Button>
      )}

      {items.length > 0 && (
        <ul>
          {items.map((item, index) => (
            <li>
              {Object.entries(item).map(([key, value]) => (
                <span key={key} style={{ marginRight: "1rem" }}>
                  <strong>{key}:</strong>{" "}
                  {Array.isArray(value)
                    ? value.length //
                    : typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                </span>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleEditItem(item, index)}
                sx={{ ml: 1 }}
              >
                Edit
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}
