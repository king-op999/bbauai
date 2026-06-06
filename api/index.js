// api/index.js - BRONX GROQ AI (PROPER TEXT EXTRACTION)
const express = require('express');
const axios = require('axios');
const app = express();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/responses';

const MODELS = {
    default: 'openai/gpt-oss-20b',
    list: ['openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 'qwen-2.5-32b']
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
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BRONX GROQ</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;padding:30px;max-width:700px;width:100%;text-align:center}
h1{font-family:'Orbitron',sans-serif;font-size:36px;background:linear-gradient(90deg,#f55000,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{color:#00ff88;font-size:11px;margin:8px 0 20px;letter-spacing:2px}
.row{display:flex;gap:8px;margin:16px 0}
.row input{flex:1;padding:14px;background:#000;border:1px solid #222;border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif}
.row input:focus{border-color:#f55000}
.row button{padding:14px 26px;background:#f55000;color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif}
.result{background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:18px;margin-top:12px;text-align:left;font-size:13px;color:#ff8c00;max-height:350px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.7}
code{background:#111;color:#f55000;padding:10px;border-radius:10px;display:block;font-size:10px;margin:8px 0;word-break:break-all}
</style></head><body><div class="card">
<h1>⚡ BRONX GROQ AI</h1><p class="badge">✅ Working 100%</p>
<div class="row"><input type="text" id="q" placeholder="Kuch bhi pucho..." onkeypress="if(event.key==='Enter')ask()"><button onclick="ask()">ASK</button></div>
<div class="result" id="r"></div>
<code>${url}/ai?reply=Hello</code>
</div><script>
async function ask(){var q=document.getElementById('q').value.trim();var r=document.getElementById('r');if(!q)return;r.style.display='block';r.style.color='#888';r.textContent='⚡ Thinking...';try{var resp=await fetch('/ai?reply='+encodeURIComponent(q));var d=await resp.json();r.style.color=d.success?'#ff8c00':'#ff4444';r.textContent=d.reply||d.error}catch(e){r.textContent='Error: '+e.message}}
</script></body></html>`);
});

// ========== 🔥 TEXT EXTRACTION HELPER ==========
function extractText(data) {
    // Case 1: Direct string
    if (typeof data === 'string') return data;
    
    // Case 2: output_text field
    if (data.output_text) return data.output_text;
    
    // Case 3: output is array (new Grok format)
    if (Array.isArray(data.output)) {
        for (const item of data.output) {
            if (item.type === 'message' && item.content) {
                for (const content of item.content) {
                    if (content.type === 'output_text' && content.text) {
                        return content.text;
                    }
                }
            }
        }
    }
    
    // Case 4: reply is array (from our response)
    if (Array.isArray(data.reply) || Array.isArray(data)) {
        const arr = Array.isArray(data) ? data : data.reply;
        for (const item of arr) {
            if (item.type === 'message' && item.content) {
                for (const content of item.content) {
                    if (content.type === 'output_text' && content.text) {
                        return content.text;
                    }
                }
            }
        }
    }
    
    // Case 5: choices array (old format)
    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    }
    
    // Case 6: text field
    if (data.text) return data.text;
    
    // Case 7: output field (string)
    if (typeof data.output === 'string') return data.output;
    
    // Case 8: content field
    if (data.content) return data.content;
    
    // Fallback
    return null;
}

// ========== AI API ==========
app.get('/ai', async (req, res) => {
    try {
        let query = req.query.reply || req.query.q || req.query.ask || '';
        let model = req.query.model || MODELS.default;
        query = query.trim();
        
        if (!query) return res.json({ success: false, error: 'Missing query' });

        console.log(`⚡ [${model}] "${query.substring(0, 80)}"`);

        const start = Date.now();
        let reply = null;

        // 🔥 Try New Responses API
        try {
            const resp = await axios.post(GROQ_URL, {
                model: model,
                input: query
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            const data = resp.data;
            
            // 🔥 Extract actual text from nested response
            reply = extractText(data);
            
            if (reply) {
                console.log(`✅ Text extracted: "${reply.substring(0, 80)}..."`);
            } else {
                console.log('⚠️ Could not extract text, raw:', JSON.stringify(data).substring(0, 200));
            }

        } catch (e) {
            console.log('New API failed:', e.response?.status);
        }

        // 🔥 Fallback: Old Chat API
        if (!reply) {
            try {
                const resp = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: model,
                        messages: [
                            { role: 'system', content: 'Reply in same language as user.' },
                            { role: 'user', content: query }
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
                
                reply = resp.data?.choices?.[0]?.message?.content;
                if (reply) console.log('✅ Fallback success');
            } catch (e) {
                console.log('Fallback failed');
            }
        }

        const time = Date.now() - start;

        if (reply && typeof reply === 'string' && reply.length > 2) {
            res.json({
                success: true,
                query: query,
                reply: reply,
                model: model,
                time: `${time}ms`,
                powered_by: 'BRONX_GROQ_AI'
            });
        } else {
            res.json({
                success: false,
                error: 'Could not extract reply. Try again.',
                extracted: reply
            });
        }

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message || 'AI request failed'
        });
    }
});

// ========== POST ==========
app.post('/ai', async (req, res) => {
    try {
        let query = req.body.reply || req.body.q || req.body.ask || '';
        let model = req.body.model || MODELS.default;
        query = query.trim();
        if (!query) return res.json({ success: false, error: 'Missing query' });

        const resp = await axios.post(GROQ_URL, {
            model: model,
            input: query
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        const reply = extractText(resp.data);

        res.json({
            success: true,
            reply: reply || 'No text extracted',
            model: model,
            powered_by: 'BRONX_GROQ_AI'
        });

    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
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
