export type Opening = {
  serial: string;
  abjourType: "Standard" | "Narrow" | "Wide" | string;
  color: string;
  codeLength: number;
  numberOfCodes: number;
  width?: number;
  height?: number;
  hasEndCap: boolean;
  hasAccessories: boolean;
};

export type Order = {
  id: string;
  userId: string;
  orderName: string;
  customerName: string;
  customerPhone: string;
  status: "Order Placed" | "In Production" | "Shipped" | "Completed";
  date: string;
  totalArea: number;
  totalCost: number;
  openings: Opening[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};
