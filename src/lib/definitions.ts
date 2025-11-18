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
  status: "Pending" | "FactoryOrdered" | "Processing" | "FactoryShipped" | "ReadyForDelivery" | "Delivered" | "Rejected";
  date: string;
  totalArea: number;
  totalCost: number;
  openings: Opening[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
};
