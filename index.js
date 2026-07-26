const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function fetchLao() {
  try {
    const res = await axios.get('https://laolotto.com/api/latest', { headers, timeout: 5000 });
    if (res.data) {
      return res.data;
    }
  } catch (err) {
    console.error('Lao fetch error:', err.message);
  }

  try {
    const res2 = await axios.get('https://news.sanook.com/lotto/check/0/laolotto/', { headers, timeout: 5000 });
    const match = res2.data.match(/class="lotto-check__number[^"]*">([\d]{6})</);
    if (match && match[1]) {
      const full = match[1];
      return {
        full: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2)
      };
    }
  } catch (err2) {
    console.error('Backup fetch error:', err2.message);
  }

  return { status: "pending", message: "กำลังรอผลออกหรืออัปเดตข้อมูล" };
}

app.get('/api', async (req, res) => {
  const type = req.query.type;
  
  if (type === 'lao') {
    const laoData = await fetchLao();
    return res.json({ status: "success", type: "lao", data: laoData });
  }

  res.json({ status: "error", message: "Invalid type parameter" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
