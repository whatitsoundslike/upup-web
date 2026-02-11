'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { loadFromServer } from '@/app/(main)/superpet/gameSync';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { refreshUser } = useAuth();

  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        return;
      }

      await refreshUser();
      await loadFromServer();
      router.push(callbackUrl);
    } catch {
      setError('서버 오류가 발생했습니다.');
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
            src="/zroom_logo.webp"
            alt="ZROOM"
            width={128}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">로그인</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            required
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
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
            <LogIn className="h-5 w-5" />
          )}
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-foreground/60">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-tesla-red hover:underline">
          회원가입
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
