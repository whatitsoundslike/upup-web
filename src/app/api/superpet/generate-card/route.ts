import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { image, name, className, element, style } = await request.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: '이미지가 없습니다' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'API 키가 설정되지 않았습니다' },
                { status: 500 }
            );
        }

        // base64 data URL에서 순수 base64 데이터 추출
        const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
            return NextResponse.json(
                { success: false, error: '유효하지 않은 이미지 형식입니다' },
                { status: 400 }
            );
        }

        const mimeType = `image/${base64Match[1]}` as
            | 'image/png'
            | 'image/jpeg'
            | 'image/webp'
            | 'image/gif';
        const base64Data = base64Match[2];

        // Step 1: 동물 사진 검증
        const validationModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const validationResult = await validationModel.generateContent([
            {
                inlineData: { mimeType, data: base64Data },
            },
            'Is this a photo of an animal (pet, dog, cat, bird, hamster, fish, reptile, etc.)? Answer ONLY "yes" or "no".',
        ]);

        const validationText = validationResult.response.text().trim().toLowerCase();
        if (!validationText.includes('yes')) {
            return NextResponse.json(
                { success: false, error: '동물 사진이 아닙니다' },
                { status: 400 }
            );
        }

        // Step 2: 카드 이미지 생성
        const cardModel = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
            generationConfig: {
                // @ts-expect-error - responseModalities is supported but not yet in types
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        // 직업 한→영 매핑
        const classMap: Record<string, string> = { '워리어': 'Berserker', '팔라딘': 'Paladin', '어쌔신': 'Assassin' };
        const classEn = classMap[className] || 'Warrior';

        // 원소 한→영 매핑
        const elementMap: Record<string, string> = { '불': 'Fire', '물': 'Water', '풍': 'Wind', '땅': 'Earth' };
        const elementEn = elementMap[element] || 'Fire';

        const isCute = style === 'cute';
        const stylePrompt = isCute
            ? `Style requirements:
- Cute, adorable chibi/kawaii cartoon style with soft pastel colors
- The animal should be depicted as an adorable, round, and charming ${classEn} character
- Big expressive eyes, small body, oversized head proportions (chibi style)
- Soft shading, rounded shapes, and a warm friendly atmosphere
- The card must reflect the ${elementEn} element theme with cute effects (${elementEn === 'Fire' ? 'tiny cute flames, warm pastel red/orange tones' : elementEn === 'Water' ? 'cute water bubbles, soft blue tones, sparkly ice' : elementEn === 'Wind' ? 'gentle leaf swirls, soft green/mint aura' : 'cute pebbles, warm brown/cream tones'})
- ${classEn === 'Berserker' ? 'Tiny adorable armor, oversized cute weapon' : classEn === 'Paladin' ? 'Mini holy knight outfit, small round shield, soft golden glow' : 'Cute dark hoodie, tiny daggers, playful shadow effects'}
- Cartoon/anime card game art style with soft lighting`
            : `Style requirements:
- The animal should be depicted as a powerful, heroic ${classEn} character
- The card must reflect the ${elementEn} element theme (${elementEn === 'Fire' ? 'flames, warm red/orange tones' : elementEn === 'Water' ? 'water, cool blue tones, ice crystals' : elementEn === 'Wind' ? 'wind swirls, green/cyan aura' : 'earth, rocks, brown/amber tones'})
- ${classEn === 'Berserker' ? 'Heavy armor, massive weapon, aggressive battle stance' : classEn === 'Paladin' ? 'Holy knight armor, shield, divine golden light aura' : 'Dark leather outfit, daggers/claws, stealthy shadow effects'}
- Fantasy RPG art style with dramatic lighting and magical effects
- Rich colors, detailed armor or magical accessories on the animal
- Epic and powerful atmosphere`;

        const cardResult = await cardModel.generateContent([
            {
                inlineData: { mimeType, data: base64Data },
            },
            `
Transform this animal into a fantasy RPG card game character portrait.
Character info:
- Name: "${name || 'Hero'}"
- Class: ${classEn}
- Element: ${elementEn}
${stylePrompt}
- Include ornate card frame/border design
- It must maintain a human-like bipedal form (standing on two legs)
- Portrait orientation, centered composition
- Fix the aspect ratio to 9:16
- Set the resolution to 171 px wide and 304 px high.
- The animal's features should still be recognizable
- Add the text 'SSR' to the top-right corner of the card, and add five stars in the bottom-middle of the card.
- Write the name "${name || 'Hero'}" at the bottom of the card.
- Please fill it so there are no gaps along the border.
Do not include any other text or numbers.
Important: If the input is not an animal photo, return a failure response.`,
        ]);

        // 응답에서 이미지 파트 추출
        const parts = cardResult.response.candidates?.[0]?.content?.parts;
        if (!parts) {
            return NextResponse.json(
                { success: false, error: '카드 생성에 실패했습니다' },
                { status: 500 }
            );
        }

        const imagePart = parts.find(
            (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData?.mimeType?.startsWith('image/')
        );

        if (!imagePart?.inlineData) {
            return NextResponse.json(
                { success: false, error: '카드 생성에 실패했습니다' },
                { status: 500 }
            );
        }

        const cardImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

        return NextResponse.json({ success: true, cardImage });
    } catch (error) {
        console.error('Card generation error:', error);
        return NextResponse.json(
            { success: false, error: '카드 생성 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
