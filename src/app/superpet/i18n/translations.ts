// 한국어 → 영어 매핑 테이블
// t() 함수에서 현재 언어가 'en'일 때 이 테이블을 사용하여 영어 텍스트를 반환합니다.

export const koToEn: Record<string, string> = {
    // === 네비게이션 ===
    '홈': 'Home',
    '던전': 'Dungeon',
    '상점': 'Shop',
    '룸': 'Room',

    // === 공통 UI ===
    '취소': 'Cancel',
    '삭제': 'Delete',
    '닫기': 'Close',
    '구매': 'Buy',
    '판매': 'Sell',
    '골드': 'Gold',
    '젬': 'Gem',
    '공격': 'ATK',
    '방어': 'DEF',
    '속도': 'SPD',
    '장착중': 'Equipped',

    // === SuperpetHome ===
    '본 게임은 베타서비스 중입니다.': 'This game is currently in beta.',
    '캐릭터 생성': 'Create Character',
    '펫 이름': 'Pet Name',
    '반려동물 이름을 입력하세요': 'Enter your pet\'s name',
    '종류': 'Type',
    '특성 선택': 'Select Traits',
    '새 캐릭터 만들기': 'Create New Character',
    '선택됨': 'Selected',
    '선택': 'Select',
    '캐릭터 삭제': 'Delete Character',
    '정말로 이 캐릭터를 삭제하시겠습니까?': 'Are you sure you want to delete this character?',
    '이 작업은 되돌릴 수 없습니다.': 'This action cannot be undone.',
    '모험 시작하기': 'Start Adventure',

    // === 캐릭터 생성 결과 ===
    '정말 멋진 모험가가 탄생했어!': 'A great adventurer has been born!',

    // === 펫 종류 ===
    '강아지': 'Dog',
    '고양이': 'Cat',
    '새': 'Bird',
    '기타': 'Other',

    // === 펫 특성 ===
    '용감한': 'Brave',
    '호기심 많은': 'Curious',
    '장난꾸러기': 'Mischievous',
    '충성스러운': 'Loyal',
    '독립적인': 'Independent',
    '활발한': 'Energetic',
    '느긋한': 'Easygoing',
    '다정한': 'Affectionate',
    '영리한': 'Clever',
    '겁쟁이': 'Timid',
    '먹보': 'Glutton',
    '고집쟁이': 'Stubborn',
    '수줍은': 'Shy',

    // === 직업 ===
    '버서커': 'Berserker',
    '팔라딘': 'Paladin',
    '어쌔신': 'Assassin',

    // === 속성 ===
    '불': 'Fire',
    '물': 'Water',
    '풍': 'Wind',
    '땅': 'Earth',

    // === 희귀도 ===
    '일반': 'Common',
    '고급': 'Rare',
    '희귀': 'Epic',
    '에픽': 'Legendary',
    '전설': 'Mythic',

    // === 장비 부위 ===
    '투구': 'Helmet',
    '갑옷': 'Armor',
    '장갑': 'Gloves',
    '부츠': 'Boots',
    '망토': 'Cloak',
    '무기': 'Weapon',
    '방패': 'Shield',
    '목걸이': 'Necklace',
    '반지': 'Ring',

    // === 아이템 이름 ===
    '회복 포션': 'Health Potion',
    '강화 사료': 'Enhanced Feed',
    '마법 간식': 'Magic Snack',
    '전설의 요리': 'Legendary Feast',
    '별빛 갑옷': 'Starlight Armor',
    '전설의 목걸이': 'Legendary Necklace',
    '철제 투구': 'Iron Helmet',
    '기사의 투구': 'Knight Helmet',
    '가죽 갑옷': 'Leather Armor',
    '드래곤 갑옷': 'Dragon Armor',
    '천 장갑': 'Cloth Gloves',
    '힘의 장갑': 'Power Gloves',
    '러닝화': 'Running Shoes',
    '바람의 부츠': 'Wind Boots',
    '간단한 망토': 'Simple Cloak',
    '그림자 망토': 'Shadow Cloak',
    '나무 검': 'Wooden Sword',
    '화염의 검': 'Flame Sword',
    '나무 방패': 'Wooden Shield',
    '성스러운 방패': 'Holy Shield',

    // === 아이템 설명 ===
    '체력을 회복시켜주는 기본 포션.': 'A basic potion that restores health.',
    '영양이 풍부한 특제 사료. 체력을 회복한다.': 'Nutrient-rich special feed. Restores health.',
    '마법이 깃든 특별한 간식. 먹으면 체력이 회복된다.': 'A magical snack. Restores health when eaten.',
    '전설의 요리사가 만든 최고급 요리. 엄청난 체력을 회복한다.': 'A top-tier dish by a legendary chef. Restores massive health.',
    '별의 축복을 받은 갑옷. 튼튼하면서도 가볍다.': 'Armor blessed by the stars. Sturdy yet light.',
    '드래곤의 비늘로 만든 전설적인 목걸이.': 'A legendary necklace made of dragon scales.',
    '기본적인 철제 투구. 머리를 보호한다.': 'A basic iron helmet. Protects the head.',
    '용맹한 기사가 착용하던 투구.': 'A helmet once worn by a valiant knight.',
    '가벼운 가죽으로 만든 갑옷.': 'Armor made of lightweight leather.',
    '드래곤의 비늘로 만든 최강의 갑옷.': 'The mightiest armor made of dragon scales.',
    '부드러운 천으로 만든 장갑.': 'Gloves made of soft cloth.',
    '착용자의 힘을 증폭시키는 마법 장갑.': 'Magic gloves that amplify the wearer\'s strength.',
    '가볍고 빠른 신발.': 'Light and fast shoes.',
    '바람의 정령이 깃든 부츠. 발걸음이 가벼워진다.': 'Boots infused with wind spirits. Makes footsteps lighter.',
    '평범한 천으로 만든 망토.': 'A cloak made of ordinary cloth.',
    '어둠 속에서 빛나는 신비한 망토.': 'A mysterious cloak that glows in the dark.',
    '훈련용 나무 검.': 'A wooden sword for training.',
    '불꽃이 타오르는 전설의 검.': 'A legendary sword blazing with flames.',
    '기본적인 나무 방패.': 'A basic wooden shield.',
    '신성한 힘이 깃든 방패.': 'A shield imbued with holy power.',

    // === 던전 이름 ===
    '한강': 'Han River',
    '관악산': 'Gwanak Mt.',
    '지리산': 'Jiri Mt.',
    '한라산': 'Halla Mt.',

    // === 던전 설명 ===
    '도심 속 평화로운 강변. 초보 모험가들이 처음 발걸음을 내딛는 곳': 'A peaceful riverside in the city. Where beginner adventurers take their first steps.',
    '서울의 진산. 울창한 숲과 험준한 바위가 모험가를 시험한다': 'Seoul\'s guardian mountain. Dense forests and rugged rocks test adventurers.',
    '영남의 명산. 깊은 계곡과 높은 봉우리에 강력한 존재들이 깃들어 있다': 'A famous mountain. Powerful beings dwell in deep valleys and high peaks.',
    '제주의 영봉. 신비로운 기운이 감도는 이곳엔 전설의 존재들이 살고 있다': 'The sacred peak of Jeju. Legendary beings inhabit this mystical place.',

    // === 몬스터 이름 ===
    '떠돌이 비둘기': 'Wandering Pigeon',
    '길고양이': 'Stray Cat',
    '한강 괴물': 'Han River Monster',
    '산토끼': 'Mountain Rabbit',
    '멧돼지': 'Wild Boar',
    '산신령': 'Mountain Spirit',
    '산악 독수리': 'Mountain Eagle',
    '반달가슴곰': 'Asiatic Black Bear',
    '천왕봉 수호자': 'Guardian of Cheonwangbong',
    '백록': 'White Deer',
    '화산 정령': 'Volcano Spirit',
    '백두산 신룡': 'Divine Dragon',

    // === 던전 UI ===
    '던전 탐험': 'Dungeon Exploration',
    '도전하기': 'Challenge',
    '캐릭터가 없습니다': 'No character found',
    '던전에 도전하려면 먼저 캐릭터를 생성하세요!': 'Create a character first to challenge dungeons!',
    '캐릭터 만들러 가기': 'Go Create Character',
    '으로 도전!': 'challenges!',

    // === 전투 UI ===
    '공격!': 'Attack!',
    '자동 전투': 'Auto Battle',
    '자동 전투 중...': 'Auto Battling...',
    '도망치기': 'Flee',

    // === 전투 결과 ===
    '승리!': 'Victory!',
    '획득 아이템': 'Obtained Items',
    '드롭된 아이템이 없습니다': 'No items dropped',
    '다시 도전': 'Try Again',
    '다른 던전 선택': 'Select Another',
    '패배...': 'Defeat...',
    '다음에는 더 강해져서 돌아오자!': 'Come back stronger next time!',
    '집으로...': 'Go Home...',

    // === 전투 로그 메시지 ===
    '이(가) 나타났다!': ' appeared!',
    '공격력': 'ATK',
    '의 공격!': '\'s attack!',
    '데미지!': 'damage!',
    '빠른 연속 공격!': 'Quick combo attack!',
    '추가 데미지!': 'bonus damage!',
    '이(가) 재빠르게 회피했다!': ' swiftly dodged!',
    '의 반격!': '\'s counterattack!',
    '을(를) 쓰러뜨렸다!': ' was defeated!',
    '드롭된 아이템이 없다...': 'No items dropped...',
    '획득!': 'obtained!',
    '이(가) 쓰러졌다...': ' has fallen...',
    '보스': 'Boss',
    '레벨 업!': 'Level Up!',

    // === 체력 부족 모달 ===
    '체력이 부족합니다!': 'Not enough HP!',
    '던전에 도전하려면 체력이 필요합니다.': 'You need HP to challenge dungeons.',
    '인벤토리에서 회복 아이템을 사용하세요.': 'Use recovery items from your inventory.',
    '인벤토리': 'Inventory',

    // === Room ===
    '마이펫': 'My Pet',
    '던전에서 획득한 아이템을 확인하세요': 'Check items obtained from dungeons',
    '장착 장비': 'Equipped Gear',
    '비어있음': 'Empty',
    '아이템이 없습니다': 'No items',
    '던전에서 승리하면 아이템을 획득할 수 있어요!': 'Win in dungeons to obtain items!',
    '던전 탐험하기': 'Explore Dungeons',
    '전체 부위': 'All Slots',
    '아이템 이름 검색': 'Search item name',
    '사용하기': 'Use',
    '장착하기': 'Equip',
    '장비 해제': 'Unequip',
    '1개 판매': 'Sell 1',
    '전부 판매': 'Sell All',
    '정말 판매하시겠습니까?': 'Are you sure you want to sell?',
    '에 판매합니다': ' for sale',

    // === Shop ===
    '골드 상점': 'Gold Shop',
    '젬 상점': 'Gem Shop',
    '골드가 부족합니다!': 'Not enough gold!',
    '젬이 부족합니다!': 'Not enough gems!',
    '구매 완료!': 'Purchase complete!',
    '판매 중인 상품이 없습니다': 'No items for sale',
    '상점을 이용하려면 먼저 캐릭터를 생성하세요!': 'Create a character first to use the shop!',

    // === 스탯 약어 (상점) ===
    '공': 'ATK',
    '방': 'DEF',
    '속': 'SPD',

    // === 안내 모달 ===
    '시즌 안내': 'Season Info',
    '이 게임은 시즌제로 운영되며 시즌 종료시의 게임 데이터는 명예의 전당에 기록됩니다.': 'This game runs on a seasonal basis. Game data at the end of each season will be recorded in the Hall of Fame.',
    '매주 새로운 시즌이 시작됩니다.': 'A new season starts every week.',
    '확인': 'OK',
};
