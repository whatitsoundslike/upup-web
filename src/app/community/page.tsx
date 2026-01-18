'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, Heart, Bookmark, Search, Edit3 } from 'lucide-react';

const posts = [
    { id: 1, title: '모델 Y RWD 인도 후기 - 꼭 체크해야 할 점들', author: '주행왕', likes: 124, comments: 45, time: '2시간 전' },
    { id: 2, title: '이번 FSD V13 업데이트, 한국에서도 작동하나 확인해봤습니다', author: '테슬라보이', likes: 89, comments: 23, time: '4시간 전' },
    { id: 3, title: '제주도 일주일 차박 여행 코스 추천해주세요', author: '노마드킴', likes: 56, comments: 18, time: '6시간 전' },
    { id: 4, title: '윈터 타이거 교체 시기 질문드립니다. (강원 지역)', author: '안전제일', likes: 32, comments: 56, time: '8시간 전' },
    { id: 5, title: '사이버트럭 국내 실물 영접했습니다! (사진 많음)', author: '신기술덕후', likes: 210, comments: 88, time: '12시간 전' },
];

export default function CommunityPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Community</h1>
                    <p className="text-foreground/60 text-lg">테슬라 오너들의 지식과 경험이 모이는 곳.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="게시글 검색..."
                            className="w-full pl-10 pr-4 py-3 bg-foreground/5 border dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-tesla-red transition-all"
                        />
                    </div>
                    <button className="px-6 py-3 bg-tesla-red text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shrink-0">
                        <Edit3 className="h-4 w-4" /> 글쓰기
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="space-y-2 hidden lg:block">
                    {['전체 게시판', '인도 후기', '카라이프', '질문/답변', '자유게시판'].map((cat, i) => (
                        <button
                            key={cat}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${i === 0 ? 'bg-tesla-red text-white' : 'hover:bg-foreground/5 text-foreground/60 hover:text-foreground'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Post List */}
                <div className="lg:col-span-3 space-y-4">
                    {posts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.005 }}
                            className="p-6 glass rounded-2xl hover:bg-foreground/5 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-tesla-red transition-colors line-clamp-1">{post.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-semibold text-foreground/40">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {post.author}</span>
                                        <span>{post.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-sm font-bold text-foreground/40">
                                        <Heart className="h-4 w-4" /> {post.likes}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-foreground/40">
                                        <MessageSquare className="h-4 w-4" /> {post.comments}
                                    </div>
                                    <button className="text-foreground/20 hover:text-tesla-red transition-colors">
                                        <Bookmark className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <button className="w-full py-6 mt-4 border-2 border-dashed border-foreground/10 rounded-2xl text-foreground/40 font-bold hover:bg-foreground/5 hover:border-foreground/20 transition-all text-sm uppercase tracking-widest">
                        더 많은 이야기 보기
                    </button>
                </div>
            </div>
        </div>
    );
}
