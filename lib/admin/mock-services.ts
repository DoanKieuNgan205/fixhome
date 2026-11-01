export type Category = {
  id: string
  name: string
  subtitle: string
  tone: "cyan" | "indigo" | "amber" | "green" | "purple"
  icon: "snowflake" | "droplets" | "utensils" | "house" | "tv"
  active: boolean
  description?: string
  image?: string
}

export type Device = {
  id: string
  name: string
  desc: string
  categoryId: string
  active: boolean
  image?: string
}

export const categories: Category[] = [
  { id: "cooling", name: "Điện lạnh", subtitle: "6 thiết bị chính", tone: "cyan", icon: "snowflake", active: true },
  { id: "plumbing", name: "Điện nước", subtitle: "9 thiết bị & linh kiện", tone: "indigo", icon: "droplets", active: true },
  { id: "kitchen", name: "Điện gia dụng nhà bếp", subtitle: "6 thiết bị", tone: "amber", icon: "utensils", active: true },
  { id: "living", name: "Điện gia dụng sinh hoạt", subtitle: "4 thiết bị", tone: "green", icon: "house", active: true },
  { id: "tech", name: "Thiết bị điện tử & Nghe nhìn", subtitle: "5 thiết bị công nghệ", tone: "purple", icon: "tv", active: true },
]

export const devices: Device[] = [
  { id: "d1", name: "Điều hòa", desc: "Treo tường, Multi, Âm trần cassette, Áp trần", categoryId: "cooling", active: true, image: "/images/devices/dieu-hoa.jpg" },
  { id: "d2", name: "Tủ lạnh, tủ đông, tủ mát", desc: "Inverter, Side by side, tủ đông trữ hàng, mini", categoryId: "cooling", active: true },
  { id: "d3", name: "Máy giặt", desc: "Cửa ngang (Front Load), cửa trên (Top Load), công nghiệp", categoryId: "cooling", active: true },
  { id: "d4", name: "Máy sấy quần áo", desc: "Thông hơi, ngưng tụ, bơm nhiệt Heatpump", categoryId: "cooling", active: true },
  { id: "d5", name: "Bình nóng lạnh", desc: "Gián tiếp, trực tiếp, năng lượng mặt trời", categoryId: "cooling", active: true },
  { id: "d6", name: "Máy lọc nước, cây nước nóng lạnh", desc: "RO, Nano, UF, Cây nước tích hợp văn phòng", categoryId: "cooling", active: true },

  { id: "d7", name: "Máy bơm nước", desc: "Bơm tăng áp, bơm chìm, bơm đẩy cao", categoryId: "plumbing", active: true },
  { id: "d8", name: "Ống nước & van khóa", desc: "Thay ống, xử lý rò rỉ, thay van", categoryId: "plumbing", active: true },
  { id: "d9", name: "Thiết bị vệ sinh", desc: "Bồn cầu, lavabo, sen vòi", categoryId: "plumbing", active: true },
  { id: "d10", name: "Hệ thống điện dân dụng", desc: "Aptomat, ổ cắm, đường dây", categoryId: "plumbing", active: false },

  { id: "d11", name: "Bếp từ, bếp hồng ngoại", desc: "Bếp đơn, bếp đôi, bếp âm", categoryId: "kitchen", active: true },
  { id: "d12", name: "Lò vi sóng, lò nướng", desc: "Lò vi sóng, lò nướng điện, nồi chiên không dầu", categoryId: "kitchen", active: true },
  { id: "d13", name: "Máy hút mùi", desc: "Hút mùi áp tường, âm tủ, đảo", categoryId: "kitchen", active: true },
  { id: "d14", name: "Máy rửa bát", desc: "Độc lập, âm tủ", categoryId: "kitchen", active: false },

  { id: "d15", name: "Quạt, quạt điều hòa", desc: "Quạt đứng, quạt trần, quạt hơi nước", categoryId: "living", active: true },
  { id: "d16", name: "Máy hút bụi", desc: "Hút bụi cầm tay, robot hút bụi", categoryId: "living", active: true },
  { id: "d17", name: "Bàn ủi, nồi cơm điện", desc: "Bàn ủi hơi nước, nồi cơm cao tần", categoryId: "living", active: true },

  { id: "d18", name: "Tivi", desc: "LED, OLED, QLED, Smart TV", categoryId: "tech", active: true },
  { id: "d19", name: "Dàn âm thanh, loa", desc: "Loa soundbar, loa kéo, dàn karaoke", categoryId: "tech", active: true },
  { id: "d20", name: "Camera, chuông cửa", desc: "Camera IP, chuông cửa có hình", categoryId: "tech", active: true },
  { id: "d21", name: "Modem, thiết bị mạng", desc: "Wifi mesh, router, switch", categoryId: "tech", active: false },
]