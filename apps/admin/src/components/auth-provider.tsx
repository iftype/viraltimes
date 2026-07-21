"use client";

import { createContext, useContext, useEffect, useState, ReactNode, FormEvent } from "react";
import { AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import { BrandMark } from "@origin/ui";

const apiBase = "/viral/api/v1";

type AuthContextType = {
  authenticated: boolean | null;
  setAuthenticated: (val: boolean | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}

function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      onAuthenticated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "로그인하지 못했습니다.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5 bg-[#f7f7f8]">
      <section className="w-full max-w-sm rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.09)] sm:p-9">
        <div className="flex items-center gap-3">
          <BrandMark className="size-11 rounded-2xl text-lg" />
          <div>
            <p className="text-sm font-black tracking-[-0.04em]">VIRALORIGIN</p>
            <p className="text-xs font-bold text-black/35">ADMIN</p>
          </div>
        </div>
        <h1 className="mt-10 text-3xl font-black tracking-[-0.055em]">관리자 확인</h1>
        <p className="mt-2 text-sm leading-6 text-black/45">제보와 검토 알림을 확인하려면 비밀번호를 입력해 주세요.</p>
        <form className="mt-7" onSubmit={submit}>
          <label className="text-xs font-black text-black/45" htmlFor="admin-password">비밀번호</label>
          <input
            id="admin-password"
            autoComplete="current-password"
            autoFocus
            className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f8] px-4 py-4 text-center text-xl font-black tracking-[0.5em] outline-none transition focus:border-black"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]*"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#d91d46]"><AlertTriangle className="size-4" />{error}</p>}
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-sm font-black text-white" disabled={loading || password.length !== 4} type="submit">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? "확인 중" : "들어가기"}
          </button>
        </form>
        <p className="mt-5 text-center text-[0.68rem] leading-5 text-black/30">12시간 후 자동 로그아웃 · 로그인 시도 제한 적용</p>
      </section>
    </main>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiBase}/admin/inbox`, { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
      } else if (response.ok) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void checkAuth(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const logout = async () => {
    await fetch(`${apiBase}/admin/logout`, { method: "POST" });
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-black/35" aria-label="불러오는 중" />
      </main>
    );
  }

  if (!authenticated) {
    return <Login onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
