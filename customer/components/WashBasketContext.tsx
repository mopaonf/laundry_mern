import React, { createContext, useContext, useReducer } from 'react';

export interface CartItem {
   id: string;
   name: string;
   price: number;
   image: any;
   quantity: number;
}

interface State {
   items: CartItem[];
}

type Action =
   | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
   | { type: 'REMOVE_ITEM'; id: string }
   | { type: 'INCREMENT'; id: string }
   | { type: 'DECREMENT'; id: string }
   | { type: 'CLEAR_BASKET' };

const WashBasketContext = createContext<{
   state: State;
   dispatch: React.Dispatch<Action>;
}>({ state: { items: [] }, dispatch: () => {} });

function reducer(state: State, action: Action): State {
   switch (action.type) {
      case 'ADD_ITEM': {
         const existing = state.items.find((i) => i.id === action.item.id);
         if (existing) {
            return {
               items: state.items.map((i) =>
                  i.id === action.item.id
                     ? { ...i, quantity: i.quantity + 1 }
                     : i
               ),
            };
         }
         return {
            items: [...state.items, { ...action.item, quantity: 1 }],
         };
      }
      case 'REMOVE_ITEM':
         return { items: state.items.filter((i) => i.id !== action.id) };
      case 'INCREMENT':
         return {
            items: state.items.map((i) =>
               i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
         };
      case 'DECREMENT':
         return {
            items: state.items
               .map((i) =>
                  i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
               )
               .filter((i) => i.quantity > 0),
         };
      case 'CLEAR_BASKET':
         return {
            items: [],
         };
      default:
         return state;
   }
}

export const WashBasketProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [state, dispatch] = useReducer(reducer, { items: [] });
   return (
      <WashBasketContext.Provider value={{ state, dispatch }}>
         {children}
      </WashBasketContext.Provider>
   );
};

export function useWashBasket() {
   return useContext(WashBasketContext);
}
