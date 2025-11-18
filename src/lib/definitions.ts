export type Opening = {
  serial: string;
  abjourType: "قياسي" | "ضيق" | "عريض" | string;
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
  status: "Pending Approval" | "Order Placed" | "In Production" | "Shipped" | "Completed" | "Rejected";
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
