import { useState } from "react";
import { Business } from "../entities";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import NetProfitGraph from "./NetProfitGraph";

const widgetMap = {
  netProfitGraph: () => <NetProfitGraph />,
  laborPayoffGraph: () => <div>Test</div>,
  revenueGraph: () => <div>Test</div>,
};

export default function Widgets() {
  const [widgets, setWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem("widgets");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => typeof v === "string") as string[];
      }
    } catch (e) {}

    return [];
  });
  const [currentWidgetSelection, setCurrentWidgetSelection] = useState<
    string | undefined
  >();

  const handleChange = (event: SelectChangeEvent) => {
    setCurrentWidgetSelection(event.target.value);
  };
  const addWidget = () => {
    if (!currentWidgetSelection) {
      return;
    }

    setWidgets((current) => [...current, currentWidgetSelection]);
    localStorage.setItem("widgets", JSON.stringify(widgets));
  };
  console.log(currentWidgetSelection);
  return (
    <>
      <Box>
        <Select onChange={handleChange}>
          <MenuItem value="netProfitGraph">Net Profit Graph</MenuItem>
          <MenuItem value="laborPayoffGraph">Labor Payoff Graph</MenuItem>
          <MenuItem value="revenueGraph">Gross Revenue Graph</MenuItem>
        </Select>
        <Button onClick={addWidget}>Add Widget</Button>
      </Box>
      <Grid container>
        {widgets.map((widget) => {
          const WidgetComponent = widgetMap[widget as keyof typeof widgetMap];
          if (!WidgetComponent) {
            return null;
          }

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={widget}>
              <WidgetComponent />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
