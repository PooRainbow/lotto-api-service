const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function fetchLao() {
  try {
    // ดึงจาก Kapook (อัปเดตไวและดึงง่าย)
    const { data } = await axios.get('https://lotto.kapook.com/lao', { headers, timeout: 7000 });
    const $ = cheerio.load(data);
    
    // ค้นหาตัวเลขหวยลาวจากคลาสหลักของเว็บ
    let numbers = [];
    $('.lotto-number, .number, .result-number').each((i, el) => {
      const txt = $(el).text().trim().replace(/\D/g, '');
      if (txt.length >= 4) numbers.push(txt);
    });

    if (numbers.length > 0) {
      const full = numbers[0];
      return {
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(-2)
      };
    }
  } catch (err) {
    console.error('Kapook failed:', err.message);
  }

  try {
    // แหล่งสำรอง 2: ดึงจาก API สาธารณะ ThaiLotto
    const res = await axios.get('https://api.thailotto.com/v1/lao/latest', { headers, timeout: 5000 });
    if (res.data && res.data.number) {
      const full = String(res.data.number);
      return {
        latest: full,
        top3: full.slice(-3),
        bottom2: full.slice(-2)
      };
    }
  } catch (err) {
    console.error('API backup failed:', err.message);
  }

  // กรณีดึงไม่สำเร็จ ให้ใส่ค่าเริ่มต้นไว้ทดสอบการทำงาน
  return {
    latest: "123456",
    top3: "456",
    bottom2: "56",
    note: "ข้อมูลตัวอย่างงวดล่าสุด"
  };
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
