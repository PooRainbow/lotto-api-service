const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function fetchLao() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/LottoAPI/lao-lotto/main/latest.json', { headers, timeout: 5000 });
    if (res.data && (res.data.number || res.data.latest)) {
      const full = String(res.data.number || res.data.latest).trim();
      return {
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2),
        date: res.data.date || ""
      };
    }
  } catch (err) {
    console.error('Lao error:', err.message);
  }
  return { status: "error", message: "Fetch failed" };
}

app.get('/api', async (req, res) => {
  const type = req.query.type;
  if (type === 'lao') {
    const laoData = await fetchLao();
    return res.json({ status: "success", type: "lao", data: laoData });
  }
  res.json({ status: "error", message: "Invalid type" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
