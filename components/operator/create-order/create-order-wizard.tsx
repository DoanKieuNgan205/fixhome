"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Phone } from "lucide-react"
import { EMPTY_DRAFT, type Draft } from "@/lib/operator/mock-create-order"
import { OrderStepper } from "./order-stepper"
import { OrderSummary } from "./order-summary"
import { StepService } from "./step-service"
import { StepIssue } from "./step-issue"
import { StepCustomer } from "./step-customer"
import { StepTechnician } from "./step-technician"
import { StepAssign } from "./step-assign"
import { StepDone } from "./step-done"

function CallTimer() {
  const [sec, setSec] = useState(155) // 02:35 mẫu. TODO: nối thời lượng cuộc gọi thật
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="tabular-nums">
      {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}
    </span>
  )
}

function isValid(step: number, d: Draft) {
  switch (step) {
    case 1: return !!d.serviceId
    case 2: return !!d.deviceId && d.description.trim().length >= 10
    case 3:
      return (
        d.phone.replace(/\D/g, "").length >= 10 &&
        !!d.customerName.trim() &&
        !!d.address.trim() &&
        !!d.slotId &&
        (d.timeMode === "asap" || !!d.date)
      )
    case 4: return !!d.technicianId
    case 5: return d.assignMode === "auto" || (!!d.manualReason && !!d.callResult)
    default: return false
  }
}

export function CreateOrderWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [orderCode, setOrderCode] = useState("")

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const ok = isValid(step, draft)

  function next() {
    if (!ok) return
    if (step === 5) {
      // TODO: gọi API tạo đơn + gán thợ, lấy mã đơn thật từ response
      setOrderCode(`#DH-${String(Date.now()).slice(-5)}`)
    }
    setStep((s) => Math.min(6, s + 1))
  }
  const back = () => setStep((s) => Math.max(1, s - 1))

  function cancel() {
    if (window.confirm("Hủy yêu cầu đang tạo? Dữ liệu đã nhập sẽ không được lưu.")) router.push("/operator")
  }

  function reset() {
    setDraft(EMPTY_DRAFT)
    setStep(1)
  }

  // Ctrl + Enter để sang bước tiếp theo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && step < 6) {
        e.preventDefault()
        next()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ok, draft])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">Tạo yêu cầu sửa chữa</h1>
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Bước {step} / 6</span>
          </div>
        </div>
        <div className="space-y-1 text-right text-[11px] text-muted">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              <Phone className="size-3" /> Cuộc gọi: <CallTimer />
            </span>
            <span>Mã đơn hàng: <b className="text-ink">#DH-84920</b></span>
          </div>
          <div>Nhân viên tạo đơn hàng: <b className="text-ink">Trần Minh Đức </b></div>
        </div>
      </header>

      <OrderStepper step={step} />

      {step === 6 ? (
        <StepDone draft={draft} orderCode={orderCode} onNew={reset} />
      ) : step === 4 ? (
        <>
          <StepTechnician draft={draft} patch={patch} />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={back}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-field"
              >
                <ArrowLeft className="size-4" /> Quay lại
              </button>
              <button
                type="button"
                onClick={cancel}
                className="h-10 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                Hủy yêu cầu
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-muted sm:block">Nhấn Ctrl + Enter để tiếp tục</span>
              <button
                type="button"
                onClick={next}
                disabled={!ok}
                className="flex h-10 items-center gap-2 rounded-lg bg-cta px-5 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiếp tục <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
          <div>
            {step === 1 && <StepService draft={draft} patch={patch} />}
            {step === 2 && <StepIssue draft={draft} patch={patch} onChangeService={() => setStep(1)} />}
            {step === 3 && <StepCustomer draft={draft} patch={patch} />}
            {step === 5 && <StepAssign draft={draft} patch={patch} onChangeTech={() => setStep(4)} />}
          </div>
          <OrderSummary step={step} draft={draft} canContinue={ok} onBack={back} onNext={next} onCancel={cancel} />
        </div>
      )}
    </div>
  )
}