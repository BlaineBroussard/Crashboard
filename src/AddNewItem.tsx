import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState, type ChangeEvent } from "react";

interface AddNewItemProps<T> {
  createEmptyItem: () => T;
  items: T[];
  onItemsChange: (items: T[]) => void;
}

export default function AddNewItems<T extends Record<string, any>>({
  createEmptyItem,
  items,
  onItemsChange,
}: AddNewItemProps<T>) {
  const [localItems, setLocalItems] = useState<T[]>(items);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<T>(createEmptyItem());

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof T;

    setForm((prev) => {
      const currentValue = prev[fieldName];
      const nextValue =
        typeof currentValue === "number" ? Number(value) : value;
      return { ...prev, [fieldName]: nextValue };
    });
  };

  const resetForm = () => {
    setForm(createEmptyItem());
    setEditingIndex(null);
  };

  const handleAddItem = () => {
    const nextItems =
      editingIndex !== null
        ? localItems.map((item, index) =>
            index === editingIndex ? form : item,
          )
        : [...localItems, form];

    setLocalItems(nextItems);
    onItemsChange(nextItems);
    resetForm();
  };

  const handleEditItem = (item: T, index: number) => {
    setForm(item);
    setEditingIndex(index);
  };

  const handleDeleteItem = (index: number) => {
    const nextItems = localItems.filter((_, itemIndex) => itemIndex !== index);
    setLocalItems(nextItems);
    onItemsChange(nextItems);

    if (editingIndex === index) {
      resetForm();
    }
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
        {editingIndex === null ? "Add Item" : "Save Changes"}
      </Button>
      {editingIndex !== null && (
        <Button variant="text" onClick={resetForm}>
          Cancel edit
        </Button>
      )}

      {localItems.length > 0 && (
        <ul>
          {localItems.map((item, index) => (
            <li key={index}>
              {Object.entries(item).map(([key, value]) => (
                <span key={key} style={{ marginRight: "1rem" }}>
                  <strong>{key}:</strong>{" "}
                  {Array.isArray(value)
                    ? value.length
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
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeleteItem(index)}
                sx={{ ml: 1 }}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}
