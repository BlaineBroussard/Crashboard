import { useState } from "react";
import { Business } from "../entities";
const BUSINESS_STORAGE_KEY = "crashboard-business";

export default function NetProfitGraph() {
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

  return <div>Net Profit Graph</div>;
}
