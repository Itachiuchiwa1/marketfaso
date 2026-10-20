export interface CartItem {
  produitId: string;
  nom: string;
  prix: number;
  photoUrl: string;
  vendeurId: string;
  nomBoutique: string;
  quantite: number;
}

const CART_STORAGE_KEY = "marketfaso_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("marketfaso_cart_updated"));
  } catch (e) {
    console.error("Cart save error", e);
  }
}

export function addToCart(item: Omit<CartItem, "quantite">, quantite: number = 1): void {
  const current = getCart();
  const existingIndex = current.findIndex(i => i.produitId === item.produitId);
  if (existingIndex > -1) {
    current[existingIndex].quantite += quantite;
  } else {
    current.push({ ...item, quantite });
  }
  saveCart(current);
}

export function updateCartQuantity(produitId: string, quantite: number): void {
  let current = getCart();
  if (quantite <= 0) {
    current = current.filter(i => i.produitId !== produitId);
  } else {
    const target = current.find(i => i.produitId === produitId);
    if (target) target.quantite = quantite;
  }
  saveCart(current);
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event("marketfaso_cart_updated"));
}

export { formatFCFA } from "./utils";
