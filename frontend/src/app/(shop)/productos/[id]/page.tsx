import ProductDetail from "@/features/productos/components/product-detail";

export default function ProductPage() {
  // La ruta delega toda la responsabilidad visual y lógica al componente.
  // Como el componente usa 'useParams' del cliente, no necesitamos pasarle el ID desde aquí.
  return <ProductDetail />;
}