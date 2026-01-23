import Shop from '@/components/Shop';
import products from './cp_products.json';

export default function TeslaShopPage() {
    return <Shop category="tesla" products={products} />;
}
