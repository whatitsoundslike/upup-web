import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

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

        const cardResult = await cardModel.generateContent([
            {
                inlineData: { mimeType, data: base64Data },
            },
            `Transform this animal into an epic fantasy RPG card game character portrait.
Style requirements:
- The animal should be depicted as a powerful, heroic warrior or mage character
- Fantasy RPG art style with dramatic lighting and magical effects
- Include ornate card frame/border design
- Rich colors, detailed armor or magical accessories on the animal
- Epic and powerful atmosphere
- Portrait orientation, centered composition
- The animal's features should still be recognizable
Do NOT include any text or numbers on the card.`,
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
