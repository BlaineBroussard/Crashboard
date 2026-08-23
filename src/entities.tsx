export interface labor {
  name: string;
  costPerHour: number;
  maximumHours: number;
}

export class Labor {
  name: string;
  costPerHour: number;
  maximumHours: number;

  constructor(name: string, costPerHour: number, maximumHours: number) {
    this.name = name;
    this.costPerHour = costPerHour;
    this.maximumHours = maximumHours;
  }

  getLaborCost(): number {
    return this.costPerHour * this.maximumHours;
  }

  getValues(): labor {
    return {
      name: this.name,
      costPerHour: this.costPerHour,
      maximumHours: this.maximumHours,
    };
  }
}

export interface material {
  name: string;
  cost: number;
  unit: number;
}

export class Material implements material {
  name: string;
  cost: number;
  unit: number;

  constructor(name: string, cost: number, unit: number) {
    this.name = name;
    this.cost = cost;
    this.unit = unit;
  }

  // Returns all the material data as a plain object matching the interface
  getValues(): material {
    return {
      name: this.name,
      cost: this.cost,
      unit: this.unit,
    };
  }

  getCostPerUnit(): number {
    if (this.unit === 0) return 0;
    return this.cost / this.unit;
  }
}

export interface fixedExpense {
  name: string;
  costPerMonth: number;
}
export class FixedExpense {
  name: string;
  costPerMonth: number;

  constructor(name: string, costPerMonth: number, _maximumHours?: number) {
    this.name = name;
    this.costPerMonth = costPerMonth;
  }

  getValues(): fixedExpense {
    return {
      name: this.name,
      costPerMonth: this.costPerMonth,
    };
  }
}

export interface Labor {
  costPerHour: number;
  role?: string;
}

export interface productLabor {
  labor: Labor;
  quantity: number;
}

export interface product {
  name: string;
  price: number;
  material: material[];
  labor: productLabor[];
  soldTotal: number;
  marketingAcquisitionCost?: number;
}

export class Product implements product {
  name: string;
  price: number;
  material: Material[];
  labor: productLabor[];
  soldTotal: number;
  marketingAcquisitionCost?: number;

  constructor(
    name: string,
    price: number,
    material: Material[],
    labor: productLabor[],
    soldTotal: number,
    marketingAcquisitionCost?: number,
  ) {
    this.name = name;
    this.price = price;
    this.material = material;
    this.labor = labor;
    this.soldTotal = soldTotal;
    this.marketingAcquisitionCost = marketingAcquisitionCost;
  }

  getValues(): product {
    return {
      name: this.name,
      price: this.price,
      material: this.material,
      labor: this.labor,
      soldTotal: this.soldTotal,
      marketingAcquisitionCost: this.marketingAcquisitionCost,
    };
  }

  sumMaterialsCost = (materials: Material[]): number => {
    let total = 0;
    materials.forEach((material) => {
      total = total + material.cost * material.unit;
    });
    return total;
  };

  sumLaborCost = (laborEntries: productLabor[]): number => {
    return laborEntries.reduce((total, entry) => {
      return total + entry.labor.costPerHour * entry.quantity;
    }, 0);
  };

  getGrossProfit(): number {
    return (
      this.price -
      (this.sumLaborCost(this.labor) + this.sumMaterialsCost(this.material)) -
      (this.marketingAcquisitionCost ?? 0)
    );
  }

  getGrossProfitPercentage(): number {
    if (this.price === 0) return 0;
    return (this.getGrossProfit() / this.price) * 100;
  }
}

interface Ibusiness {
  Products: Product[];
  FixedExpenses: FixedExpense[];
  Materials: Material[];
  Labors: Labor[];
}

export class Business implements Ibusiness {
  Products: Product[];
  FixedExpenses: FixedExpense[];
  Materials: Material[];
  Labors: Labor[];

  constructor(
    Products: Product[],
    FixedExpenses: FixedExpense[],
    Materials: Material[],
    Labors: Labor[],
  ) {
    this.Products = Products;
    this.FixedExpenses = FixedExpenses;
    this.Materials = Materials;
    this.Labors = Labors;
  }

  getValues(): Ibusiness {
    return {
      Products: this.Products,
      FixedExpenses: this.FixedExpenses,
      Materials: this.Materials,
      Labors: this.Labors,
    };
  }

  sumFixedExpenses = (expenses: FixedExpense[]): number => {
    let total = 0;
    expenses.forEach((expense) => {
      total = total + expense.costPerMonth;
    });
    return total;
  };

  sumGrossProfit = (products: Product[]): number => {
    return products.reduce(
      (totalProfit, product) => totalProfit + product.getGrossProfit(),
      0,
    );
  };

  averageGrossProfit = (products: Product[]): number => {
    if (!products || products.length === 0) return 0;
    const total = this.sumGrossProfit(products);
    return total / products.length;
  };

  // Total labor hours across all provided products (per-unit hours summed)
  sumLaborHours = (products: Product[]): number => {
    return products.reduce((totalHours, product) => {
      const productHours = product.labor.reduce((h, entry) => h + (entry.quantity ?? 0), 0);
      return totalHours + productHours;
    }, 0);
  };

  // Average gross profit per one hour of labor across all products.
  // Computes total gross profit (per-unit) divided by total labor hours (per-unit).
  averageGrossProfitPerHour = (products: Product[]): number => {
    const totalHours = this.sumLaborHours(products);
    if (totalHours === 0) return 0;
    const totalGross = this.sumGrossProfit(products);
    return totalGross / totalHours;
  };

  calculateNetProfit = (products: Product[], fixedExpenses: FixedExpense[]) => {
    return this.sumGrossProfit(products) - this.sumFixedExpenses(fixedExpenses);
  };
}
