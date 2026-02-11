'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Loader2, Pencil } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { saveToServer } from '@/app/(main)/superpet/gameSync';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (uid.length < 6) {
      setError('아이디는 6자 이상이어야 합니다.');
      return;
    }

    if (name.length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.');
        return;
      }

      await refreshUser();
      await saveToServer();
      router.push('/');
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

      <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        <div className="relative">
          <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임"
            autoComplete="off"
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border dark:border-white/10",
              "bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-tesla-red/50",
              "transition-colors"
            )}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="off"
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
            placeholder="비밀번호 (6자 이상)"
            autoComplete="new-password"
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 확인"
            autoComplete="new-password"
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
            <UserPlus className="h-5 w-5" />
          )}
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-foreground/60">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-tesla-red hover:underline">
          로그인
        </Link>
      </p>
    </motion.div>
  );
}
