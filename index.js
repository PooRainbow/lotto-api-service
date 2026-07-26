const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// --- ฟังก์ชันดึงหวยลาวพัฒนา ---
async function fetchLao() {
  try {
    const res = await axios.get('https://api.ruay.org/v1/lao', { headers, timeout: 5000 });
    if (res.data && res.data.result) {
      const full = String(res.data.result).trim();
      return {
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2),
        date: res.data.date || ""
      };
    }
  } catch (err) {
    // สำรอง API สำรอง 1
    try {
      const resBackup = await axios.get('https://lotto-api.vercel.app/api/lao', { headers, timeout: 5000 });
      if (resBackup.data && resBackup.data.response) {
        const full = String(resBackup.data.response.result).trim();
        return {
          latest: full,
          top3: full.slice(-3),
          bottom2: full.slice(0, 2),
          date: resBackup.data.response.date || ""
        };
      }
    } catch (e) {
      console.error('Lao fetch error:', e.message);
    }
  }
  return { status: "error", message: "ดึงข้อมูลไม่สำเร็จ" };
}

// --- ฟังก์ชันดึงหวยฮานอยปกติ ---
async function fetchHanoi() {
  try {
    const res = await axios.get('https://api.ruay.org/v1/hanoi', { headers, timeout: 5000 });
    if (res.data && res.data.result) {
      const full = String(res.data.result).trim();
      return {
        latest: full,
        top3: full.slice(-3),
        bottom2: res.data.bottom2 || full.slice(-2),
        date: res.data.date || ""
      };
    }
  } catch (err) {
    // สำรอง API สำรอง 1
    try {
      const resBackup = await axios.get('https://lotto-api.vercel.app/api/hanoi', { headers, timeout: 5000 });
      if (resBackup.data && resBackup.data.response) {
        const full = String(resBackup.data.response.result).trim();
        return {
          latest: full,
          top3: full.slice(-3),
          bottom2: resBackup.data.response.bottom2 || full.slice(-2),
          date: resBackup.data.response.date || ""
        };
      }
    } catch (e) {
      console.error('Hanoi fetch error:', e.message);
    }
  }
  return { status: "error", message: "ดึงข้อมูลไม่สำเร็จ" };
}

// --- หน้าแสดงผล Web UI ---
app.get('/', async (req, res) => {
  const laoData = await fetchLao();
  const hanoiData = await fetchHanoi();

  res.send(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lotto Data Service</title>
      <style>
        body { font-family: sans-serif; background: #0f172a; color: #fff; padding: 20px; margin: 0; }
        .container { max-width: 450px; margin: 0 auto; }
        h2 { text-align: center; color: #38bdf8; font-size: 22px; margin-bottom: 25px; }
        .card { background: #1e293b; padding: 20px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 1px solid #334155; }
        .card-header { font-size: 20px; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .num-main { font-size: 38px; font-weight: bold; color: #34d399; text-align: center; margin: 10px 0; letter-spacing: 2px; }
        .sub-info { display: flex; justify-content: space-around; background: #0f172a; padding: 10px; border-radius: 8px; margin-top: 10px; }
        .sub-item { text-align: center; font-size: 14px; color: #94a3b8; }
        .sub-value { font-size: 18px; font-weight: bold; color: #fbbf24; margin-top: 4px; }
        .error-text { color: #f87171; text-align: center; font-size: 18px; padding: 15px 0; }
        .btn-link { display: block; text-align: center; background: #1e293b; border: 1px dashed #38bdf8; color: #38bdf8; padding: 12px; border-radius: 10px; text-decoration: none; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🚀 Lotto Data Service for App</h2>

        <!-- ลาวพัฒนา -->
        <div class="card">
          <div class="card-header">🇱🇦 ลาวพัฒนา</div>
          ${laoData.latest ? `
            <div class="num-main">${laoData.latest}</div>
            <div class="sub-info">
              <div class="sub-item">3 ตัวบน<div class="sub-value">${laoData.top3}</div></div>
              <div class="sub-item">2 ตัวล่าง<div class="sub-value">${laoData.bottom2}</div></div>
            </div>
          ` : `<div class="error-text">ดึงข้อมูลไม่สำเร็จ</div>`}
        </div>

        <!-- ฮานอยปกติ -->
        <div class="card">
          <div class="card-header">🇻🇳 ฮานอยปกติ</div>
          ${hanoiData.latest ? `
            <div class="num-main">${hanoiData.latest}</div>
            <div class="sub-info">
              <div class="sub-item">3 ตัวบน<div class="sub-value">${hanoiData.top3}</div></div>
              <div class="sub-item">2 ตัวล่าง<div class="sub-value">${hanoiData.bottom2}</div></div>
            </div>
          ` : `<div class="error-text">ดึงข้อมูลไม่สำเร็จ</div>`}
        </div>

        <a class="btn-link" href="/api?type=lao" target="_blank">🔗 คลิกเพื่อดูโครงสร้าง JSON API สำหรับส่งเข้าแอป</a>
      </div>
    </body>
    </html>
  `);
});

// --- API Router ---
app.get('/api', async (req, res) => {
  const type = req.query.type;
  if (type === 'lao') return res.json({ status: "success", type: "lao", data: await fetchLao() });
  if (type === 'hanoi') return res.json({ status: "success", type: "hanoi", data: await fetchHanoi() });
  res.json({ status: "error", message: "Invalid type. Use ?type=lao or ?type=hanoi" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
