// api/index.js - BRONX GROQ AI (NEW API - /responses)
const express = require('express');
const axios = require('axios');
const app = express();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// 🔥 NEW GROQ API URL (responses endpoint)
const GROQ_URL = 'https://api.groq.com/openai/v1/responses';

// Working models
const MODELS = {
    default: 'openai/gpt-oss-20b',
    list: [
        { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B' },
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B' },
        { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B' },
        { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B' }
    ]
};

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
*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(245,80,0,.1),transparent 70%);pointer-events:none;z-index:0}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;padding:30px;max-width:750px;width:100%;text-align:center;position:relative;z-index:1}
h1{font-family:'Orbitron',sans-serif;font-size:36px;background:linear-gradient(90deg,#f55000,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{display:inline-block;background:rgba(245,80,0,.1);color:#f55000;padding:4px 14px;border-radius:20px;font-size:10px;letter-spacing:2px;margin:8px 0 16px;border:1px solid rgba(245,80,0,.2)}
.models{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}
.model-btn{background:#111;border:1px solid #222;color:#888;padding:7px 12px;border-radius:8px;font-size:9px;cursor:pointer;transition:.3s;font-family:'Rajdhani',sans-serif}
.model-btn:hover{border-color:#f55000;color:#f55000}
.model-btn.active{background:rgba(245,80,0,.1);border-color:#f55000;color:#f55000}
.row{display:flex;gap:8px;margin:16px 0}
.row input{flex:1;padding:14px;background:#000;border:1px solid #222;border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif}
.row input:focus{border-color:#f55000}
.row button{padding:14px 26px;background:linear-gradient(135deg,#f55000,#ff8c00);color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;transition:.3s}
.row button:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(245,80,0,.3)}
.result{background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:18px;margin-top:12px;text-align:left;font-size:13px;color:#ff8c00;max-height:350px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.7}
code{background:#111;color:#f55000;padding:10px;border-radius:10px;display:block;font-size:10px;margin:8px 0;word-break:break-all}
</style></head><body><div class="card">
<h1>⚡ BRONX GROQ AI</h1><p class="badge">New API · Working</p>
<div class="models">
${MODELS.list.map(m => `<span class="model-btn ${m.id===MODELS.default?'active':''}" onclick="selectModel('${m.id}')">${m.name}</span>`).join('')}
</div>
<div class="row"><input type="text" id="q" placeholder="Kuch bhi pucho..." onkeypress="if(event.key==='Enter')ask()"><button onclick="ask()">⚡ ASK</button></div>
<div class="result" id="r"></div>
<code>${url}/ai?reply=Hello</code>
</div><script>
var model='${MODELS.default}';
function selectModel(m){model=m;document.querySelectorAll('.model-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active')}
async function ask(){var q=document.getElementById('q').value.trim();var r=document.getElementById('r');if(!q)return;r.style.display='block';r.style.color='#888';r.textContent='⚡ Thinking...';try{var resp=await fetch('/ai?reply='+encodeURIComponent(q)+'&model='+model);var d=await resp.json();r.style.color=d.success?'#ff8c00':'#ff4444';r.textContent=d.reply||d.error||'No response'}catch(e){r.style.color='#ff4444';r.textContent='Error: '+e.message}}
</script></body></html>`);
});

// ========== AI API (NEW RESPONSES ENDPOINT) ==========
app.get('/ai', async (req, res) => {
    try {
        let query = req.query.reply || req.query.q || req.query.ask || req.query.text || '';
        let model = req.query.model || MODELS.default;
        query = query.trim();
        
        if (!query) {
            return res.json({ success: false, error: 'Missing query. Use: /ai?reply=Hello' });
        }

        console.log(`⚡ [${model}] "${query.substring(0, 100)}"`);

        const start = Date.now();

        // 🔥 NEW GROK API - /responses endpoint
        const response = await axios.post(
            GROQ_URL,
            {
                model: model,
                input: query
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        const time = Date.now() - start;

        console.log('✅ Response:', JSON.stringify(response.data).substring(0, 200));

        // New API response format
        let reply = response.data.output_text || 
                    response.data.output || 
                    response.data.choices?.[0]?.message?.content ||
                    response.data.choices?.[0]?.text ||
                    'No response';

        res.json({
            success: true,
            query: query,
            reply: reply,
            model: response.data.model || model,
            time: `${time}ms`,
            raw: response.data,
            powered_by: 'BRONX_GROQ_AI'
        });

    } catch (e) {
        console.error('❌ Error:', e.response?.data || e.message);
        
        // 🔥 Try fallback to old API
        try {
            console.log('🔄 Trying fallback chat/completions...');
            
            const fallback = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: req.query.model || MODELS.default,
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: req.query.reply || req.query.q }
                    ],
                    max_tokens: 4000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            res.json({
                success: true,
                query: req.query.reply || req.query.q,
                reply: fallback.data.choices[0].message.content,
                model: fallback.data.model,
                method: 'fallback',
                powered_by: 'BRONX_GROQ_AI'
            });
            
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                error: e.response?.data?.error?.message || e.message,
                fallback_error: fallbackError.response?.data?.error?.message
            });
        }
    }
});

// ========== POST METHOD ==========
app.post('/ai', async (req, res) => {
    try {
        let query = req.body.reply || req.body.q || req.body.ask || req.body.input || req.body.text || '';
        let model = req.body.model || MODELS.default;
        query = query.trim();
        
        if (!query) return res.json({ success: false, error: 'Missing query' });

        // Try new API first
        try {
            const response = await axios.post(
                GROQ_URL,
                {
                    model: model,
                    input: query
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            res.json({
                success: true,
                reply: response.data.output_text || response.data.output,
                model: model,
                powered_by: 'BRONX_GROQ_AI'
            });
        } catch {
            // Fallback
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: model,
                    messages: [{ role: 'user', content: query }],
                    max_tokens: 4000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            res.json({
                success: true,
                reply: response.data.choices[0].message.content,
                model: model,
                method: 'fallback',
                powered_by: 'BRONX_GROQ_AI'
            });
        }

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.response?.data?.error?.message || e.message
        });
    }
});

// ========== MODELS ==========
app.get('/models', (req, res) => {
    res.json({ success: true, models: MODELS.list, default: MODELS.default });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ BRONX GROQ AI ONLINE!');
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🔗 /ai?reply=Hello`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
