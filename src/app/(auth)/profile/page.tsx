'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Pencil, Loader2, ArrowLeft, User, IdCard, Mail, UserX } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { koToEn } from '@/app/(main)/superpet/i18n/translations';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
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
      router.replace('/login?callbackUrl=/profile');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  if (authLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (name.length < 2) {
      setError(t('닉네임은 2자 이상이어야 합니다.'));
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError(t('새 비밀번호가 일치하지 않습니다.'));
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError(t('새 비밀번호는 6자 이상이어야 합니다.'));
      return;
    }

    if (newPassword && !currentPassword) {
      setError(t('현재 비밀번호를 입력해주세요.'));
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, string> = { name, email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('수정에 실패했습니다.'));
        return;
      }

      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(t('정보가 수정되었습니다.'));
    } catch {
      setError(t('서버 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
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

      <h1 className="text-2xl font-bold text-center mb-8">{t('내 정보 수정')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 (읽기 전용) */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 mb-1.5">
            <IdCard className="h-4 w-4" />
            ID
          </label>
          <input
            type="text"
            value={user.uid}
            disabled
            autoComplete="username"
            required
            className={cn(
              "w-full px-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 text-foreground/40 cursor-not-allowed"
            )}
          />
        </div>

        {/* 닉네임 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 mb-1.5">
            <User className="h-4 w-4" />
            {t('닉네임')}
          </label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            placeholder={t('닉네임')}
            className={cn(
              "w-full px-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 mb-1.5">
            <Mail className="h-4 w-4" />
            {t('이메일')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('이메일')}
            required
            className={cn(
              "w-full px-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        <div className="pt-4 border-t dark:border-white/10">
          <p className="text-sm text-foreground/50 mb-3">{t('비밀번호 변경 (선택)')}</p>
        </div>

        {/* 현재 비밀번호 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('현재 비밀번호')}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('새 비밀번호 (6자 이상)')}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('새 비밀번호 확인')}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
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

        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-500 text-sm text-center"
          >
            {success}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
            "bg-tesla-red text-white hover:bg-tesla-red/90 disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Pencil className="h-5 w-5" />
          )}
          {loading ? t('수정 중...') : t('수정하기')}
        </button>
      </form>

      <p className="text-center mt-6 text-sm">
        <Link href="/" className="text-foreground/50 hover:text-foreground flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t('돌아가기')}
        </Link>
      </p>

      {/* 회원탈퇴 */}
      <div className="mt-8 mb-10 pt-4 border-t dark:border-white/10">
        <button
          type="button"
          onClick={() => setShowWithdraw(true)}
          className="w-full py-2.5 text-sm text-foreground/40 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
        >
          <UserX className="h-4 w-4" />
          {t('회원탈퇴')}
        </button>
      </div>

      {/* 탈퇴 확인 모달 */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
            onClick={() => !withdrawLoading && setShowWithdraw(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-center mb-2">{t('회원탈퇴')}</h3>
              <p className="text-sm text-foreground/60 text-center mb-1">
                {t('정말로 탈퇴하시겠습니까?')}
              </p>
              <p className="text-xs text-red-500 text-center mb-6">
                {t('탈퇴 후 계정 복구가 불가능합니다.')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={withdrawLoading}
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2.5 rounded-lg border dark:border-white/10 text-sm font-medium hover:bg-foreground/5 transition-colors"
                >
                  {t('취소')}
                </button>
                <button
                  type="button"
                  disabled={withdrawLoading}
                  onClick={async () => {
                    setWithdrawLoading(true);
                    try {
                      const res = await fetch('/api/auth/withdraw', { method: 'POST' });
                      if (res.ok) {
                        window.location.href = '/';
                      } else {
                        const data = await res.json();
                        setError(data.error || t('서버 오류가 발생했습니다.'));
                        setShowWithdraw(false);
                      }
                    } catch {
                      setError(t('서버 오류가 발생했습니다.'));
                      setShowWithdraw(false);
                    } finally {
                      setWithdrawLoading(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {withdrawLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                  {t('탈퇴하기')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
