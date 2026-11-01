/*"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, IdCard, KeyRound, Wrench } from "lucide-react"
import { Plus_Jakarta_Sans } from "next/font/google"
import { LangToggle } from "@/components/shared/lang-toggle"

const font = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"] })

type Role = "admin" | "operator"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("operator")
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: gọi API đăng nhập, lưu token, vai trò lấy từ backend trả về
    router.push(role === "admin" ? "/admin" : "/operator")
  }*/

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus_Jakarta_Sans } from "next/font/google"
import { LangToggle } from "@/components/shared/lang-toggle"
import { loginSchema, type LoginValues } from "@/lib/validations/login"
import { useT } from "@/lib/i18n/language-provider"
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, IdCard, KeyRound, Loader2, Wrench } from "lucide-react"
import type { TranslationKey } from "@/lib/i18n/dictionary"

const font = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"] })

/*export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)*/

const ERROR_KEYS: Record<string, TranslationKey> = {
  INVALID_CREDENTIALS: "login.err.invalid",
  TOO_MANY: "login.err.tooMany",
  ACCOUNT_INACTIVE: "login.err.inactive",
  FORBIDDEN_ROLE: "login.err.forbidden",
  ROLE_MISMATCH: "login.err.mismatch",
  NETWORK: "login.err.network",
  SERVER: "login.err.server",
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useT()

  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [serverError, setServerError] = useState<TranslationKey | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "operator", username: "", password: "", remember: true },
  })

  const role = watch("role")

  useEffect(() => {
  setStatus("idle")
  setServerError(null)
  reset({ role: "operator", username: "", password: "", remember: true })
}, [reset])

  /*function onSubmit(values: LoginValues) {
    // TODO (việc 3): gọi API đăng nhập, vai trò lấy từ backend trả về
    router.push(values.role === "admin" ? "/admin" : "/operator")
  }*/

  /*async function onSubmit(values: LoginValues) {
    setServerError(null)
    setStatus("loading")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.username,
          password: values.password,
          remember: values.remember,
          role: values.role,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(ERROR_KEYS[data.error] ?? "login.err.server")
        setStatus("idle")
        return
      }

      setStatus("success")
      router.replace(data.redirectTo)
      router.refresh()
    } catch {
      setServerError("login.err.network")
      setStatus("idle")
    }
  }*/

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    setStatus("loading")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.username,
          password: values.password,
          remember: values.remember,
          role: values.role,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(ERROR_KEYS[data.error] ?? "login.err.server")
        setStatus("idle")
        return
      }

      // Kiểm tra đường dẫn chuyển trang do API trả về
      const redirectTo = data.redirectTo

      if (
        typeof redirectTo !== "string" ||
        !["/admin", "/operator"].includes(redirectTo)
      ) {
        setServerError("login.err.server")
        setStatus("idle")
        return
      }

      setStatus("success")
      router.replace(redirectTo)
    } catch {
      setServerError("login.err.network")
      setStatus("idle")
    }
  }

  /*const tab = (active: boolean) =>
    `flex-1 rounded-md py-2 text-xs font-bold transition ${
      active ? "bg-white text-ink shadow-sm" : "text-body"
    }`

  const field =
    "mt-1.5 flex h-11 items-center gap-2.5 rounded-lg bg-field px-3 focus-within:ring-2 focus-within:ring-cta/30"
  */
  
  const tab = (active: boolean) =>
  `flex-1 rounded-md py-2 text-xs font-bold transition ${
    active ? "bg-white text-ink shadow-sm" : "text-body"
  }`

  const field = (hasError: boolean) =>
    `mt-1.5 flex h-11 items-center gap-2.5 rounded-lg bg-field px-3 focus-within:ring-2 focus-within:ring-cta/30 ${
      hasError ? "ring-2 ring-red-400" : ""
    }`
  return (
    <div className={`${font.className} min-h-screen bg-field/50`}>
      {/* Thanh trên cùng */}
      <header className="flex h-14 items-center justify-between bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-navy text-cta">
            <Wrench className="size-4" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-extrabold text-ink">
              Fix<span className="text-cta">Home</span>
            </div>
            <div className="mt-0.5 text-[7px] font-semibold tracking-[0.15em] text-muted">
              
            </div>
          </div>
        </div>
        <LangToggle />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid min-h-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(19,27,46,0.08)] md:grid-cols-2">
          {/* Khối trái: tối, có ảnh */}
          <section className="relative bg-navy p-8 text-white">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent from-50% to-cta/15" />
            <h2 className="relative text-[28px] font-bold leading-tight">
              {t("login.hero")}
            </h2>
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src="/images/login-technician-v2.jpg"
                alt="Kỹ thuật viên sửa chữa"
                fill
                priority
                className="object-cover object-[center_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-navy/70 via-transparent to-transparent" />
            </div>
          </section>

          {/* Khối phải: form */}
          <section className="p-8 md:p-10">
            <h1 className="text-[28px] font-bold leading-tight text-ink">
              {t("login.title")}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
  <div>
    <label className="text-xs font-semibold text-body">{t("login.role")}</label>
    <div className="mt-1.5 flex gap-1 rounded-lg bg-line/60 p-1">
      <button type="button" onClick={() => setValue("role", "admin")} className={tab(role === "admin")}>
        {t("login.admin")}
      </button>
      <button type="button" onClick={() => setValue("role", "operator")} className={tab(role === "operator")}>
        {t("login.operator")}
      </button>
    </div>
  </div>

  <div>
    <label htmlFor="username" className="text-xs font-semibold text-body">
      {t("login.username")}
    </label>
    <div className={field(!!errors.username)}>
      <IdCard className="size-4 shrink-0 text-muted" />
      <input
        id="username"
        type="text"
        autoComplete="username"
        placeholder="admin.ops@fixhome.vn"
        aria-invalid={!!errors.username}
        {...register("username")}
        className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
    </div>
    {errors.username?.message && (<p className="mt-1 text-[11px] text-red-500">{t(errors.username.message as TranslationKey)}</p>)}
  </div>

  <div>
    <label htmlFor="password" className="text-xs font-semibold text-body">
      {t("login.password")}
    </label>
    <div className={field(!!errors.password)}>
      <KeyRound className="size-4 shrink-0 text-muted" />
      <input
        id="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••••••"
        aria-invalid={!!errors.password}
        {...register("password")}
        className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label="Hiện hoặc ẩn mật khẩu"
      >
        {showPassword ? <EyeOff className="size-4 text-muted" /> : <Eye className="size-4 text-muted" />}
      </button>
    </div>
    {errors.password && (<p className="mt-1 text-[11px] text-red-500">{t(errors.password.message as TranslationKey)}</p>)}
  </div>
  <label className="flex items-center gap-2 text-xs text-body">
    <input type="checkbox" {...register("remember")} className="size-3.5 accent-brand" />
    {t("login.remember")}
  </label>

    {serverError && (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{t(serverError)}</span>
    </div>
  )}

  {status === "success" && (
    <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <span>{t("login.success")}</span>
    </div>
  )}

  <button
    type="submit"
    disabled={status !== "idle"}
    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-bold text-white shadow-md shadow-cta/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {status === "idle" ? (
      <>{t("login.submit")} <ArrowRight className="size-4" /></>
    ) : (
      <><Loader2 className="size-4 animate-spin" /> {t(status === "loading" ? "login.loading" : "login.success")}</>
    )}
  </button>
</form>
          </section>
        </div>
      </main>
    </div>
  )
}