export const KPIS = [
  {
    id: 1,
    title: 'Kode Sesuai Design & Update Issue Git',
    desc: 'Pastikan kode yang diimplementasikan sesuai dengan design yang telah disepakati dan 100% terdokumentasi (update) di issue Git terkait.',
  },
  {
    id: 2,
    title: 'Implementasi AI / Vibe Coding Sesuai Standar',
    desc: 'Implementasi menggunakan AI (vibe coding) harus mengikuti standar repository yang telah ditetapkan, termasuk struktur kode dan konvensi penamaan.',
  },
  {
    id: 3,
    title: 'Commit, Push, Branch & Pre-commit Sesuai Standar',
    desc: 'Semua aktivitas Git (commit message, nama branch, pre-commit hook) harus sesuai dengan standar yang berlaku di repository.',
  },
  {
    id: 4,
    title: 'Kode Lolos SonarQube Tanpa Blocker/Critical',
    desc: 'Hasil pemindaian SonarQube tidak boleh mengandung issue dengan severity blocker atau critical.',
  },
  {
    id: 5,
    title: 'Unit Testing Berjalan & Overdue Maksimal 2 Hari',
    desc: 'Unit test harus berjalan sesuai kebutuhan. Jika ada overdue, maksimal keterlambatan adalah 2 hari.',
  },
]

export const STATUS_OPTIONS = [
  { value: '', label: 'Pilih status…' },
  { value: 'tercapai', label: '✅ Tercapai', emoji: '✅' },
  { value: 'partial', label: '🟡 Tercapai Sebagian', emoji: '🟡' },
  { value: 'belum', label: '❌ Belum Tercapai', emoji: '❌' },
  { value: 'na', label: '➖ Tidak Berlaku', emoji: '➖' },
]

export const AI_MOCK = {
  1: {
    clarify: 'Halo! Untuk mengevaluasi poin ini, saya perlu informasi lebih detail. Bisakah Anda sebutkan:',
    questions: [
      'Design spesifik apa yang digunakan (misalnya, Figma, dokumen PRD, atau issue Git)?',
      'Kode mana yang diimplementasikan (file atau fitur)?',
      'Issue Git mana yang terkait (nomor atau link issue)?',
      'Apakah ada bukti bahwa issue telah di-update (komentar, checklist, atau perubahan status)?',
    ],
    result: {
      status: 'tercapai',
      catatan:
        'Kode yang diimplementasikan sesuai dengan design yang disepakati dan telah di-update di issue Git terkait. Tidak ada indikasi ketidaksesuaian atau issue yang terlewat. Pastikan untuk terus mendokumentasikan setiap perubahan di masa mendatang.',
      evidence: 'Issue Git terkait telah di-update dengan status selesai dan komentar implementasi.',
    },
  },
  2: {
    clarify: 'Untuk menilai vibe coding, saya butuh konteks tambahan:',
    questions: [
      'Tool AI apa yang digunakan (Copilot, Claude, Cursor, dll)?',
      'Apakah hasil generate AI sudah di-review manual?',
      'Bagian repository mana yang menggunakan AI assist?',
      'Apakah ada deviasi dari konvensi penamaan yang ada?',
    ],
    result: {
      status: 'tercapai',
      catatan:
        'Implementasi AI assist mengikuti standar repository. Struktur file dan konvensi penamaan konsisten dengan codebase existing. Review manual telah dilakukan sebelum merge.',
      evidence: 'Commit message menyebutkan AI-assisted, dan PR template terisi lengkap.',
    },
  },
  3: {
    clarify: 'Untuk evaluasi standar Git workflow:',
    questions: [
      'Format commit message apa yang dipakai (Conventional Commits, dll)?',
      'Naming pattern branch (feature/, bugfix/, dll)?',
      'Apakah pre-commit hook aktif dan lolos di semua commit minggu ini?',
    ],
    result: {
      status: 'partial',
      catatan:
        'Sebagian besar commit mengikuti standar Conventional Commits, namun ada 2 commit dengan format menyimpang. Branch naming dan pre-commit hook sudah konsisten.',
      evidence: 'Hasil audit commit history minggu ini: 18 dari 20 commit sesuai standar.',
    },
  },
  4: {
    clarify: 'Untuk memverifikasi hasil SonarQube:',
    questions: [
      'Project key di SonarQube?',
      'Tanggal scan terakhir?',
      'Apakah ada issue blocker/critical yang sudah ditangani lewat false-positive marker?',
    ],
    result: {
      status: 'tercapai',
      catatan:
        'Scan SonarQube terakhir menunjukkan 0 blocker dan 0 critical issue. Code smell minor masih ada namun di luar scope KPI ini.',
      evidence: 'Dashboard SonarQube: link screenshot, scan ID 4421.',
    },
  },
  5: {
    clarify: 'Untuk evaluasi unit testing:',
    questions: [
      'Coverage threshold yang ditargetkan?',
      'Apakah ada test yang overdue di minggu ini?',
      'Berapa hari keterlambatan maksimum yang tercatat?',
    ],
    result: {
      status: 'tercapai',
      catatan:
        'Semua unit test berjalan di CI. Keterlambatan maksimum tercatat 1 hari (di bawah threshold 2 hari). Coverage di angka 84%.',
      evidence: 'Pipeline CI log + test report bulan ini.',
    },
  },
}
