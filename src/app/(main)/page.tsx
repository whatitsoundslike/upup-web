import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { defaultNavItems, navRoomLogo, navRoomDescription } from '@/config/navConfig';

export const metadata: Metadata = {
  title: 'ZROOM - 취미 기반 커뮤니티 플랫폼',
  description: '테슬라, 육아, 반려동물 RPG, AI, 데스크테리어 등 다양한 취미 커뮤니티를 만나보세요.',
  openGraph: {
    title: 'ZROOM - 취미 기반 커뮤니티 플랫폼',
    description: '테슬라, 육아, 반려동물 RPG, AI, 데스크테리어 등 다양한 취미 커뮤니티를 만나보세요.',
    url: 'https://zroom.io',
    siteName: 'ZROOM',
    locale: 'ko_KR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zroom.io',
  },
};

export default function Home() {
  const categories = defaultNavItems.map((item) => {
    const key = item.href.replace('/', '');
    return {
      ...item,
      logo: navRoomLogo[key],
      description: navRoomDescription[key],
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ZROOM
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            관심사 기반 커뮤니티 플랫폼
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4 relative">
                  {category.logo ? (
                    <Image
                      src={category.logo}
                      alt={category.name}
                      fill
                      className="object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <category.icon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
