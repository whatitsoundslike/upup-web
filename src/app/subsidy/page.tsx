'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, MapPin, Info, AlertTriangle, Search } from 'lucide-react';

const cities = [
    { name1: '서울', name2: '서울특별시', totalCount: 10500, applyCount: 0, etc: 'ㅇ 상반기 보급대수 : 승용 10,500대(일반 8,900대, 우선순위 1,600대)\n    ※ 연간 총 보급대수 : 승용차 15,094대, 화물차 1,779대, 승합 76대 (총 16,949대)\n    ※ 보급대수는 보급여건 및 예산범위 내에서 변동될 수 있으며 전기택시？전기이륜은 별도 공고,   3/4분기부터 우선순위？택배？중소기업 물량을 일반 물량과 통합 집행' },
    { name1: '부산', name2: '부산광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '대구', name2: '대구광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '인천', name2: '인천광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '광주', name2: '광주광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '대전', name2: '대전광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '울산', name2: '울산광역시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '세종', name2: '세종특별자치시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '수원시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '성남시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '의정부시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '안양시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '부천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '광명시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '평택시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '동두천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '안산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '고양시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '과천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '구리시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '남양주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '오산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '시흥시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '군포시', totalCount: 750, applyCount: 0, etc: '' },
    { name1: '경기', name2: '의왕시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '하남시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '용인시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '파주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '이천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '안성시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '김포시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '화성시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '광주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '양주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '포천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경기', name2: '여주시', totalCount: 509, applyCount: 0, etc: '' },
    { name1: '경기', name2: '연천군', totalCount: 55, applyCount: 0, etc: '「2026년 전기자동차 구매지원 사업 상반기 공고」.\n1. 사업기간: 2026. 01. 22.(목) 09:00 ~ 2026. 6. 30.(화) 18:00 \n2. 사업내용: 전기자동차를 구매하는 자에게 예산의 범위 내에서 보조금 지원\n3. 보급대수(상반기): 승용 55대, 화물 20대, 승합1대\n  - 보급대수는 차종별 보조금 차등 지원 및 국비 추가 지급 등에 따라 변동될 수 있으며 변경 시 추가 공고를 통해 알려드립니다.\n4. 지원대상: 공고문 참고' },
    { name1: '경기', name2: '가평군', totalCount: 100, applyCount: 0, etc: '' },
    { name1: '경기', name2: '양평군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '춘천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '원주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '강릉시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '동해시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '태백시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '속초시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '삼척시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '홍천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '횡성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '영월군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '평창군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '정선군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '철원군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '화천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '양구군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '인제군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '고성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '강원', name2: '양양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '청주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '충주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '제천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '보은군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '옥천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '영동군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '증평군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '진천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '괴산군', totalCount: 100, applyCount: 0, etc: '<2026년 상반기 괴산군 전기자동차 보급사업>\n★ 접수기간: 2026. 1. 26.(월) ~ 6. 30.(화)\n★ 보급대수: 승용 100대, 화물 40대\n★ 지원차종 및 지원금액 : 무공해차 통합누리집(www.ev.or.kr)참고\n★ 문의사항: 환경과(043-830-3627)\n\n※공고문 금요일에 올라갑니다' },
    { name1: '충북', name2: '음성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충북', name2: '단양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '천안시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '공주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '보령시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '아산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '서산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '논산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '계룡시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '당진시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '금산군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '부여군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '서천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '청양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '홍성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '예산군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '충남', name2: '태안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '전주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '군산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '익산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '정읍시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '남원시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '김제시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '완주군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '진안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '무주군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '장수군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '임실군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '순창군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '고창군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전북', name2: '부안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '목포시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '여수시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '순천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '나주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '광양시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '담양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '곡성군', totalCount: 70, applyCount: 0, etc: '' },
    { name1: '전남', name2: '구례군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '고흥군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '보성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '화순군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '장흥군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '강진군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '해남군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '영암군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '무안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '함평군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '영광군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '장성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '완도군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '진도군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '전남', name2: '신안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '포항시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '경주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '김천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '안동시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '구미시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '영주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '영천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '상주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '문경시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '경산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '의성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '청송군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '영양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '영덕군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '청도군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '고령군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '성주군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '칠곡군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '예천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '봉화군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '울진군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경북', name2: '울릉군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '창원시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '진주시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '통영시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '사천시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '김해시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '밀양시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '거제시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '양산시', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '의령군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '함안군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '창녕군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '고성군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '남해군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '하동군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '산청군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '함양군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '거창군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '경남', name2: '합천군', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '제주', name2: '제주특별자치도', totalCount: 0, applyCount: 0, etc: '' },
    { name1: '공단', name2: '한국환경공단', totalCount: 0, applyCount: 0, etc: '' },
];

export default function SubsidyPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCities = cities.filter((city) =>
        city.name1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.name2.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-tesla-red transition-colors" />
                        <input
                            type="text"
                            placeholder="지역명 또는 도시명을 검색하세요 (예: 서울, 수원, 경기)"
                            className="w-full bg-foreground/5 border border-foreground/10 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-tesla-red/50 focus:ring-4 focus:ring-tesla-red/5 transition-all text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="glass overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-foreground/5">
                                <tr>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">지역/도시</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">전체 공고</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">잔여대수</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">잔여율</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right hidden lg:table-cell w-[300px]">비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredCities.map((city) => {
                                    const remainCount = city.totalCount - city.applyCount;
                                    const rate = Math.round((remainCount / city.totalCount) * 100);
                                    return (
                                        <tr key={`${city.name1}-${city.name2}`} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-1 bg-foreground/5 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:bg-tesla-red/20 group-hover:text-tesla-red transition-colors">
                                                        {city.name1}
                                                    </span>
                                                    <span className="font-bold text-sm">{city.name2}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-mono text-sm text-foreground/60 text-right">
                                                {city.totalCount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`font-bold text-sm ${rate < 10 ? 'text-tesla-red' : 'text-foreground'}`}>
                                                    {remainCount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {city.totalCount > 0 ? (
                                                    <span className={`font-mono font-bold text-xs ${rate < 10 ? 'text-tesla-red' : 'text-foreground/40'}`}>
                                                        {rate}%
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground/20">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right hidden lg:table-cell max-w-[300px] break-words">
                                                <span className="text-xs text-foreground/50 font-medium whitespace-pre-line">
                                                    {city.etc || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCities.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <AlertTriangle className="h-8 w-8 text-foreground/20" />
                                                <p className="text-foreground/40 font-medium italic uppercase tracking-widest text-sm">
                                                    No results found for "{searchTerm}"
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Info (Keeping previous UI style for consistency) */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 italic uppercase">Guidelines</h3>
                        <ul className="space-y-4 text-sm text-foreground/50 font-medium">
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                본 현황은 무공해차 통합누리집 데이터를 바탕으로 실시간 업데이트됩니다.
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                지자체별 상세 공고 내용에 따라 실제 접수 가능 여부가 다를 수 있습니다.
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                보조금 소진 임박 지역은 서둘러 신청하시기 바랍니다.
                            </li>
                        </ul>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl p-8 bg-zinc-900 border border-white/5 group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2 italic text-white uppercase tracking-tighter">Tesla Advisor</h3>
                            <p className="text-zinc-500 text-xs mb-8 leading-relaxed font-bold uppercase tracking-widest">
                                Expert assistance with subsidies and purchase procedures.
                            </p>
                            <button className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-tesla-red hover:text-white transition-all active:scale-[0.98]">
                                Contact Advisor
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Coins className="w-48 h-48 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
