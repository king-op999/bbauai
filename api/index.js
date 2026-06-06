// api/index.js - BRONX GROQ AI API (LIGHTNING FAST)
const express = require('express');
const axios = require('axios');
const app = express();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

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
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BRONX GROQ AI</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(245,80,0,.1),transparent 70%);pointer-events:none;z-index:0}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;padding:35px;max-width:700px;width:100%;text-align:center;position:relative;z-index:1}
h1{font-family:'Orbitron',sans-serif;font-size:38px;background:linear-gradient(90deg,#f55000,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px}
.badge{display:inline-block;background:rgba(245,80,0,.1);color:#f55000;padding:5px 16px;border-radius:20px;font-size:11px;letter-spacing:2px;margin-bottom:20px;border:1px solid rgba(245,80,0,.2)}
.speed{color:#ff8c00;font-size:10px;margin-bottom:16px}
.row{display:flex;gap:8px;margin:16px 0}
.row input{flex:1;padding:15px;background:#000;border:1px solid #222;border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif}
.row input:focus{border-color:#f55000;box-shadow:0 0 30px rgba(245,80,0,.1)}
.row button{padding:15px 28px;background:linear-gradient(135deg,#f55000,#ff8c00);color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;letter-spacing:1px;transition:.3s}
.row button:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(245,80,0,.3)}
.result{background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:18px;margin-top:12px;text-align:left;font-size:13px;color:#ff8c00;max-height:350px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.7}
code{background:#111;color:#f55000;padding:10px;border-radius:10px;display:block;font-size:10px;margin:8px 0;word-break:break-all}
.models{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}
.model-btn{background:#111;border:1px solid #222;color:#888;padding:6px 12px;border-radius:8px;font-size:9px;cursor:pointer;transition:.3s;font-family:'Rajdhani',sans-serif}
.model-btn:hover{border-color:#f55000;color:#f55000}
.model-btn.active{background:rgba(245,80,0,.1);border-color:#f55000;color:#f55000}
</style></head><body><div class="card">
<h1>⚡ BRONX GROQ</h1><p class="badge">Llama 3 70B · 300 T/s</p>
<p class="speed">🚀 Fastest AI API on Earth</p>
<div class="models" id="models">
<span class="model-btn active" onclick="selectModel('llama3-70b-8192')">Llama 3 70B</span>
<span class="model-btn" onclick="selectModel('llama3-8b-8192')">Llama 3 8B</span>
<span class="model-btn" onclick="selectModel('mixtral-8x7b-32768')">Mixtral 8x7B</span>
<span class="model-btn" onclick="selectModel('gemma2-9b-it')">Gemma 2 9B</span>
</div>
<div class="row"><input type="text" id="q" placeholder="Ask anything... (Lightning fast!)" onkeypress="if(event.key==='Enter')ask()"><button onclick="ask()">⚡ ASK</button></div>
<div class="result" id="r"></div>
<code>${url}/ai?reply=Hello&model=llama3-70b-8192</code>
</div><script>
var model='llama3-70b-8192';
function selectModel(m){model=m;document.querySelectorAll('.model-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active')}
async function ask(){var q=document.getElementById('q').value.trim();var r=document.getElementById('r');if(!q)return;r.style.display='block';r.style.color='#888';r.textContent='⚡ Groq is thinking...';var t=Date.now();try{var resp=await fetch('/ai?reply='+encodeURIComponent(q)+'&model='+model);var d=await resp.json();var time=Date.now()-t;r.style.color=d.success?'#ff8c00':'#ff4444';r.textContent=d.reply||d.error;if(d.success)r.textContent+='\\n\\n⏱️ '+time+'ms | '+d.tokens+' tokens | '+d.speed+' tok/s'}catch(e){r.style.color='#ff4444';r.textContent='Error: '+e.message}}
</script></body></html>`);
});

// ========== GROQ AI API ==========
app.get('/ai', async (req, res) => {
    try {
        let query = req.query.reply || req.query.q || req.query.ask || req.query.text || '';
        let model = req.query.model || GROQ_MODEL;
        query = query.trim();
        
        if (!query) {
            return res.json({ success: false, error: 'Missing query. Use: /ai?reply=Hello' });
        }

        console.log(`⚡ [${model}] ${query.substring(0, 100)}`);

        const startTime = Date.now();

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful, friendly AI assistant. Answer clearly and concisely. Reply in the same language as the user.'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                max_tokens: 4000,
                temperature: 0.8,
                top_p: 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.data?.choices?.length > 0) {
            const reply = response.data.choices[0].message.content;
            const usage = response.data.usage || {};
            const tokens = usage.completion_tokens || usage.total_tokens || 0;
            const speed = tokens > 0 ? Math.round(tokens / (responseTime / 1000)) : 0;

            console.log(`✅ Reply (${responseTime}ms, ${tokens} tokens, ${speed} tok/s)`);

            res.json({
                success: true,
                query: query,
                reply: reply,
                model: response.data.model || model,
                tokens: tokens,
                speed: `${speed} tok/s`,
                response_time_ms: responseTime,
                usage: usage,
                powered_by: 'BRONX_GROQ_AI'
            });
        } else {
            res.json({ success: false, error: 'No response from Groq' });
        }

    } catch (e) {
        console.error('❌ Groq Error:', e.response?.data || e.message);
        res.status(500).json({
            success: false,
            error: 'Groq API error: ' + (e.response?.data?.error?.message || e.message)
        });
    }
});

// ========== POST METHOD ==========
app.post('/ai', async (req, res) => {
    try {
        let query = req.body.reply || req.body.q || req.body.ask || req.body.text || '';
        let model = req.body.model || GROQ_MODEL;
        let system = req.body.system || 'You are a helpful AI assistant.';
        query = query.trim();
        
        if (!query) return res.json({ success: false, error: 'Missing query' });

        const startTime = Date.now();

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: query }
                ],
                max_tokens: req.body.max_tokens || 4000,
                temperature: req.body.temperature || 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const endTime = Date.now();

        res.json({
            success: true,
            query: query,
            reply: response.data.choices[0].message.content,
            model: response.data.model || model,
            response_time_ms: endTime - startTime,
            usage: response.data.usage || {},
            powered_by: 'BRONX_GROQ_AI'
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

// ========== AVAILABLE MODELS ==========
app.get('/models', (req, res) => {
    res.json({
        success: true,
        models: [
            { id: 'llama3-70b-8192', name: 'Llama 3 70B', context: 8192, speed: '300 tok/s' },
            { id: 'llama3-8b-8192', name: 'Llama 3 8B', context: 8192, speed: '800 tok/s' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: 32768, speed: '200 tok/s' },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B', context: 8192, speed: '500 tok/s' }
        ],
        powered_by: 'BRONX_GROQ_AI'
    });
});

// ========== HEALTH CHECK ==========
app.get('/test', (req, res) => {
    const url = `${req.protocol}://${req.get('host')}`;
    res.json({
        status: '✅ BRONX GROQ AI ONLINE',
        model: 'llama3-70b-8192',
        speed: '300 tokens/second',
        provider: 'Groq Cloud',
        endpoints: {
            get: `${url}/ai?reply=Hello`,
            post: `${url}/ai`,
            models: `${url}/models`,
            home: url
        }
    });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ BRONX GROQ AI ONLINE!');
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🧠 Model: Llama 3 70B`);
    console.log(`⚡ Speed: 300 tok/s (Fastest!)`);
    console.log(`🔗 /ai?reply=Hello`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
