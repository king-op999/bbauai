// api/index.js - 100% FREE (No API Key Needed!)
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.set('json spaces', 2);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ========== HOME PAGE ==========
app.get('/', (req, res) => {
    const url = `${req.protocol}://${req.get('host')}`;
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BRONX AI FREE</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;padding:35px;max-width:700px;width:100%;text-align:center}
h1{font-family:'Orbitron',sans-serif;font-size:36px;background:linear-gradient(90deg,#00ff88,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.free{color:#00ff88;font-size:12px;letter-spacing:2px;margin:8px 0 20px;border:1px solid #00ff8820;display:inline-block;padding:6px 18px;border-radius:20px}
.row{display:flex;gap:8px;margin:16px 0}
.row input{flex:1;padding:15px;background:#000;border:1px solid #222;border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif}
.row input:focus{border-color:#00ff88}
.row button{padding:15px 28px;background:linear-gradient(135deg,#00ff88,#00d4ff);color:#000;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif}
.result{background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:18px;margin-top:12px;text-align:left;font-size:13px;color:#00ff88;max-height:350px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.7}
code{background:#111;color:#00ff88;padding:10px;border-radius:10px;display:block;font-size:10px;margin:8px 0;word-break:break-all}
</style></head><body><div class="card">
<h1>🤖 BRONX AI</h1><p class="free">🆓 100% FREE · No Key Needed</p>
<div class="row"><input type="text" id="q" placeholder="Kuch bhi pucho..." onkeypress="if(event.key==='Enter')ask()"><button onclick="ask()">ASK</button></div>
<div class="result" id="r"></div>
<code>${url}/ai?reply=YOUR_QUESTION</code>
</div><script>
async function ask(){var q=document.getElementById('q').value.trim();var r=document.getElementById('r');if(!q)return;r.style.display='block';r.style.color='#888';r.textContent='Thinking...';try{var resp=await fetch('/ai?reply='+encodeURIComponent(q));var d=await resp.json();r.style.color=d.success?'#00ff88':'#ff4444';r.textContent=d.reply||d.error}catch(e){r.textContent='Error: '+e.message}}
</script></body></html>`);
});

// ========== FREE AI API (NO KEY) ==========
app.get('/ai', async (req, res) => {
    try {
        let query = req.query.reply || req.query.q || '';
        query = query.trim();
        if (!query) return res.json({ success: false, error: 'Missing query' });

        console.log('📝', query.substring(0, 100));

        let reply = null;

        // Try 1: Pollinations (No key)
        try {
            const resp = await axios.get(
                `https://text.pollinations.ai/${encodeURIComponent(query)}`,
                { timeout: 60000 }
            );
            if (resp.data?.length > 10) reply = resp.data;
        } catch (e) {}

        // Try 2: Blackbox (No key)
        if (!reply) {
            try {
                const resp = await axios.post(
                    'https://api.blackbox.ai/api/chat',
                    {
                        messages: [{ role: 'user', content: query }],
                        model: 'deepseek-ai/DeepSeek-V3'
                    },
                    { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
                );
                if (resp.data?.length > 10) reply = resp.data;
            } catch (e) {}
        }

        if (reply) {
            res.json({ success: true, query, reply, powered_by: 'BRONX_AI_FREE' });
        } else {
            res.json({ success: false, error: 'All free providers busy. Try again.' });
        }

    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 FREE AI on ${PORT}`));
module.exports = app;
