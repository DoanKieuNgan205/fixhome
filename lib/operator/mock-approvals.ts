export type DocState = "pending" | "resubmit" | "approved" | "rejected"
export type SkillState = "pending" | "approved" | "missing" | "rejected"

export type ApprovalSkill = {
  id: string
  short: string // tên ngắn hiện ở danh sách
  name: string
  code: string
  kind: "Cốt lõi" | "Bổ sung"
  state: SkillState
  cert?: { title: string; experience: string }
  note?: string
}

export type ApprovalCase = {
  id: string
  code: string
  name: string
  phone: string
  district: string
  city: "HN" | "HCM"
  submittedAt: string // yyyy-mm-ddThh:mm
  waitLabel: string
  profile: { state: DocState; label: string }
  person: { dob: string; idNumber: string; hometown: string; address: string }
  skills: ApprovalSkill[]
}

const cert = (title: string, experience: string) => ({ title, experience })

const ac = (state: ApprovalSkill["state"] = "pending"): ApprovalSkill => ({
  id: "ac", short: "Điện lạnh", name: "Điện lạnh - Điều hòa dân dụng & Inverter",
  code: "#SKILL-AC-01", kind: "Cốt lõi", state,
  cert: cert("Giấy chứng nhận nghề Điện lạnh số 892/CĐKT", "5 năm thực tế tại trung tâm Daikin"),
})
const wm = (state: ApprovalSkill["state"] = "missing"): ApprovalSkill => ({
  id: "wm", short: "Máy giặt", name: "Sửa máy giặt lồng ngang",
  code: "#SKILL-WM-02", kind: "Bổ sung", state,
  note: "KTV chưa tải minh chứng giấy phép đào tạo hoặc kinh nghiệm sửa máy giặt.",
})
const heater = (state: ApprovalSkill["state"] = "pending"): ApprovalSkill => ({
  id: "ht", short: "Bình nước nóng", name: "Bình nước nóng & Hệ thống nhiệt",
  code: "#SKILL-HT-03", kind: "Bổ sung", state,
  cert: cert("Chứng chỉ Ariston Pro Tech", "3 năm lắp đặt bình nước nóng"),
})
const basic = (state: ApprovalSkill["state"] = "pending"): ApprovalSkill => ({
  id: "el", short: "Điện gia dụng cơ bản", name: "Điện gia dụng cơ bản",
  code: "#SKILL-EL-04", kind: "Cốt lõi", state,
  cert: cert("Chứng nhận nghề điện dân dụng", "2 năm kinh nghiệm"),
})
const vrf = (state: ApprovalSkill["state"] = "pending"): ApprovalSkill => ({
  id: "vrf", short: "Điện lạnh & VRF", name: "Điều hòa trung tâm VRF/VRV",
  code: "#SKILL-VRF-05", kind: "Cốt lõi", state,
  cert: cert("Chứng chỉ Daikin VRV Master", "6 năm thi công hệ thống VRV"),
})

const p = (dob: string, idNumber: string, hometown: string, address: string) => ({ dob, idNumber, hometown, address })

