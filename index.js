const express = require('express');
const axios = require('axios');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function fetchLao() {
  try {
    const res = await axios.get('https://news.sanook.com/lotto/check/0/laolotto/', { headers });
    const html = res.data;
    const match = html.match(/class="lotto-check__number[^"]*">([\d]{6})</);
    
    if (match && match[1]) {
      const full = match[1];
      return {
        full: full,
        top3: full.slice(-3),
        bottom2: full.slice(0, 2)
      };
    }

    const backupRes = await axios.get('https://api.beastcode.io/lotto/lao', { headers, timeout: 3000 });
    if (backupRes.data && backupRes.data.latest) {
      return backupRes.data.latest;
    }
  } catch (err) {
    console.error('Lao fetch error:', err.message);
  }

  return { top3: "รอผล", bottom2: "รอผล" };
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
