# Aplikasi Manajemen Survey Kesehatan Gigi dan Mulut

Aplikasi berbasis web untuk manajemen data survey kesehatan gigi dan mulut sesuai standar WHO dengan odontogram interaktif.

## Fitur Utama

### 1. Form Input Data Pasien
- **Nama Pasien**: Input teks untuk nama lengkap pasien
- **Tanggal Lahir**: Date picker untuk tanggal lahir
- **Jenis Kelamin**: Radio button untuk Laki-laki/Perempuan
- **Pekerjaan**: Input teks untuk pekerjaan/orang tua
- **Umur**: Input angka untuk umur dalam tahun
- **Alamat Tinggal**: Textarea untuk alamat lengkap
- **Agama**: Dropdown select dengan pilihan lengkap (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, Lainnya)
- **Tanggal Pemeriksaan**: Date picker dengan default hari ini

### 2. Odontogram Interaktif WHO
#### Gigi Tetap (Dewasa)
- **Kode Kondisi**: 0-9 sesuai standar WHO
- **Penomoran**: 11-28 (rahang atas), 31-48 (rahang bawah)

#### Gigi Susu (Anak)
- **Kode Kondisi**: A-G sesuai standar WHO
- **Penomoran**: 51-65 (rahang atas), 71-85 (rahang bawah)

#### Layout Odontogram
- **Rahang Atas**: Gigi susu di atas gigi tetap
- **Rahang Bawah**: Gigi susu di bawah gigi tetap
- **Warna**: Kode warna berbeda untuk setiap kondisi
- **Interaktif**: Klik untuk memilih kondisi gigi

### 3. Kode Kondisi Gigi

#### Gigi Tetap (Dewasa)
| Kode | Keterangan |
|------|------------|
| 0 | Sehat |
| 1 | Gigi Berlubang/Karies |
| 2 | Tumpatan dengan karies |
| 3 | Tumpatan tanpa karies |
| 4 | Gigi dicabut karena karies |
| 5 | Gigi dicabut karena sebab lain |
| 6 | Fissure Sealant |
| 7 | Protesa cekat/mahkota cekat/implan/veneer |
| 8 | Gigi tidak tumbuh |
| 9 | Lain-lain |

#### Gigi Susu (Anak)
| Kode | Keterangan |
|------|------------|
| A | Sehat |
| B | Gigi Berlubang/Karies |
| C | Tumpatan dengan karies |
| D | Tumpatan tanpa karies |
| E | Gigi dicabut karena karies |
| F | Fissure Sealant |
| G | Protesa cekat/mahkota cekat/implan/veneer |

### 4. Manajemen Data & Kunjungan
- **Simpan Data**: Menyimpan data pasien ke localStorage
- **Tracking Kunjungan**: Otomatis menghitung jumlah kunjungan per pasien
- **Riwayat Kunjungan**: Menyimpan semua data kunjungan per pasien
- **Lihat Data**: Menampilkan semua data tersimpan dengan info kunjungan
- **Export Data**: Export data per pasien atau semua data termasuk riwayat kunjungan
- **Hapus Data**: Menghapus data pasien tertentu
- **Reset Form**: Mengosongkan form dan odontogram

## Cara Penggunaan

### 1. Input Data Pasien
1. Buka aplikasi di browser
2. Isi form data pasien dengan lengkap
3. Pastikan semua field terisi sebelum menyimpan

### 2. Mengisi Odontogram
1. Klik pada gigi yang ingin diperiksa
2. Pilih kondisi gigi dari modal yang muncul
3. Gigi akan berubah warna sesuai kondisi yang dipilih
4. Ulangi untuk semua gigi yang perlu diperiksa

### 3. Menyimpan Data
1. Klik tombol "Simpan Data" setelah mengisi form dan odontogram
2. Data akan tersimpan otomatis di browser
3. Notifikasi akan muncul untuk konfirmasi

### 4. Melihat Data Tersimpan
1. Klik tombol "Lihat Data Tersimpan"
2. Data akan ditampilkan dalam bentuk kartu pasien
3. Setiap kartu berisi informasi pasien dan ringkasan kondisi gigi

### 5. Export Data
- **Per Pasien**: Klik tombol "Export Data" di kartu pasien
- **Semua Data**: Klik tombol "Export Semua Data" di bagian bawah
- Format export: CSV untuk semua data, TXT untuk laporan detail

## Teknis

### Struktur File
```
├── index.html          # Halaman utama aplikasi
├── styles.css          # Styling dan responsive design
├── script.js           # Logika aplikasi dan interaktivitas
└── README.md          # Dokumentasi aplikasi
```

### Teknologi yang Digunakan
- **HTML5**: Struktur aplikasi
- **CSS3**: Styling dengan gradient dan responsive design
- **JavaScript ES6+**: Logika aplikasi dan interaktivitas
- **LocalStorage**: Penyimpanan data lokal
- **Google Fonts**: Inter font untuk typography modern

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers

## Instalasi dan Menjalankan

### Metode 1: Python HTTP Server
```bash
# Jalankan server lokal
python3 -m http.server 8000

# Buka di browser
http://localhost:8000
```

### Metode 2: Live Server (VS Code)
1. Install extension "Live Server" di VS Code
2. Klik kanan pada file `index.html`
3. Pilih "Open with Live Server"

### Metode 3: Direct File
1. Buka file `index.html` langsung di browser
2. Beberapa fitur mungkin terbatas kamanan browser

## Fitur Tambahan

### 1. Responsive Design
- Desktop: Layout grid 2 kolom
- Tablet: Layout single column
- Mobile: Layout kompak dengan scroll horizontal untuk odontogram

### 2. Accessibility
- Keyboard navigation dengan Tab
- ARIA labels untuk screen readers
- Kontras warna yang memadai

### 3. Animasi dan Transisi
- Hover effects pada gigi
- Smooth scrolling
- Modal transitions
- Notification animations

### 4. Validasi Data
- Validasi form sebelum penyimpanan
- Validasi tanggal lahir
- Peringatan untuk data yang belum lengkap

## Troubleshooting

### Masalah Umum

**Gigi tidak bisa diklik**
- Pastikan JavaScript diaktifkan di browser
- Cek console untuk error messages

**Data tidak tersimpan**
- Pastikan localStorage diizinkan di browser
- Cek kapasitas penyimpanan browser

**Odontogram tidak muncul**
- Refresh halaman (Ctrl+F5)
- Cek koneksi internet untuk Google Fonts

### Reset Aplikasi
Untuk menghapus semua data:
1. Buka Developer Tools (F12)
2. Buka tab Console
3. Jalankan: `localStorage.clear()`
4. Refresh halaman

## Kontribusi
Aplikasi ini dikembangkan untuk kebutuhan survey kesehatan gigi dan mulut sesuai standar WHO. Untuk kontribusi atau pertanyaan, silakan hubungi pengembang.

## Lisensi
Aplikasi ini open source untuk keperluan edukasi dan survey kesehatan masyarakat.