export const approvalCases: ApprovalCase[] = [
  { id: "1", code: "#KTV-HN-8902", name: "Nguyễn Hữu Thắng", phone: "0978.231.884", district: "Cầu Giấy", city: "HN", submittedAt: "2025-03-06T09:15", waitLabel: "Chờ 3 ngày",
    profile: { state: "pending", label: "CCCD & Lý lịch TP #2" },
    person: p("1992-05-14", "001092019842", "Hải Hậu, Nam Định", "42 Ngõ 175 Cầu Giấy, P. Dịch Vọng, Cầu Giấy, Hà Nội"),
    skills: [ac(), wm()] },
  { id: "2", code: "#KTV-HN-8900", name: "Vũ Đình Trọng", phone: "0912.445.671", district: "Đống Đa", city: "HN", submittedAt: "2025-03-07T14:30", waitLabel: "Chờ 2 ngày",
    profile: { state: "pending", label: "Ảnh chân dung & CCCD" },
    person: p("1990-11-02", "001090034521", "Thanh Trì, Hà Nội", "18 Ngõ 90 Chùa Bộc, Đống Đa, Hà Nội"),
    skills: [basic()] },
  { id: "3", code: "#KTV-HN-8911", name: "Hoàng Văn Nam", phone: "0983.112.509", district: "Thanh Xuân", city: "HN", submittedAt: "2025-03-07T16:05", waitLabel: "Chờ 2 ngày",
    profile: { state: "pending", label: "Chờ duyệt" },
    person: p("1994-02-21", "001094087712", "Hưng Yên", "27 Nguyễn Trãi, Thanh Xuân, Hà Nội"),
    skills: [{ ...ac(), id: "ac2" }, heater()] },
  { id: "4", code: "#KTV-SG-7712", name: "Đặng Quốc Tuấn", phone: "0934.567.890", district: "Quận 7", city: "HCM", submittedAt: "2025-03-08T08:40", waitLabel: "Chờ 1 ngày",
    profile: { state: "approved", label: "Đã duyệt" },
    person: p("1991-07-09", "079091022210", "Long An", "55 Huỳnh Tấn Phát, Quận 7, TP.HCM"),
    skills: [vrf(), { ...wm("pending"), cert: cert("Chứng chỉ Electrolux Service", "4 năm sửa máy giặt, sấy") }] },
  { id: "5", code: "#KTV-HN-8849", name: "Lê Thanh Bình", phone: "0904.321.765", district: "Ba Đình", city: "HN", submittedAt: "2025-03-08T10:10", waitLabel: "Chờ 1 ngày",
    profile: { state: "approved", label: "Đã duyệt" },
    person: p("1989-12-30", "001089055632", "Nghệ An", "9 Đội Cấn, Ba Đình, Hà Nội"),
    skills: [heater(), { ...ac(), id: "ac3" }] },
  { id: "6", code: "#KTV-SG-7688", name: "Phạm Hữu Trí", phone: "0918.776.543", district: "Bình Thạnh", city: "HCM", submittedAt: "2025-03-09T07:50", waitLabel: "Chờ 18h",
    profile: { state: "resubmit", label: "Nộp lại: Chờ duyệt" },
    person: p("1993-04-18", "079093041178", "Tiền Giang", "120 Điện Biên Phủ, Bình Thạnh, TP.HCM"),
    skills: [{ ...basic("approved"), short: "Điện dân dụng", name: "Điện dân dụng" }] },
  { id: "7", code: "#KTV-HN-6930", name: "Bùi Minh Khang", phone: "0967.889.012", district: "Nam Từ Liêm", city: "HN", submittedAt: "2025-03-05T11:00", waitLabel: "",
    profile: { state: "approved", label: "Pháp lý đã duyệt" },
    person: p("1995-08-25", "001095012345", "Bắc Ninh", "31 Mễ Trì, Nam Từ Liêm, Hà Nội"),
    skills: [wm()] },
  { id: "8", code: "#KTV-SG-7740", name: "Ngô Tấn Tài", phone: "0945.123.987", district: "Gò Vấp", city: "HCM", submittedAt: "2025-03-05T13:20", waitLabel: "",
    profile: { state: "approved", label: "Pháp lý đã duyệt" },
    person: p("1992-01-12", "079092077788", "Bình Định", "76 Quang Trung, Gò Vấp, TP.HCM"),
    skills: [wm()] },
  { id: "9", code: "#KTV-HN-8920", name: "Trần Quang Huy", phone: "0976.554.332", district: "Hoàng Mai", city: "HN", submittedAt: "2025-03-08T15:45", waitLabel: "Chờ 1 ngày",
    profile: { state: "pending", label: "CCCD" },
    person: p("1996-03-03", "001096044411", "Thái Bình", "14 Định Công, Hoàng Mai, Hà Nội"),
    skills: [] },
  { id: "10", code: "#KTV-SG-7750", name: "Lý Thanh Sơn", phone: "0933.221.668", district: "Quận 1", city: "HCM", submittedAt: "2025-03-09T09:30", waitLabel: "Chờ 16h",
    profile: { state: "approved", label: "Đã duyệt" },
    person: p("1990-06-06", "079090099123", "Cần Thơ", "8 Lê Lợi, Quận 1, TP.HCM"),
    skills: [basic()] },
  { id: "11", code: "#KTV-HN-8931", name: "Đinh Công Minh", phone: "0982.100.455", district: "Tây Hồ", city: "HN", submittedAt: "2025-03-04T10:00", waitLabel: "",
    profile: { state: "approved", label: "Pháp lý đã duyệt" },
    person: p("1991-10-10", "001091066554", "Phú Thọ", "5 Xuân Diệu, Tây Hồ, Hà Nội"),
    skills: [heater("missing")] },
  { id: "12", code: "#KTV-SG-7761", name: "Võ Hoài Nam", phone: "0908.765.432", district: "Tân Bình", city: "HCM", submittedAt: "2025-03-09T11:15", waitLabel: "Chờ 14h",
    profile: { state: "pending", label: "CCCD & Lý lịch TP #1" },
    person: p("1993-09-19", "079093055889", "Quảng Ngãi", "22 Cộng Hòa, Tân Bình, TP.HCM"),
    skills: [ac()] },
]