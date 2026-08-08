"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

export interface CartItem {
  product_variant_id: string | null;
  product_id?: string | number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  sku?: string;
}

interface CartState {
  items: CartItem[];
  loaded: boolean;
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | {
      type: "REMOVE_ITEM";
      payload: {
        product_variant_id: string | null;
        size?: string;
        color?: string;
      };
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: {
        product_variant_id: string | null;
        quantity: number;
        size?: string;
        color?: string;
      };
    }
  | { type: "CLEAR_CART" };

const initialState: CartState = {
  items: [],
  loaded: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, items: action.payload, loaded: true };
    case "ADD_ITEM": {
      const newItem = action.payload;
      const existIdx = state.items.findIndex(
        (i) =>
          i.product_variant_id === newItem.product_variant_id &&
          i.size === newItem.size &&
          i.color === newItem.color,
      );
      if (existIdx >= 0) {
        const updated = [...state.items];
        updated[existIdx] = {
          ...updated[existIdx],
          quantity: updated[existIdx].quantity + (newItem.quantity || 1),
        };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...newItem, quantity: newItem.quantity || 1 },
        ],
      };
    }
    case "REMOVE_ITEM": {
      const { product_variant_id, size, color } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.product_variant_id === product_variant_id &&
              i.size === size &&
              i.color === color
            ),
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const { product_variant_id, quantity, size, color } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) =>
              !(
                i.product_variant_id === product_variant_id &&
                i.size === size &&
                i.color === color
              ),
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product_variant_id === product_variant_id &&
          i.size === size &&
          i.color === color
            ? { ...i, quantity }
            : i,
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    product_variant_id: string | null,
    size?: string,
    color?: string,
  ) => void;
  updateQuantity: (
    product_variant_id: string | null,
    quantity: number,
    size?: string,
    color?: string,
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "closet_cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.log("lỗi gì đó khi lưu giỏ hàng");
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    dispatch({ type: "LOAD_CART", payload: getStoredCart() });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveCart(state.items);
    }
  }, [state.items, state.loaded]);

  const contextValue = useMemo<CartContextType>(() => {
    return {
      items: state.items,
      addToCart: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeFromCart: (product_variant_id, size, color) =>
        dispatch({
          type: "REMOVE_ITEM",
          payload: { product_variant_id, size, color },
        }),
      updateQuantity: (product_variant_id, quantity, size, color) =>
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { product_variant_id, quantity, size, color },
        }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      getCartTotal: () =>
        state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [state.items]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
