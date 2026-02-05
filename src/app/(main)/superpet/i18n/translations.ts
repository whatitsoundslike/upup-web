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
    '던전 가기': 'Go to Dungeon',

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
    '워리어': 'Warrior',
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
    '사료': 'Pet Food',
    '두바이 쫀득 쿠키': 'Dubai Chewy Cookie',
    '고기': 'Meat',
    '전설의 고기': 'Legendary Meat',
    // 투구
    '철제 투구': 'Iron Helmet',
    '청동 투구': 'Bronze Helmet',
    '기사의 투구': 'Knight Helmet',
    '불사조 투구': 'Phoenix Helmet',
    '드래곤 투구': 'Dragon Helmet',
    // 갑옷
    '가죽 갑옷': 'Leather Armor',
    '사슬 갑옷': 'Chain Armor',
    '판금 갑옷': 'Plate Armor',
    '별빛 갑옷': 'Starlight Armor',
    '드래곤 갑옷': 'Dragon Armor',
    // 장갑
    '천 장갑': 'Cloth Gloves',
    '가죽 장갑': 'Leather Gloves',
    '강철 건틀릿': 'Steel Gauntlets',
    '오우거 파워 건틀릿': 'Ogre’s Power Gauntlet',
    '타이탄의 주먹': 'Titan Fists',
    // 부츠
    '러닝화': 'Running Shoes',
    '가죽 부츠': 'Leather Boots',
    '바람의 부츠': 'Wind Boots',
    '번개 부츠': 'Thunder Boots',
    '페가수스 부츠': 'Pegasus Boots',
    // 망토
    '간단한 망토': 'Simple Cloak',
    '여행자의 망토': 'Traveler Cloak',
    '마법사의 망토': 'Mage Cloak',
    '그림자 망토': 'Shadow Cloak',
    '천상의 망토': 'Celestial Cloak',
    // 무기
    '나무 검': 'Wooden Sword',
    '철 검': 'Iron Sword',
    '일본도': 'Katana',
    '그림자 칼날': 'Shadow Blade',
    '엑스칼리버': 'Excalibur',
    // 방패
    '나무 방패': 'Wooden Shield',
    '철 방패': 'Iron Shield',
    '수호자의 방패': 'Guardian Shield',
    '성스러운 방패': 'Holy Shield',
    '아이기스': 'Aegis',
    // 목걸이
    '나무 펜던트': 'Wooden Pendant',
    '은 목걸이': 'Silver Necklace',
    '루비 목걸이': 'Ruby Necklace',
    '다이아몬드 목걸이': 'Diamond Necklace',
    '불사조의 심장': 'Phoenix Heart',
    // 반지
    '구리 반지': 'Copper Ring',
    '은 반지': 'Silver Ring',
    '사파이어 반지': 'Sapphire Ring',
    '에메랄드 반지': 'Emerald Ring',
    '무한의 반지': 'Infinity Ring',

    // === 던전 이름 ===
    '깊은 숲': 'Deep Forest',
    '고요한 호수': 'Quiet Lake',
    '대지의 균열': 'Rift of the Earth',
    '피닉스의 둥지': 'Phoenix Nest',
    '용의 계곡': 'Dragon Valley',

    // === 던전 설명 ===
    '신비로운 숲. 다양한 숲속 생물들이 서식한다': 'A mystical forest. Home to various woodland creatures.',
    '고요한 호수. 물밑에서 강력한 힘이 느껴진다': 'A quiet lake. A powerful force is felt from the bottom of the water.',
    '대지가 갈라지며 드러난 지하 세계. 용암과 바위 사이로 강력한 존재들이 도사린다': 'An underground world revealed by a cracked earth. Powerful beings lurk between lava and rock.',
    '하늘 높이 솟은 화산 꼭대기의 둥지. 불사조의 화염이 모든 것을 태운다': 'A nest atop a towering volcano. The phoenix\'s flames burn everything.',
    '고대의 용들이 서식하는 위험한 계곡. 강력한 드래곤들이 도사리고 있다': 'A dangerous valley inhabited by ancient dragons. Powerful dragons lurk within.',

    // === 몬스터 이름 ===
    '솔잎 다람쥐': 'Pine Squirrel',
    '숲속 여우': 'Forest Fox',
    '은빛 올빼미': 'Silver Owl',
    '독버섯 정령': 'Mushroom Spirit',
    '은빛 늑대': 'Silver Wolf',
    '숲지기': 'Forest Guardian',

    '틸라피아': 'Tilapia',
    '메기': 'Catfish',
    '물 뱀': 'Water Snake',
    '세이렌': 'Siren',
    '물 정령': 'Water Spirit',
    '레비아탄': 'Leviathan',

    '용암 전갈': 'Lava Scorpion',
    '바위 골렘': 'Rock Golem',
    '지하 거미': 'Cave Spider',
    '균열 도마뱀': 'Rift Lizard',
    '마그마 뱀': 'Magma Serpent',
    '대지의 군주': 'Earth Lord',

    '화염 박쥐': 'Flame Bat',
    '용암 거북': 'Lava Turtle',
    '불꽃 하피': 'Flame Harpy',
    '화산 기사': 'Volcano Knight',
    '불의 정령': 'Fire Spirit',
    '피닉스': 'Phoenix',

    '어린 비룡': 'Young Wyvern',
    '독룡': 'Poison Dragon',
    '화염 드레이크': 'Flame Drake',
    '빙결 와이번': 'Frost Wyvern',
    '암흑 비룡': 'Dark Wyvern',
    '마룡': 'Evil Dragon',

    // === 던전 UI ===
    '던전 탐험': 'Dungeon Exploration',
    '도전하기': 'Challenge',
    '캐릭터가 없습니다': 'No character found',
    '던전에 도전하려면 먼저 캐릭터를 생성하세요!': 'Create a character first to challenge dungeons!',
    '캐릭터 만들러 가기': 'Go Create Character',
    '으로 도전!': 'challenges!',
    '다음 사료 배달까지': 'Next feed delivery in',

    // === 전투 UI ===
    '공격!': 'Attack!',
    '자동 전투': 'Auto Battle',
    '자동 전투 진행 중...': 'Auto Battling...',
    '도망치기': 'Flee',

    // === 전투 결과 ===
    '승리!': 'Victory!',
    '획득 아이템': 'Obtained Items',
    '드롭된 아이템이 없습니다': 'No items dropped',
    '다시 도전': 'Try Again',
    '전투 포기': 'Give Up',
    '모험 계속하기': 'Continue',
    '다른 던전 선택': 'Select Another',
    '패배...': 'Defeat...',
    '다음에는 더 강해져서 돌아오자!': 'Come back stronger next time!',
    '집으로...': 'Go Home...',
    '배고파..?': 'Hungry..?',
    '먹이기': 'Feed',

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
    '아이템을 찾을 수 없습니다.': 'Item not found.',
    '음식 아이템이 아닙니다.': 'This is not a food item.',
    '캐릭터를 찾을 수 없습니다.': 'Character not found.',
    '인벤토리에 해당 아이템이 없습니다.': 'Item not found in inventory.',
    'HP가 이미 최대치입니다.': 'HP is already at maximum.',
    '데이터를 저장하고 있습니다...': 'Saving data...',

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

    // === 공유 ===
    '카드 공유하기': 'Share Card',
    'X(트위터)에 공유': 'Share on X (Twitter)',
    '내 슈퍼펫을 확인해보세요!': 'Check out my Super Pet!',
    '트위터에 슈퍼펫 알려주기': 'Share on X (Twitter)',

    // === AI 카드 생성 ===
    '귀여운 카툰': 'Cute Cartoon',
    '강력한 일러스트': 'Powerful Illustration',
    '퍼리': 'Furry',
    '반려동물 사진 (선택)': 'Pet Photo (Optional)',
    '반려동물 사진': 'Pet Photo',
    '사진을 첨부하면 AI가 카드로 변환합니다': 'Upload a photo and AI will create a card',
    '사진 첨부하기': 'Attach Photo',
    '멋진 캐릭터 카드를 생성 중입니다...': 'Generating an awesome character card...',
    '동물 사진이 아닙니다': 'This is not an animal photo',
    '카드 생성에 실패했습니다': 'Failed to generate card',

    // === 공지 모달 ===
    '확인': 'OK',
    '공지사항': 'Notice',
    '시즌 안내': 'Season Info',
    '이 게임은 시즌제로 운영되며 시즌 종료시의 게임 데이터는 명예의 전당에 기록됩니다.': 'This game runs on a seasonal basis. Game data at the end of each season will be recorded in the Hall of Fame.',
    '매주 새로운 시즌이 시작됩니다.': 'A new season starts every week.',
    '캐릭터 저장 기능이 추가되었습니다!': 'Character save function has been added!',
    '랭킹 기능이 추가되었습니다!': 'Ranking function has been added!',
    '무료 사료 배달 기능이 추가되었습니다! 웹 접속시 10분 마다 사료가 지급됩니다.': 'Free feed delivery function has been added! You will receive feed every 10 minutes when you access the web.',

    // === 프로필 ===
    '내 정보 수정': 'Edit Profile',
    '닉네임': 'Nickname',
    '닉네임은 2자 이상이어야 합니다.': 'Nickname must be at least 2 characters.',
    '비밀번호 변경 (선택)': 'Change Password (Optional)',
    '현재 비밀번호': 'Current Password',
    '새 비밀번호 (6자 이상)': 'New Password (6+ chars)',
    '새 비밀번호 확인': 'Confirm New Password',
    '새 비밀번호가 일치하지 않습니다.': 'New passwords do not match.',
    '새 비밀번호는 6자 이상이어야 합니다.': 'New password must be at least 6 characters.',
    '현재 비밀번호를 입력해주세요.': 'Please enter your current password.',
    '수정에 실패했습니다.': 'Failed to update.',
    '서버 오류가 발생했습니다.': 'A server error occurred.',
    '정보가 수정되었습니다.': 'Profile updated successfully.',
    '수정 중...': 'Updating...',
    '수정하기': 'Update',
    '돌아가기': 'Go Back',

    // === 랭킹 ===
    '랭킹 불러오는 중...': 'Loading rankings...',
    '랭킹 데이터가 없습니다.': 'No ranking data available.',
    '랭킹 TOP20': 'Ranking TOP20',

    // === 파일 용량 제한 ===
    '최대 750KB': 'Max 750KB',
    '파일 용량 초과': 'File Size Exceeded',
    '업로드 가능한 최대 파일 크기는 750KB입니다.': 'Maximum file size is 750KB.',
    '더 작은 용량의 이미지를 선택해주세요.': 'Please select a smaller image.',
    '현재 파일 크기': 'Current file size',
};
