export type OperatorStatus = "active" | "locked" | "pending"

export type Operator = {
  id: string
  name: string
  phone: string
  email: string
  online: boolean
  lastSeen?: string
  ordersToday: number
  status: OperatorStatus
  createdAt: string
}

const people = [
  ["8821", "Trần Minh Đức", "0918423881", "duc.tran", 86],
  ["8802", "Lê Thị Bích Ngọc", "0972115482", "ngoc.le", 94],
  ["8815", "Vũ Quang Huy", "0904882321", "huy.vu", 68],
  ["8830", "Hoàng Lan Anh", "0936651982", "lananh.hoang", 52],
  ["8845", "Nguyễn Tuấn Kiệt", "0988223741", "kiet.nguyen", 79],
  ["8819", "Phạm Mai Dung", "0912449182", "dung.pham", 41],
  ["8799", "Đỗ Quốc Tuấn", "0945112812", "tuan.do", 0],
  ["8850", "Nguyễn Phương Linh", "0983445682", "linh.nguyen", 0],
  ["8851", "Bùi Thanh Sơn", "0901234567", "son.bui", 65],
  ["8852", "Đặng Thu Hà", "0912345678", "ha.dang", 47],
  ["8853", "Đinh Minh Anh", "0923456789", "minhanh.dinh", 58],
  ["8854", "Phan Hoài Nam", "0934567890", "nam.phan", 72],
  ["8855", "Trương Ngọc Mai", "0945678901", "mai.truong", 36],
  ["8856", "Võ Thành Đạt", "0956789012", "dat.vo", 81],
  ["8857", "Lý Thảo Vy", "0967890123", "vy.ly", 54],
  ["8858", "Hồ Đức Anh", "0978901234", "ducanh.ho", 62],
  ["8859", "Dương Hải Yến", "0989012345", "yen.duong", 43],
  ["8860", "Trần Gia Bảo", "0909123456", "bao.tran", 88],
  ["8861", "Lê Khánh Chi", "0918234567", "chi.le", 49],
  ["8862", "Nguyễn Văn Hùng", "0927345678", "hung.nguyen", 67],
  ["8863", "Phạm Minh Tâm", "0936456789", "tam.pham", 39],
  ["8864", "Vũ Thu Trang", "0945567890", "trang.vu", 73],
  ["8865", "Đỗ Anh Khoa", "0954678901", "khoa.do", 56],
  ["8866", "Bùi Ngọc Hân", "0963789012", "han.bui", 45],
  ["8867", "Hoàng Nhật Minh", "0972890123", "minh.hoang", 61],
  ["8868", "Đặng Bảo Ngọc", "0981901234", "baongoc.dang", 51],
  ["8869", "Phan Thanh Tùng", "0902012345", "tung.phan", 0],
  ["8870", "Võ Hà My", "0913123456", "my.vo", 0],
] as const

export const mockOperators: Operator[] = people.map(([id, name, phone, email, orders], index) => {
  const status: OperatorStatus = index === 6 || index === 26 ? "locked" : index === 7 || index === 27 ? "pending" : "active"
  return {
    id, name, phone, email: `${email}@homefix.vn`, status,
    online: status === "active" && index !== 3 && index !== 5,
    lastSeen: index === 3 ? "45 phút trước" : index === 5 ? "3 giờ trước" : undefined,
    ordersToday: orders,
    createdAt: index < 8 ? "2026-11-03" : "2026-10-15",
  }
})
