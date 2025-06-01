const https = require('https');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  const url = 'https://www.moddb.com/mods/solo-fortress-2/reviews/980518';

  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    }
  }, (response) => {
    let html = '';
    response.on('data', chunk => html += chunk);
    response.on('end', () => {
      const userMatch = html.match(/<span class="heading">(.*?) says<\/span>/i);
      const dateMatch = html.match(/<span class="reviewdate">(.*?)<\/span>/i);

      const username = userMatch ? userMatch[1] : 'Unknown';
      const rawDate = dateMatch ? dateMatch[1] : 'Unknown';

      let europeanTime = 'Unavailable';
      try {
        const date = new Date(rawDate + ' UTC');
        europeanTime = date.toLocaleString('en-GB', {
          timeZone: 'Europe/Berlin',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {}

      res.json({ username, europeanTime, status: "success" });
    });
  }).on('error', err => {
    res.status(500).json({ status: "error", error: err.message });
  });
});

app.get('/', (req, res) => {
  res.send('ModDB scraper is online. Use /api to get data.');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});