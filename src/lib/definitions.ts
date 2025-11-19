export type Opening = {
  serial: string;
  abjourType: "قياسي" | "ضيق" | "عريض" | string;
  width?: number;
  height?: number;
  codeLength: number;
  numberOfCodes: number;
  hasEndCap: boolean;
  hasAccessories: boolean;
  notes?: string;
};

export type Order = {
  id: string;
  userId: string;
  orderName: string;
  customerName: string;
  customerPhone: string;
  mainAbjourType: string;
  mainColor: string;
  bladeWidth: number;
  pricePerSquareMeter: number;
  status: "Pending" | "FactoryOrdered" | "Processing" | "FactoryShipped" | "ReadyForDelivery" | "Delivered" | "Rejected";
  date: string;
  totalArea: number;
  totalCost: number;
  openings: Opening[];
  isArchived: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
};


export type AbjourTypeData = {
  name: string;
  bladeWidth: number; // in cm
  pricePerSquareMeter: number;
  colors: string[];
};
