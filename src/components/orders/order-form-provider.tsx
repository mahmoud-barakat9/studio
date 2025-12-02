
'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

type OrderFormContextType = {
  formActions: React.ReactNode;
  setFormActions: (node: React.ReactNode) => void;
  showFormActions: boolean;
};

const OrderFormContext = createContext<OrderFormContextType | undefined>(undefined);

export function OrderFormProvider({ children }: { children: React.ReactNode }) {
  const [formActions, setFormActions] = useState<React.ReactNode>(null);
  const showFormActions = formActions !== null;

  useEffect(() => {
    // When the provider unmounts (e.g., page navigation), clear the actions
    return () => setFormActions(null);
  }, []);

  const value = useMemo(() => ({ formActions, setFormActions, showFormActions }), [formActions, showFormActions]);

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  );
}

export function useOrderForm() {
  const context = useContext(OrderFormContext);
  if (context === undefined) {
    throw new Error('useOrderForm must be used within an OrderFormProvider');
  }
  return context;
}
