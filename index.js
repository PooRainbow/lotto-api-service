const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

// --- 1. ฟังก์ชันดึงหวยลาวพัฒนา ---
async function fetchLao() {
  try {
    const res = await axios.get('https://api.stateless.co.th/lao-lotto/latest', { headers, timeout: 5000 });
    if (res.data && res.data.result) {
      const full = String(res.data.result);
      return {
        name: "ลาวพัฒนา",
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2),
        date: res.data.date || ""
      };
    }
  } catch (err) {
    console.error('Lao primary error:', err.message);
  }

  // Backup Endpoint
  try {
    const res = await axios.get('https://open-api.my-lotto.net/lao/latest', { headers, timeout: 5000 });
    if (res.data && res.data.number) {
      const full = String(res.data.number);
      return {
        name: "ลาวพัฒนา",
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2)
      };
    }
  } catch (err) {
    console.error('Lao backup error:', err.message);
  }

  return { name: "ลาวพัฒนา", status: "error", message: "ไม่สามารถดึงข้อมูลได้ในขณะนี้" };
}

// --- 2. ฟังก์ชันดึงหวยฮานอยปกติ ---
async function fetchHanoi() {
  try {
    const res = await axios.get('https://api.stateless.co.th/hanoi-lotto/latest', { headers, timeout: 5000 });
    if (res.data && res.data.result) {
      const full = String(res.data.result);
      return {
        name: "ฮานอยปกติ",
        latest: full,
        top3: full.slice(-3),
        bottom2: res.data.bottom2 || full.slice(-2),
        date: res.data.date || ""
      };
    }
  } catch (err) {
    console.error('Hanoi primary error:', err.message);
  }

  // Backup Endpoint
  try {
    const res = await axios.get('https://open-api.my-lotto.net/hanoi/latest', { headers, timeout: 5000 });
    if (res.data && res.data.number) {
      const full = String(res.data.number);
      return {
        name: "ฮานอยปกติ",
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(-2)
      };
    }
  } catch (err) {
    console.error('Hanoi backup error:', err.message);
  }

  return { name: "ฮานอยปกติ", status: "error", message: "ไม่สามารถดึงข้อมูลได้ในขณะนี้" };
}

// --- API Routing ---
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
