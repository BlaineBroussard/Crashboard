import { useState } from "react";

import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  type SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NetProfitGraph from "./NetProfitGraph";
import GrossProfitGraph from "./GrossProfitGraph";
import LaborPayoffGraph from "./LaborPayoff";

const widgetMap = {
  netProfitGraph: () => <NetProfitGraph />,
  grossProfitGraph: () => <GrossProfitGraph />,
  laborPayoffGraph: () => <LaborPayoffGraph />,
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

    setWidgets((current) => {
      const next = [...current, currentWidgetSelection];
      localStorage.setItem("widgets", JSON.stringify(next));
      return next;
    });
    setCurrentWidgetSelection(undefined);
  };
  console.log(currentWidgetSelection);
  return (
    <>
      <Box>
        <Select onChange={handleChange}>
          <MenuItem value="netProfitGraph">Net Profit Graph</MenuItem>
          <MenuItem value="grossProfitGraph">Gross Profit Graph</MenuItem>
          <MenuItem value="laborPayoffGraph">Labor Payoff</MenuItem>
        </Select>
        <Button onClick={addWidget}>Add Widget</Button>
      </Box>
      <Grid container spacing={2}>
        {widgets.map((widget, idx) => {
          const WidgetComponent = widgetMap[widget as keyof typeof widgetMap];
          if (!WidgetComponent) {
            return null;
          }

          const removeWidget = () => {
            setWidgets((current) => {
              const next = current.filter((_, i) => i !== idx);
              localStorage.setItem("widgets", JSON.stringify(next));
              return next;
            });
          };

          return (
            <Grid
              size={{ xs: 12, sm: 12, md: 12, lg: 6 }}
              key={`${widget}-${idx}`}
            >
              <Card>
                <CardHeader
                  action={
                    <IconButton aria-label="remove" onClick={removeWidget}>
                      <CloseIcon />
                    </IconButton>
                  }
                  title={
                    widget === "netProfitGraph"
                      ? "Net Profit"
                      : widget === "laborPayoffGraph"
                        ? "Labor Payoff"
                        : "Revenue"
                  }
                />
                <CardContent>
                  <WidgetComponent />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
