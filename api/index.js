// api/index.js - BRONX GROK AI API
const express = require('express');
const axios = require('axios');
const app = express();

const GROK_API_KEY = process.env.GROK_API_KEY || 'xai-o4jrEElUlB1le8FcSR5zSSd8pGTz4gFRagcugn44cC4BByAxKbZ6zwWMfuCczgXmaaEjNlO6zGWBeQ4Z';
const GROK_BASE_URL = 'https://api.x.ai/v1';

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
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BRONX GROK AI</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(0,150,255,.1),transparent 70%);pointer-events:none;z-index:0}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;padding:35px;max-width:700px;width:100%;text-align:center;position:relative;z-index:1}
h1{font-family:'Orbitron',sans-serif;font-size:38px;background:linear-gradient(90deg,#0096ff,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px}
.badge{display:inline-block;background:rgba(0,150,255,.1);color:#0096ff;padding:5px 16px;border-radius:20px;font-size:11px;letter-spacing:2px;margin-bottom:20px;border:1px solid rgba(0,150,255,.2)}
.row{display:flex;gap:8px;margin:16px 0}
.row input{flex:1;padding:15px;background:#000;border:1px solid #222;border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif}
.row input:focus{border-color:#0096ff;box-shadow:0 0 30px rgba(0,150,255,.1)}
.row button{padding:15px 28px;background:linear-gradient(135deg,#0096ff,#0066cc);color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;letter-spacing:1px;transition:.3s}
.row button:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(0,150,255,.3)}
.result{background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:18px;margin-top:12px;text-align:left;font-size:13px;color:#00d4ff;max-height:350px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.7}
code{background:#111;color:#0096ff;padding:10px;border-radius:10px;display:block;font-size:10px;margin:8px 0;word-break:break-all}
</style></head><body><div class="card">
<h1>🤖 BRONX GROK</h1><p class="badge">X.AI · Grok 4.3 · Elon Musk</p>
<div class="row"><input type="text" id="q" placeholder="Ask Grok anything..." onkeypress="if(event.key==='Enter')ask()"><button onclick="ask()">⚡ ASK</button></div>
<div class="result" id="r"></div>
<code>${url}/ai?reply=YOUR_QUESTION</code>
</div><script>
async function ask(){var q=document.getElementById('q').value.trim();var r=document.getElementById('r');if(!q)return;r.style.display='block';r.style.color='#888';r.textContent='🤔 Grok is thinking...';try{var resp=await fetch('/ai?reply='+encodeURIComponent(q));var d=await resp.json();r.style.color=d.success?'#00d4ff':'#ff4444';r.textContent=d.reply||d.error}catch(e){r.style.color='#ff4444';r.textContent='Error: '+e.message}}
</script></body></html>`);
});

// ========== GROK AI API ==========
app.get('/ai', async (req, res) => {
    try {
        let query = req.query.reply || req.query.q || req.query.ask || req.query.text || '';
        query = query.trim();
        
        if (!query) {
            return res.json({ 
                success: false, 
                error: 'Missing query. Use: /ai?reply=YOUR QUESTION' 
            });
        }

        console.log(`🤖 Grok Query: "${query.substring(0, 150)}"`);

        // Call Grok API
        const response = await axios.post(
            `${GROK_BASE_URL}/responses`,
            {
                model: 'grok-4.3',
                input: [
                    {
                        role: 'system',
                        content: 'You are Grok, a highly intelligent AI assistant created by xAI. Answer clearly and helpfully.'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                max_tokens: 4000,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 90000
            }
        );

        if (response.data?.output) {
            const reply = response.data.output;
            
            console.log(`✅ Grok replied: "${reply.substring(0, 100)}..."`);

            res.json({
                success: true,
                query: query,
                reply: reply,
                model: response.data.model || 'grok-4.3',
                usage: response.data.usage || {},
                powered_by: 'BRONX_GROK_XAI'
            });
        } else {
            res.json({
                success: false,
                error: 'No response from Grok',
                raw: response.data
            });
        }

    } catch (e) {
        console.error('❌ Grok Error:', e.response?.data || e.message);
        
        res.status(500).json({
            success: false,
            error: 'Grok API error: ' + (e.response?.data?.error?.message || e.message),
            query: req.query.reply || ''
        });
    }
});

// ========== POST METHOD ==========
app.post('/ai', async (req, res) => {
    try {
        let query = req.body.reply || req.body.q || req.body.ask || req.body.text || '';
        query = query.trim();
        
        if (!query) {
            return res.json({ success: false, error: 'Missing query in body' });
        }

        const response = await axios.post(
            `${GROK_BASE_URL}/responses`,
            {
                model: 'grok-4.3',
                input: [
                    { role: 'system', content: 'You are Grok, a helpful AI assistant.' },
                    { role: 'user', content: query }
                ],
                max_tokens: 4000,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 90000
            }
        );

        res.json({
            success: true,
            query: query,
            reply: response.data.output,
            model: response.data.model || 'grok-4.3',
            powered_by: 'BRONX_GROK_XAI'
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            error: 'Grok API error: ' + (e.response?.data?.error?.message || e.message)
        });
    }
});

// ========== CHAT HISTORY (Multi-turn) ==========
app.post('/chat', async (req, res) => {
    try {
        const messages = req.body.messages || [];
        
        if (!messages.length) {
            return res.json({ success: false, error: 'Missing messages array' });
        }

        const input = [
            { role: 'system', content: 'You are Grok, a helpful AI assistant.' },
            ...messages
        ];

        const response = await axios.post(
            `${GROK_BASE_URL}/responses`,
            {
                model: 'grok-4.3',
                input: input,
                max_tokens: 4000,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 90000
            }
        );

        res.json({
            success: true,
            reply: response.data.output,
            model: response.data.model || 'grok-4.3',
            powered_by: 'BRONX_GROK_XAI'
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

// ========== HEALTH CHECK ==========
app.get('/test', (req, res) => {
    const url = `${req.protocol}://${req.get('host')}`;
    res.json({
        status: '✅ BRONX GROK AI ONLINE',
        model: 'grok-4.3',
        provider: 'X.AI (Elon Musk)',
        endpoints: {
            get: `${url}/ai?reply=Hello`,
            post: `${url}/ai (JSON body)`,
            chat: `${url}/chat (Multi-turn)`,
            home: url
        },
        powered_by: 'BRONX_GROK_XAI'
    });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 BRONX GROK AI ONLINE!');
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🧠 Model: Grok 4.3 (X.AI)`);
    console.log(`👑 Powered by: Elon Musk's X.AI`);
    console.log(`🔗 GET  /ai?reply=Hello`);
    console.log(`🔗 POST /ai  (JSON body)`);
    console.log(`🔗 POST /chat (Multi-turn)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
