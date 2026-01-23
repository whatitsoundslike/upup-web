import SharedShopPage from '@/components/SharedShopPage';
import products from './cp_products.json';

export default function TeslaShopPage() {
    return <SharedShopPage category="tesla" products={products} />;
}
