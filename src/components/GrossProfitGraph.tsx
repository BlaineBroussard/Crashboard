import { useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Business, Product } from "../entities";
import { LineChart } from "@mui/x-charts/LineChart";

const BUSINESS_STORAGE_KEY = "crashboard-business";

export default function GrossProfitGraph() {
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
      return new Business(
        products,
        parsed.FixedExpenses ?? [],
        parsed.Materials ?? [],
        parsed.Labors ?? [],
      );
    } catch {
      return new Business([], [], [], []);
    }
  });

  // Compute chart data: 10 fixed-expense intervals (0..max) and net profit at each
  const { xLabels, yValues } = useMemo(() => {
    const intervals = 10;
    const quantityProductsTotal = business.Products.reduce(
      (sum, product) => sum + product.soldTotal,
      0,
    );
    const totalGrossProfit = business.sumGrossProfit(business.Products);

    // If there are no fixed expenses recorded, choose a reasonable max for the x-axis
    const maxFixed =
      quantityProductsTotal > 0
        ? quantityProductsTotal
        : Math.max(100, Math.ceil(Math.abs(totalGrossProfit) * 1.2));

    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < intervals; i++) {
      const t = i / (intervals - 1); // 0..1 inclusive
      const fixedValue = parseFloat((t * maxFixed).toFixed(2));
      x.push(fixedValue);
      // Net profit at this fixed expense = total gross profit - fixed expense
      y.push(parseFloat((totalGrossProfit - fixedValue).toFixed(2)));
    }

    const labels = x.map((n) =>
      n.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    );
    return { xLabels: labels, yValues: y };
  }, [business]);

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Box sx={{ width: "100%", height: 320 }}>
        <Typography sx={{ mb: 1 }}>
          Gross profit vs Quantity Products
        </Typography>
        <LineChart
          height={240}
          margin={{ bottom: 40 }}
          series={[
            { data: yValues, label: "Gross Profit", yAxisId: "leftAxisId" },
          ]}
          xAxis={[
            {
              scaleType: "point",
              data: xLabels,
              label: "Quantity Products",
            },
          ]}
          yAxis={[{ id: "leftAxisId", width: 60 }]}
        />
      </Box>
    </Paper>
  );
}
