import SharedShopPage from '@/components/SharedShopPage';

// Toy products - 실제로는 데이터베이스나 API에서 가져와야 합니다
const toyProducts = [
    {
        id: 1,
        thumb: 'https://via.placeholder.com/400',
        name: '레고 테크닉 슈퍼카',
        price: '89,000',
        link: '#',
        category: 'Building',
        rating: 4.8,
    },
    {
        id: 2,
        thumb: 'https://via.placeholder.com/400',
        name: '드론 레이싱 세트',
        price: '125,000',
        link: '#',
        category: 'RC',
        rating: 4.5,
    },
    // 더 많은 제품 추가 가능
];

export default function ToyShopPage() {
    return <SharedShopPage category="toy" products={toyProducts} />;
}
