import { useMemo, useState } from "react";
import { Business, Product, Labor } from "../entities";
import { MenuItem, Select, Box, Paper, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
const BUSINESS_STORAGE_KEY = "crashboard-business";

export default function LaborPayoffGraph() {
  const [laborer, setLaborer] = useState<string | undefined>(undefined);
  const [breakEvenPoint, setBreakEvenPoint] = useState<number | undefined>(
    undefined,
  );
  const [business] = useState<Business>(() => {
    try {
      const saved = localStorage.getItem(BUSINESS_STORAGE_KEY);
      if (!saved) {
        return new Business([], [], [], []);
      }

      const parsed = JSON.parse(saved) as Partial<Business>;
      const products = (parsed.Products ?? []).map(
        (p: any) =>
          new Product(
            p.name,
            p.price,
            p.material ?? [],
            p.labor ?? [],
            p.soldTotal ?? 0,
            p.marketingAcquisitionCost,
          ),
      );
      const labors = (parsed.Labors ?? []).map(
        (l: any) =>
          new Labor(l.name ?? "", l.costPerHour ?? 0, l.maximumHours ?? 0),
      );
      return new Business(
        products,
        parsed.FixedExpenses ?? [],
        parsed.Materials ?? [],
        labors,
      );
    } catch {
      return new Business([], [], [], []);
    }
  });
  console.log(business.Labors);
  const handleLaborChange = (laborName: string) => {
    setLaborer(laborName);
    const labor = business.Labors.find((labor) => labor.name === laborName);
    const avgPerHour = business.averageGrossProfitPerHour(business.Products);
    const costOfLaborer = labor?.getLaborCost() ?? 0;
    const be = avgPerHour > 0 ? costOfLaborer / avgPerHour : undefined;
    setBreakEvenPoint(be);
  };

  const avgPerHour = useMemo(
    () => business.averageGrossProfitPerHour(business.Products),
    [business],
  );

  const selectedLaborObj = useMemo(() => {
    return laborer
      ? business.Labors.find((l) => l.name === laborer)
      : business.Labors[0];
  }, [business, laborer]);

  const { hours, grossValues, costLine } = useMemo(() => {
    const maxHours = selectedLaborObj
      ? Math.max(40, Math.ceil(selectedLaborObj.maximumHours))
      : 40;
    const step = 1;
    const hrs: number[] = [];
    const gross: number[] = [];
    const cost: number[] = [];
    const laborCost = selectedLaborObj ? selectedLaborObj.getLaborCost() : 0;
    for (let h = 0; h <= maxHours; h += step) {
      hrs.push(h);
      gross.push(parseFloat((h * avgPerHour).toFixed(2)));
      cost.push(parseFloat(laborCost.toFixed(2)));
    }
    return { hours: hrs, grossValues: gross, costLine: cost };
  }, [selectedLaborObj, avgPerHour]);
  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Typography variant="h6">Labor Payoff</Typography>
      <Box sx={{ my: 1 }}>
        <Select
          value={laborer ?? ""}
          onChange={(e: any) => handleLaborChange(e.target.value)}
          size="small"
        >
          <MenuItem value="">(select labor)</MenuItem>
          {business.Labors.map((labor) => (
            <MenuItem key={labor.name} value={labor.name}>
              {labor.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ width: "100%", height: 300 }}>
        <LineChart
          series={[
            {
              data: grossValues,
              label: "Gross = hours * avgGross/hour",
              yAxisId: "left",
            },
            { data: costLine, label: "Labor cost (flat)", yAxisId: "left" },
          ]}
          xAxis={[
            {
              scaleType: "linear",
              data: hours,
              height: 40,
              label: "Hours worked",
            },
          ]}
          yAxis={[{ id: "left", width: 70 }]}
        />
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography>
          Average gross profit / hour: {avgPerHour.toFixed(2)}
        </Typography>
        {breakEvenPoint !== undefined ? (
          <Typography>Break-even hours: {breakEvenPoint.toFixed(2)}</Typography>
        ) : (
          <Typography>Break-even hours: N/A (avgGross/hour is zero)</Typography>
        )}
      </Box>
    </Paper>
  );
}
