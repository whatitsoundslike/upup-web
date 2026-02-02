'use client';

import { useEffect, useMemo, useState } from 'react';
import { Crown, Shield, Sword, Zap, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

type RankingEntry = {
  rankScore: number;
  characterId: string;
  name: string;
  image: string | null;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  level: number | null;
  className: string | null;
  element: string | null;
};

export default function Ranking() {
  const { t } = useLanguage();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/superpet/ranking', { cache: 'no-store' });
        const payload = await res.json();
        if (!mounted) return;
        setRankings(Array.isArray(payload?.data) ? payload.data : []);
      } catch {
        if (!mounted) return;
        setRankings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const ranked = useMemo(
    () => rankings.map((entry, index) => ({ ...entry, rank: index + 1 })),
    [rankings]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-white to-white px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-amber-500/80 uppercase">Superpet</p>
            <h1 className="text-3xl font-black text-foreground">{t('랭킹 TOP20')}</h1>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-amber-100 bg-white/80 px-4 py-6 text-center text-sm font-semibold text-foreground/60">
            {t('랭킹 불러오는 중...')}
          </div>
        ) : ranked.length === 0 ? (
          <div className="rounded-2xl border border-amber-100 bg-white/80 px-4 py-6 text-center text-sm font-semibold text-foreground/60">
            {t('랭킹 데이터가 없습니다.')}
          </div>
        ) : (
          <div className="space-y-3">
            {ranked.map((entry) => {
              const isTop3 = entry.rank <= 3;
              return (
                <div
                  key={entry.characterId}
                  className={`rounded-2xl border ${isTop3 ? 'border-amber-300/60 bg-amber-50/70' : 'border-zinc-200/70 bg-white/90'} p-3 shadow-sm`}
                >
                  <div className="flex gap-3">
                    <div className="flex h-25 w-20 items-center justify-center rounded-xl bg-zinc-100 overflow-hidden">
                      {entry.image ? (
                        <img src={entry.image} alt={entry.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-lg font-black text-foreground/40">{entry.name.slice(0, 1)}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${isTop3 ? 'text-amber-600' : 'text-foreground'}`}>
                          #{entry.rank}
                        </span>
                        <h3 className="truncate text-base font-bold text-foreground">{entry.name}</h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                        {entry.level != null && <span>Lv.{entry.level}</span>}
                        {entry.className && <span>{t(entry.className)}</span>}
                        {entry.element && <span>{t(entry.element)}</span>}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-foreground/70">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-500" />
                          <span>HP {entry.stats.hp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sword className="h-3.5 w-3.5 text-orange-500" />
                          <span>{t('공격')} {entry.stats.attack}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                          <span>{t('방어')} {entry.stats.defense}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-green-500" />
                          <span>{t('속도')} {entry.stats.speed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className={`rounded-full px-2 py-0.5 text-xs font-bold ${isTop3 ? 'bg-amber-200 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {entry.rankScore}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
