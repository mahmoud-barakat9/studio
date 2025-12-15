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

export type OrderStatus = "Pending" | "Approved" | "FactoryOrdered" | "Processing" | "FactoryShipped" | "ReadyForDelivery" | "Delivered" | "Rejected";


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
  overriddenPricePerSquareMeter?: number;
  status: OrderStatus;
  date: string;
  scheduledDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalArea: number;
  totalCost: number;
  openings: Opening[];
  isArchived: boolean;
  hasDelivery: boolean;
  deliveryCost: number;
  deliveryAddress: string;
  delayed?: boolean;
  rating?: number;
  review?: string;
  isEditRequested?: boolean;
  editRequestNotes?: string;
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
  stock: number; // in square meters
};

export type Purchase = {
  id: string;
  materialName: string;
  color: string;
  supplierName: string;
  quantity: number; // in square meters
  purchasePricePerMeter: number;
  date: string;
};

export type Supplier = {
  id: string;
  name: string;
};


export type NotificationType = 'order_approved' | 'order_rejected' | 'order_status_update' | 'order_price_updated' | 'order_edited';

export type Notification = {
  id: string;
  userId: string;
  orderId: string;
  message: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
};
