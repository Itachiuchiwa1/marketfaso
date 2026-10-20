export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-BF", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0
  }).format(amount || 0).replace("XOF", "FCFA");
}
