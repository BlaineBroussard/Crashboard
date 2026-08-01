import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { Business, Product, type productLabor } from "../entities";
import { useEffect, useState, type ChangeEvent } from "react";

interface ProductProps {
  business: Business;
  onItemsChange: (items: Product[]) => void;
}

const createEmptyProduct = () => new Product("", 0, [], [], 0, 0);

export default function AddNewProducts({
  business,
  onItemsChange,
}: ProductProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(
    business.Products,
  );
  const [form, setForm] = useState<Product>(createEmptyProduct());
  const [selectedMaterialNames, setSelectedMaterialNames] = useState<string[]>(
    [],
  );
  const [selectedLaborNames, setSelectedLaborNames] = useState<string[]>([]);
  const [laborQuantities, setLaborQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setLocalProducts(business.Products);
  }, [business.Products]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof Product;

    setForm((prev: any) => {
      const currentValue = prev[fieldName];
      const nextValue =
        typeof currentValue === "number" ? Number(value) : value;

      return { ...prev, [fieldName]: nextValue };
    });
  };

  const handleMaterialChange = (event: SelectChangeEvent<string[]>) => {
    const nextSelection = event.target.value as string[];
    setSelectedMaterialNames(nextSelection);

    const selectedMaterials = business.Materials.filter((material) =>
      nextSelection.includes(material.name),
    );

    setForm((prev: any) => ({
      ...prev,
      material: selectedMaterials,
    }));
  };

  const syncLaborSelections = (
    nextSelection: string[],
    quantityMap: Record<string, number>,
  ) => {
    const nextLaborEntries = nextSelection
      .map((laborName) => {
        const matchingLabor = business.Labors.find(
          (labor) => labor.name === laborName,
        );

        if (!matchingLabor) return null;

        return {
          labor: matchingLabor,
          quantity: quantityMap[laborName] ?? 0,
        } satisfies productLabor;
      })
      .filter(Boolean) as productLabor[];

    setForm((prev: any) => ({
      ...prev,
      labor: nextLaborEntries,
    }));
  };

  const handleLaborChange = (event: SelectChangeEvent<string[]>) => {
    const nextSelection = event.target.value as string[];
    setSelectedLaborNames(nextSelection);
    syncLaborSelections(nextSelection, laborQuantities);
  };

  const handleLaborQuantityChange = (laborName: string, quantity: number) => {
    const updatedQuantities = {
      ...laborQuantities,
      [laborName]: quantity,
    };

    setLaborQuantities(updatedQuantities);
    syncLaborSelections(selectedLaborNames, updatedQuantities);
  };

  const resetForm = () => {
    setForm(createEmptyProduct());
    setSelectedMaterialNames([]);
    setSelectedLaborNames([]);
    setLaborQuantities({});
  };

  const handleAddProduct = () => {
    if (!form.name.trim()) {
      return;
    }

    const nextProducts = [...localProducts, form];
    setLocalProducts(nextProducts);
    onItemsChange(nextProducts);
    resetForm();
  };

  const handleDeleteProduct = (index: number) => {
    const nextProducts = localProducts.filter(
      (_, productIndex) => productIndex !== index,
    );
    setLocalProducts(nextProducts);
    onItemsChange(nextProducts);
  };

  const handleRemoveLabor = (laborName: string) => {
    const nextSelection = selectedLaborNames.filter(
      (name) => name !== laborName,
    );
    setSelectedLaborNames(nextSelection);
    setLaborQuantities((prev) => {
      const { [laborName]: _, ...rest } = prev;
      return rest;
    });
    syncLaborSelections(nextSelection, laborQuantities);
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
      />
      <TextField
        label="Price"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
      />{" "}
      <TextField
        label="Sold Total"
        name="soldTotal"
        type="number"
        value={form.soldTotal}
        onChange={handleChange}
      />
      <TextField
        label="Marketing Acquisition Cost"
        name="marketingAcquisitionCost"
        type="number"
        value={form.marketingAcquisitionCost ?? 0}
        onChange={handleChange}
      />
      <FormControl fullWidth>
        <InputLabel id="product-materials-label">Materials</InputLabel>
        <Select
          labelId="product-materials-label"
          multiple
          value={selectedMaterialNames}
          onChange={handleMaterialChange}
          input={<OutlinedInput label="Materials" />}
          renderValue={(selected) => selected.join(", ")}
        >
          {business.Materials.length === 0 ? (
            <MenuItem disabled value="">
              No materials available
            </MenuItem>
          ) : (
            business.Materials.map((material) => (
              <MenuItem key={material.name} value={material.name}>
                <Checkbox
                  checked={selectedMaterialNames.indexOf(material.name) > -1}
                />
                <ListItemText primary={material.name} />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="product-labor-label">Labor</InputLabel>
        <Select
          labelId="product-labor-label"
          multiple
          value={selectedLaborNames}
          onChange={handleLaborChange}
          input={<OutlinedInput label="Labor" />}
          renderValue={(selected) => selected.join(", ")}
        >
          {business.Labors.length === 0 ? (
            <MenuItem disabled value="">
              No labor available
            </MenuItem>
          ) : (
            business.Labors.map((labor) => (
              <MenuItem key={labor.name} value={labor.name}>
                <Checkbox
                  checked={selectedLaborNames.indexOf(labor.name) > -1}
                />
                <ListItemText
                  primary={`${labor.name} ($${labor.costPerHour}/hr)`}
                />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
      {selectedLaborNames.map((laborName) => (
        <Stack
          key={laborName}
          direction="row"
          spacing={1}
          sx={{ alignItems: "center" }}
        >
          <TextField
            label={`${laborName} quantity`}
            type="number"
            value={laborQuantities[laborName] ?? 0}
            onChange={(event) =>
              handleLaborQuantityChange(laborName, Number(event.target.value))
            }
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleRemoveLabor(laborName)}
          >
            Delete labor
          </Button>
        </Stack>
      ))}
      <Button variant="contained" onClick={handleAddProduct}>
        Add Product
      </Button>
      {localProducts.length > 0 && (
        <ul>
          {localProducts.map((product, index) => (
            <li key={`${product.name}-${index}`}>
              <strong>{product.name}</strong> — ${product.price}
              {product.material.length > 0 && (
                <span>
                  {" "}
                  {product.material.map((material) => material.name).join(", ")}
                </span>
              )}
              {product.labor.length > 0 && (
                <span>
                  {" | Labor: "}
                  {product.labor
                    .map(({ labor, quantity }) => `${labor.name} (${quantity})`)
                    .join(", ")}
                </span>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeleteProduct(index)}
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
