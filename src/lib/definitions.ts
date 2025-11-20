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

export type OrderStatus = "Pending" | "FactoryOrdered" | "Processing" | "FactoryShipped" | "ReadyForDelivery" | "Delivered" | "Rejected";


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
  status: OrderStatus;
  date: string;
  totalArea: number;
  totalCost: number;
  openings: Opening[];
  isArchived: boolean;
  hasDelivery: boolean;
  deliveryCost: number;
  deliveryAddress: string;
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
