'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, ChevronRight, MessageSquareText, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { koToEn } from '@/app/(main)/superpet/i18n/translations';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  status: string;
  createdAt: string;
}

type View = 'list' | 'create' | 'detail';

export default function InquiryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [view, setView] = useState<View>('list');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  const t = useCallback((korean: string): string => {
    if (lang === 'ko') return korean;
    return koToEn[korean] ?? korean;
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem('superpet-lang');
    if (saved === 'en') setLang('en');
    const handleChange = () => {
      const current = localStorage.getItem('superpet-lang');
      setLang(current === 'en' ? 'en' : 'ko');
    };
    window.addEventListener('superpet-lang-change', handleChange);
    return () => window.removeEventListener('superpet-lang-change', handleChange);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?callbackUrl=/inquiry');
    }
  }, [authLoading, user, router]);

  const fetchInquiries = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await fetch('/api/inquiry');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch {
      // ignore
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchInquiries();
  }, [user, fetchInquiries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('제목을 입력해주세요.'));
      return;
    }
    if (!content.trim()) {
      setError(t('내용을 입력해주세요.'));
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('서버 오류가 발생했습니다.'));
        return;
      }

      setTitle('');
      setContent('');
      setView('list');
      fetchInquiries();
    } catch {
      setError(t('서버 오류가 발생했습니다.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-6"
    >
      <div className="flex justify-center mb-8">
        <Link href="/">
          <Image
            src="/room-icon/zroom_icon.webp"
            alt="ZROOM"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* 목록 뷰 */}
      {view === 'list' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{t('문의하기')}</h1>
            <button
              onClick={() => { setView('create'); setError(''); }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-tesla-red text-white hover:bg-tesla-red/90"
              )}
            >
              <Plus className="h-4 w-4" />
              {t('새 문의')}
            </button>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquareText className="h-12 w-12 mx-auto mb-3 text-foreground/20" />
              <p className="text-foreground/40 text-sm">{t('문의 내역이 없습니다.')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inquiries.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedInquiry(item); setView('detail'); }}
                  className="w-full text-left px-4 py-3.5 rounded-lg border dark:border-white/10 hover:bg-foreground/5 transition-colors flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.status === 'answered' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('답변완료')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/40">
                          <Clock className="h-3 w-3" />
                          {t('대기중')}
                        </span>
                      )}
                      <span className="text-xs text-foreground/30">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{item.title}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-foreground/30 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 등록 뷰 */}
      {view === 'create' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { setView('list'); setError(''); }}
              className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">{t('새 문의')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/60 mb-1.5 block">
                {t('제목')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('문의 제목을 입력하세요')}
                maxLength={200}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border dark:border-white/10",
                  "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
                  "transition-colors"
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/60 mb-1.5 block">
                {t('내용')}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('문의 내용을 입력하세요')}
                rows={6}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border dark:border-white/10 resize-none",
                  "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
                  "transition-colors"
                )}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className={cn(
                "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                "bg-tesla-red text-white hover:bg-tesla-red/90 disabled:opacity-50"
              )}
            >
              {submitLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MessageSquareText className="h-5 w-5" />
              )}
              {submitLoading ? t('등록 중...') : t('문의 등록')}
            </button>
          </form>
        </>
      )}

      {/* 상세 뷰 */}
      {view === 'detail' && selectedInquiry && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { setView('list'); setSelectedInquiry(null); }}
              className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">{t('문의 상세')}</h1>
          </div>

          <div className="space-y-4">
            {/* 상태 + 날짜 */}
            <div className="flex items-center gap-2">
              {selectedInquiry.status === 'answered' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('답변완료')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-foreground/5 text-foreground/40">
                  <Clock className="h-3 w-3" />
                  {t('대기중')}
                </span>
              )}
              <span className="text-xs text-foreground/30">{formatDate(selectedInquiry.createdAt)}</span>
            </div>

            {/* 제목 */}
            <h2 className="text-lg font-bold">{selectedInquiry.title}</h2>

            {/* 본문 */}
            <div className="px-4 py-3 rounded-lg border dark:border-white/10 bg-foreground/5">
              <p className="text-sm whitespace-pre-wrap">{selectedInquiry.content}</p>
            </div>

            {/* 답변 */}
            {selectedInquiry.answer && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground/60 mb-2">{t('답변')}</p>
                <div className="px-4 py-3 rounded-lg border-2 border-green-500/30 bg-green-500/5">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-center mt-8 text-sm mb-10">
        <Link href="/" className="text-foreground/50 hover:text-foreground flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t('돌아가기')}
        </Link>
      </p>
    </motion.div>
  );
}
