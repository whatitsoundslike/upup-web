import type { Character } from '../types';

interface ShareOptions {
    character: Character;
    lang: 'ko' | 'en';
}

export function shareToTwitter({ character, lang }: ShareOptions): void {
    const tweetText = lang === 'ko'
        ? `🐾 내 슈퍼펫 「${character.name}」을(를) 소개합니다!\nLv.${character.level} ${character.className} | ${character.element}\n#SuperPet #슈퍼펫`
        : `🐾 Meet my Super Pet "${character.name}"!\nLv.${character.level} ${character.className} | ${character.element}\n#SuperPet`;

    // 공유 페이지 URL (메타태그에 캐릭터 이미지 썸네일 포함)
    const shareUrl = `https://zroom.io/superpet/share/${character.id}`;

    window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer'
    );
}
