import { Header } from "@/components/layout/header";
import { CartSheet } from "@/features/cart/components/cart-sheet";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      {children}
      <CartSheet />
    </div>
  );
}