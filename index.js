const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

// --- ฟังก์ชันดึงหวยลาวพัฒนา ---
async function fetchLao() {
  try {
    const res = await axios.get('https://news.sanook.com/lotto/check/0/laolotto/', { headers, timeout: 5000 });
    const html = res.data;
    const match = html.match(/class="lotto-check__number[^"]*">([\d]{4,6})</);
    if (match && match[1]) {
      const full = match[1];
      return {
        name: "ลาวพัฒนา",
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2)
      };
    }
  } catch (err) {
    console.error('Lao fetch error:', err.message);
  }

  return { name: "ลาวพัฒนา", status: "error", message: "ไม่สามารถดึงข้อมูลได้ในขณะนี้" };
}

// --- ฟังก์ชันดึงหวยฮานอยปกติ ---
async function fetchHanoi() {
  try {
    const res = await axios.get('https://news.sanook.com/lotto/check/0/hanoilotto/', { headers, timeout: 5000 });
    const html = res.data;
    const match = html.match(/class="lotto-check__number[^"]*">([\d]{3,5})</g);
    if (match) {
      // ดึงตัวเลขทั้งหมดที่เจอในหน้าผลฮานอย
      const numbers = match.map(m => m.replace(/\D/g, ''));
      if (numbers.length >= 1) {
        const full = numbers[0];
        return {
          name: "ฮานอยปกติ",
          latest: full,
          top3: full.slice(-3),
          bottom2: numbers[1] ? numbers[1].slice(-2) : full.slice(0, 2)
        };
      }
    }
  } catch (err) {
    console.error('Hanoi fetch error:', err.message);
  }

  return { name: "ฮานอยปกติ", status: "error", message: "ไม่สามารถดึงข้อมูลได้ในขณะนี้" };
}

// --- API Endpoint ---
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
