const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// --- Helper Functions สำหรับแปลงและจัดรูปแบบข้อมูลเข้าแอป ---
function formatDigits(fullNumber) {
  const str = String(fullNumber || '').trim();
  const digitsOnly = str.replace(/\D/g, ''); // กรองเอาเฉพาะตัวเลข
  
  if (!digitsOnly) return null;

  // แยกรายตัวอักษรเป็น Array เพื่อนำไปเข้าสูตรคำนวณแบบ Array Operations ได้ทันที
  const digitsArray = digitsOnly.split('').map(Number);

  return {
    raw: str,
    clean_number: digitsOnly,
    length: digitsOnly.length,
    digits_array: digitsArray, // [1, 2, 3, 4, 5, 6]
    top3: digitsOnly.slice(-3),
    bottom2: digitsOnly.length >= 5 ? digitsOnly.slice(0, 2) : digitsOnly.slice(-2),
    top2: digitsOnly.slice(-2),
    digit_sum: digitsArray.reduce((a, b) => a + b, 0) // ผลรวมทุกหลัก
  };
}

// --- ฟังก์ชันดึงหวยลาวพัฒนา ---
async function fetchLao() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/LottoAPI/lao-lotto/main/latest.json', { headers, timeout: 5000 });
    const rawNum = res.data?.number || res.data?.latest;
    if (rawNum) {
      return {
        success: true,
        type: 'lao',
        title: 'ลาวพัฒนา',
        draw_date: res.data.date || new Date().toISOString().split('T')[0],
        result: formatDigits(rawNum)
      };
    }
  } catch (err) {
    console.error('Lao fetch error:', err.message);
  }
  return { success: false, type: 'lao', error: 'Unable to fetch Lao data' };
}

// --- ฟังก์ชันดึงหวยฮานอยปกติ ---
async function fetchHanoi() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/LottoAPI/hanoi-lotto/main/latest.json', { headers, timeout: 5000 });
    const rawNum = res.data?.number || res.data?.latest;
    if (rawNum) {
      return {
        success: true,
        type: 'hanoi',
        title: 'ฮานอยปกติ',
        draw_date: res.data.date || new Date().toISOString().split('T')[0],
        result: formatDigits(rawNum)
      };
    }
  } catch (err) {
    console.error('Hanoi fetch error:', err.message);
  }
  return { success: false, type: 'hanoi', error: 'Unable to fetch Hanoi data' };
}

// ==========================================
// 1. Endpoint สำหรับหน้าเว็บ Preview (ดูผ่านเบราว์เซอร์)
// ==========================================
app.get('/', async (req, res) => {
  const lao = await fetchLao();
  const hanoi = await fetchHanoi();

  res.send(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lotto API Dashboard</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { text-align: center; color: #38bdf8; font-size: 22px; margin-bottom: 25px; }
        .card { background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); border: 1px solid #334155; }
        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px; }
        .title { font-size: 18px; font-weight: bold; color: #f1f5f9; }
        .date { font-size: 12px; color: #94a3b8; }
        .number-main { font-size: 38px; font-weight: 800; color: #4ade80; text-align: center; letter-spacing: 4px; margin: 10px 0; }
        .grid-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-top: 15px; }
        .grid-item { background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b; }
        .grid-label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
        .grid-value { font-size: 16px; font-weight: bold; color: #facc15; }
        .api-link { display: block; text-align: center; color: #38bdf8; text-decoration: none; font-size: 13px; margin-top: 15px; background: #1e293b; padding: 10px; border-radius: 8px; border: 1px dashed #38bdf8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Lotto Data Service for App</h1>
        
        <!-- ลาวพัฒนา -->
        <div class="card">
          <div class="card-header">
            <span class="title">🇱🇦 ลาวพัฒนา</span>
            <span class="date">${lao.draw_date || '-'}</span>
          </div>
          ${lao.success ? `
            <div class="number-main">${lao.result.clean_number}</div>
            <div class="grid-details">
              <div class="grid-item"><div class="grid-label">3 ตัวบน</div><div class="grid-value">${lao.result.top3}</div></div>
              <div class="grid-item"><div class="grid-label">2 ตัวล่าง</div><div class="grid-value">${lao.result.bottom2}</div></div>
              <div class="grid-item"><div class="grid-label">ผลรวมหลัก</div><div class="grid-value">${lao.result.digit_sum}</div></div>
            </div>
          ` : '<div style="color:#ef4444; text-align:center;">ดึงข้อมูลไม่สำเร็จ</div>'}
        </div>

        <!-- ฮานอยปกติ -->
        <div class="card">
          <div class="card-header">
            <span class="title">🇻🇳 ฮานอยปกติ</span>
            <span class="date">${hanoi.draw_date || '-'}</span>
          </div>
          ${hanoi.success ? `
            <div class="number-main">${hanoi.result.clean_number}</div>
            <div class="grid-details">
              <div class="grid-item"><div class="grid-label">3 ตัวบน</div><div class="grid-value">${hanoi.result.top3}</div></div>
              <div class="grid-item"><div class="grid-label">2 ตัวล่าง</div><div class="grid-value">${hanoi.result.bottom2}</div></div>
              <div class="grid-item"><div class="grid-label">ผลรวมหลัก</div><div class="grid-value">${hanoi.result.digit_sum}</div></div>
            </div>
          ` : '<div style="color:#ef4444; text-align:center;">ดึงข้อมูลไม่สำเร็จ</div>'}
        </div>

        <a class="api-link" href="/api?type=all" target="_blank">🔗 คลิกเพื่อดูโครงสร้าง JSON API สำหรับส่งเข้าแอป</a>
      </div>
    </body>
    </html>
  `);
});

// ==========================================
// 2. API Endpoints สำหรับส่ง Payload เข้าแอปพลิเคชัน
// ==========================================
app.get('/api', async (req, res) => {
  const type = req.query.type;

  // ดึงทั้งหมดทีเดียว (แนะนำสำหรับตัวแอปพลิเคชัน)
  if (type === 'all' || !type) {
    const [lao, hanoi] = await Promise.all([fetchLao(), fetchHanoi()]);
    return res.json({
      timestamp: new Date().toISOString(),
      services: {
        lao,
        hanoi
      }
    });
  }

  if (type === 'lao') return res.json(await fetchLao());
  if (type === 'hanoi') return res.json(await fetchHanoi());

  res.status(400).json({ success: false, error: 'Invalid type requested' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
