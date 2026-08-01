import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Business, FixedExpense, Labor, Material, Product } from "../entities";
import AddNewItems from "../AddNewItem";
import { useEffect, useState } from "react";
import AddNewProducts from "./Products";

const BUSINESS_STORAGE_KEY = "crashboard-business";

const values = [
  {
    name: "Materials",
    key: "Materials",
    function: () => new Material("", 0, 0),
  },
  {
    name: "Fixed Expenses",
    key: "FixedExpenses",
    function: () => new FixedExpense("", 0, 0),
  },
  {
    name: "Labor",
    key: "Labors",
    function: () => new Labor("", 0, 0),
  },
] as const;

export default function Items() {
  const [business, setBusiness] = useState<Business>(() => {
    try {
      const saved = localStorage.getItem(BUSINESS_STORAGE_KEY);
      if (!saved) {
        return new Business([], [], [], []);
      }

      const parsed = JSON.parse(saved) as Partial<Business>;
      return new Business(
        parsed.Products ?? [],
        parsed.FixedExpenses ?? [],
        parsed.Materials ?? [],
        parsed.Labors ?? [],
      );
    } catch {
      return new Business([], [], [], []);
    }
  });

  useEffect(() => {
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(business));
  }, [business]);

  const updateBusinessItems = (
    key: "Materials" | "FixedExpenses" | "Labors" | "Products",
    nextItems: unknown[],
  ) => {
    setBusiness((current) => {
      const updated = new Business(
        current.Products,
        current.FixedExpenses,
        current.Materials,
        current.Labors,
      );

      if (key === "Materials") {
        updated.Materials = nextItems as Material[];
      }
      if (key === "FixedExpenses") {
        updated.FixedExpenses = nextItems as FixedExpense[];
      }
      if (key === "Labors") {
        updated.Labors = nextItems as Labor[];
      }
      if (key === "Products") {
        updated.Products = nextItems as Product[];
      }

      return updated;
    });
  };

  return (
    <>
      <div>
        {values.map((item, index) => {
          const currentItems =
            item.key === "Materials"
              ? business.Materials
              : item.key === "FixedExpenses"
                ? business.FixedExpenses
                : business.Labors;

          return (
            <>
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography component="span">{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AddNewItems<ReturnType<typeof item.function>>
                    createEmptyItem={item.function}
                    items={currentItems as ReturnType<typeof item.function>[]}
                    onItemsChange={(nextItems) =>
                      updateBusinessItems(item.key, nextItems)
                    }
                  />
                </AccordionDetails>
              </Accordion>
            </>
          );
        })}
      </div>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="span">Products</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddNewProducts
            business={business}
            onItemsChange={(nextItems: any) =>
              updateBusinessItems("Products", nextItems)
            }
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
}
