const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// --- ดึงผลหวยลาวพัฒนางวดล่าสุดที่ออกแล้ว ---
async function fetchLao() {
  try {
    // ดึงข้อมูลย้อนหลังล่าสุดจาก Open API
    const res = await axios.get('https://raw.githubusercontent.com/lotto-data/lao-lotto/main/latest.json', { headers, timeout: 5000 });
    if (res.data && res.data.number) {
      const full = String(res.data.number).trim();
      return {
        name: "ลาวพัฒนา",
        draw_date: res.data.date || "งวดล่าสุด",
        latest: full,                      // เช่น "894123"
        top3: full.slice(-3),              // 3 ตัวบน (เช่น "123")
        bottom2: full.slice(0, 2)           // 2 ตัวล่าง (เช่น "89")
      };
    }
  } catch (err) {
    console.error('Lao primary fetch error:', err.message);
  }

  // แหล่งสำรองกรณีแหล่งหลักดึงไม่ได้ (Fallback JSON)
  try {
    const res2 = await axios.get('https://api.allorigins.win/raw?url=https://lotto.geeky.in.th/api/lao', { headers, timeout: 5000 });
    if (res2.data && res2.data.result) {
      const full = String(res2.data.result).trim();
      return {
        name: "ลาวพัฒนา",
        draw_date: res2.data.date || "งวดล่าสุด",
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2)
      };
    }
  } catch (err2) {
    console.error('Lao secondary fetch error:', err2.message);
  }

  return { status: "error", message: "ไม่สามารถดึงข้อมูลผลล่าสุดได้" };
}

// --- ดึงผลหวยฮานอยปกติตงวดล่าสุดที่ออกแล้ว ---
async function fetchHanoi() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/lotto-data/hanoi-lotto/main/latest.json', { headers, timeout: 5000 });
    if (res.data && res.data.number) {
      const full = String(res.data.number).trim();
      return {
        name: "ฮานอยปกติ",
        draw_date: res.data.date || "งวดล่าสุด",
        latest: full,                       // เช่น "54321"
        top3: full.slice(-3),               // 3 ตัวบน (เช่น "321")
        bottom2: res.data.bottom2 || full.slice(0, 2) // 2 ตัวล่าง
      };
    }
  } catch (err) {
    console.error('Hanoi primary fetch error:', err.message);
  }

  return { status: "error", message: "ไม่สามารถดึงข้อมูลผลล่าสุดได้" };
}

// --- Routing ---
app.get('/api', async (req, res) => {
  const type = req.query.type;

  if (type === 'lao') {
    const laoData = await fetchLao();
    return res.json({ status: "success", type: "lao", data: laoData });
  }

  if (type === 'hanoi') {
    const hanoiData = await fetchHanoi();
    return res.json({ status: "success", type: "hanoi", data: hanoiData });
  }

  res.json({
    status: "error",
    message: "โปรดระบุ parameter ?type=lao หรือ ?type=hanoi"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
  if (type === 'hanoi') {
    const hanoiData = await fetchHanoi();
    return res.json({ status: "success", type: "hanoi", data: hanoiData });
  }

  res.json({ 
    status: "error", 
    message: "โปรดระบุ parameter ?type=lao หรือ ?type=hanoi" 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
