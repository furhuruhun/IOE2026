// Konten presentasi sementara untuk What's In. Judul dan deadline tetap berasal dari GET /events.
// Ganti deskripsi/ilustrasi di sini setelah materi resmi panitia tersedia.
export interface EventActivityContent {
  description: string;
  icon: string;
  palette: "mint" | "cyan" | "sage";
  rotation: "clockwise" | "counterclockwise";
  /** Path aset lokal di public/, misalnya /events/talkshow.webp. */
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  detailStatus: "coming-soon" | "available" | "unavailable";
}

const activityContentBySlug: Record<string, EventActivityContent> = {
  talkshow: {
    description: "Contoh deskripsi: ruang percakapan tentang gagasan dan tantangan maritim. Topik, pembicara, serta format acara akan mengikuti pengumuman resmi panitia.",
    icon: "mdi:forum-outline",
    palette: "mint",
    rotation: "clockwise",
    detailStatus: "available",
  },
  workshop: {
    description: "Contoh deskripsi: sesi belajar praktik untuk mengeksplorasi ide dan solusi maritim bersama. Materi, fasilitator, dan kapasitas akan diperbarui oleh panitia.",
    icon: "mdi:account-group-outline",
    palette: "cyan",
    rotation: "counterclockwise",
    detailStatus: "available",
  },
  "short-course": {
    description: "Contoh deskripsi: pembelajaran singkat untuk memperdalam wawasan di bidang maritim. Silabus, durasi, dan pengajar akan diumumkan kemudian.",
    icon: "mdi:school-outline",
    palette: "sage",
    rotation: "clockwise",
    detailStatus: "available",
  },
  exhibition: {
    description: "Contoh deskripsi: ruang untuk mengenal karya, teknologi, dan inisiatif ekosistem maritim. Peserta pameran dan aktivitas final menunggu konfirmasi panitia.",
    icon: "mdi:storefront-outline",
    palette: "mint",
    rotation: "counterclockwise",
    detailStatus: "available",
  },
};

const fallbackContent: EventActivityContent = {
  description: "Contoh deskripsi kegiatan. Rincian aktivitas dan manfaat untuk pengunjung akan ditambahkan setelah materi resmi tersedia.",
  icon: "mdi:calendar-star",
  palette: "cyan",
  rotation: "clockwise",
  detailStatus: "available",
};

export function getEventActivityContent(slug: string): EventActivityContent {
  return activityContentBySlug[slug] ?? fallbackContent;
}
