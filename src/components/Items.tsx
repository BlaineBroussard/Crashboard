import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FixedExpense, Labor, Material, Product } from "../entities";
import AddNewItems from "../AddNewItem";

const values = [
  {
    name: "Materials",
    function: () => new Material("", 0, 0),
  },

  {
    name: "Fixed Expenses",
    function: () => new FixedExpense("", 0, 0),
  },

  {
    name: "Labor",
    function: () => new Labor("", 0, 0),
  },
];

export default function Items() {
  return (
    <div>
      {values.map((item, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography component="span">{item.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AddNewItems<ReturnType<typeof item.function>>
              createEmptyItem={item.function}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
