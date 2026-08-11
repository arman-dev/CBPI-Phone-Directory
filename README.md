# 📱 CBPI Phone Directory (PWA)

কক্সবাজার সরকারি পলিটেকনিক ইনস্টিটিউটের অফলাইন ফোন ডিরেক্টরি প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)।

## ✨ ফিচার
- 📞 **এক ট্যাপে কল** — কার্ড চাপলেই ডায়াল খুলবে
- ✉️ **ইমেইল** — ইমেইল আইকন থেকে মেইল পাঠানো যায়
- 🇧🇩 **বাংলা UI** — পুরো ইন্টারফেস বাংলায়
- 🔍 **স্মার্ট সার্চ** — নাম, পদবী, বিভাগ, মোবাইল, ইমেইল দিয়ে খোঁজা যায়
- 🏷️ **ডিপার্টমেন্ট ট্যাব** — প্রশাসন, সিভিল, কম্পিউটার, ইলেকট্রিক্যাল, আরএসি, ফুড, ট্যুরিজম, নন-টেক, কর্মচারী + 📦 আর্কাইভ
- 🖼️ **প্রোফাইল ছবি** — শিক্ষকদের ছবিসহ
- 🔠 **ফন্ট সাইজ (+/-)** — বড়/ছোট করা যায়
- 📲 **PWA ইনস্টল** — "Add to Home Screen" করে নেটিভ অ্যাপের মতো ব্যবহার
- 📡 **100% অফলাইন** — একবার লোড হলে ইন্টারনেট ছাড়াই চলবে
- 📤 **শেয়ার বাটন**
- ⬆️ **টপে ফিরে যাওয়ার বাটন**
- 🔐 **অ্যাডমিন প্যানেল** — `/admin.html` এ গিয়ে নতুন লোক যোগ/এডিট/আর্কাইভ করা যায়, তারপর data.js ডাউনলোড করে push করলে সবার ফোনে auto-আপডেট
- 📱 **Android + iPhone + Desktop** সব ডিভাইসে চলে

## 📂 ফাইল কাঠামো
```
cbpi_directory/
├── index.html          ← 📱 পাবলিক ডিরেক্টরি (সবার জন্য)
├── admin.html          ← 🔐 অ্যাডমিন প্যানেল (URL জানা ছাড়া কেউ পাবে না)
├── style.css           ← ডিজাইন
├── app.js              ← পাবলিক অ্যাপ লজিক
├── admin.js            ← অ্যাডমিন প্যানেল লজিক
├── data.js             ← 📊 সব কন্টাক্টের ডেটা (এই ফাইলেই সব নাম/নম্বর)
├── sw.js               ← Service Worker (অফলাইন ক্যাশ)
├── manifest.json       ← PWA ম্যানিফেস্ট
├── push.bat            ← 🚀 Windows-এ এক ক্লিকে git push
├── push.sh             ← Mac/Linux-এ এক ক্লিকে git push
├── init-repo.bat       ← প্রথমবার git repo তৈরির হেল্পার
├── images/
│   ├── logo.png
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon.svg
│   └── teachers/       ← শিক্ষক/অ্যাডমিন ছবি
├── ORGANOGRAM_NOTES.md ← পদের ক্রম/অর্গানোগ্রাম নোট
└── README.md
```

## 👥 বর্তমান ডেটা
- **প্রশাসন**: ১ জন (অধ্যক্ষ)
- **শিক্ষক**: ৫৫ জন (ছবিসহ) + ১ নতুন যোগ (হাছিনা আক্তার — ফুড বিভাগীয় প্রধান ২য় শিফট)
- **কর্মচারী**: ২৬ জন
- **মোট**: ৮৩ জন
- **আর্কাইভ**: ০ জন (খালি — ভবিষ্যতে যারা অবসর/বদলি হবেন তারা যাবেন)

## 🛠️ নতুন কন্টাক্ট যোগ / পরিবর্তন / আর্কাইভ (অ্যাডমিন)

সবচেয়ে সহজ উপায় (UI ব্যবহার করে):

1. ব্রাউজারে `/admin.html` খুলুন (যেমন: `https://cbpi-phone-directory.netlify.app/`)
2. "➕ নতুন যোগ" ট্যাবে ফরম পূরণ করুন — ছবি দিলে auto 220px JPEG-এ কমানো হবে
3. "তালিকায় যোগ করুন" চাপুন
4. ম্যানেজ ট্যাবে গিয়ে চাইলে ✏️ এডিট / 📦 আর্কাইভ / 🗑️ ডিলিট করতে পারেন
5. সব শেষে **"💾 data.js"** ট্যাবে গিয়ে "data.js ডাউনলোড" চাপুন
6. ডাউনলোড হওয়া `data.js` ফাইল দিয়ে প্রজেক্ট ফোল্ডারের পুরনো `data.js` রিপ্লেস করুন
7. `push.bat`-এ ডাবল ক্লিক করুন → GitHub-এ push → Netlify/GitHub Pages অটো-ডিপ্লয় → ৩০-৬০ সেকেন্ডে সবার ফোনে আপডেট পৌছে যাবে

বিকল্প (সরাসরি VS Code/Notepad দিয়ে):

`data.js` ফাইল খুলে নতুন এন্ট্রি যোগ করুন:
```js
{
  "sl": 202,
  "category": "teacher",            // teacher | staff | administration
  "bn_name": "বাংলা নাম",
  "name": "English Name",
  "bn_designation": "ইনস্ট্রাক্টর (টেক/ফুড)",
  "designation": "",
  "department": "ফুড টেকনোলজি",
  "dept_key": "food",                // administration | civil | computer | electrical | rac | food | tourism | nontech | office
  "mobile": "017xxxxxxxx",
  "email": "name@example.com",
  "image": "images/teachers/t_202.jpg"  // অথবা "" (null)
  // "archived": true               // আর্কাইভ করতে চাইলে এই লাইন যোগ করুন
}
```
কাউকে আর্কাইভ করতে চাইলে তার এন্ট্রিতে `"archived": true` যোগ করুন → মূল লিস্ট থেকে সরে "📦 আর্কাইভ" ট্যাবে চলে যাবে।

## 🌐 কিভাবে চালাবেন?

### লোকালি ডাবল-ক্লিকে
`index.html`-এ সরাসরি ডাবল-ক্লিক করুন — সবকিছু file:// protocol-তেই কাজ করবে (data.js `<script>` দিয়ে লোড হয় তাই CORS ঝামেলা নেই)। শুধু PWA ইনস্টল ও SW cache HTTPS বা localhost লাগবে।

### লোকাল সার্ভার (PWA টেস্টের জন্য)
```bash
cd cbpi_directory
python3 -m http.server 8080
# http://localhost:8080
```

### ডিপ্লয় (ফ্রি)
- **সবচেয়ে সহজ: Netlify Drop**: https://app.netlify.com/drop → পুরো ফোল্ডার টেনে ছেড়ে দিন, ৩০ সেকেন্ডে লাইভ!
- **GitHub Pages**: `init-repo.bat` চালিয়ে repo বানান → push → Settings → Pages → Deploy from `main`
- **Cloudflare Pages / Vercel**: একইভাবে

HTTPS-এ হোস্ট করলেই "Install app" / "Add to Home Screen" অপশন আসবে।

## 🚀 প্রথমবার GitHub + Auto-Deploy সেটআপ

1. GitHub-এ একটি নতুন খালি রিপোজিটরি তৈরি করুন (যেমন `your-username/cbpi-directory`)
2. `init-repo.bat`-এ ডাবল-ক্লিক করুন, repo URL প্রিন্ট করুন → প্রথম push হয়ে যাবে
3. Netlify-এ "Add new site → Import from Git" দিয়ে repo-টা কানেক্ট করুন
4. ব্যস! এরপর থেকে যখনই `push.bat` চাপবেন, সবকিছু auto-ডিপ্লয় হবে

## 📲 ফোনে ইনস্টল
- **Android (Chrome)**: ৩-ডট মেনু → "Install app" / "Add to Home screen"
- **iPhone (Safari)**: Share বাটন → "Add to Home Screen"

## 🔒 নিরাপত্তা
- `admin.html`-এ কোনো পিন সিস্টেম নেই — কারণ index.html থেকে কোনো লিঙ্ক নেই, শুধু URL টাইপ করলে পাওয়া যায়। Netlify deploy করার পর URL-টা নিজের কাছে রাখুন, কাউকে বলবেন না।
- কলিগরা কখনো এডিট বাটন/গিয়ার দেখবে না — শুধু ডিরেক্টরিটাই পাবে।
- সব ডেটা `data.js`-তে থাকে, কোনো ব্যাকএন্ড/ডাটাবেস নেই।

## 🔧 টেকনোলজি
- ভ্যানিলা HTML / CSS / JavaScript — কোনো framework নাই, হালকা, দ্রুত
- PWA: Service Worker + Web App Manifest
- Cache-first অফলাইন স্ট্র্যাটেজি; নতুন ভার্সনে SW cache নাম বাম্প করা হয় (v11, v12...)
