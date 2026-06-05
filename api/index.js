// api/index.js - BRONX DEEPSEEK AI API V2.0 - FULL FIXED
const express = require('express');
const axios = require('axios');
const app = express();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-cc0648772f124212a1da9bea08ac68ed';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set('json spaces', 2);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ========== HOME PAGE (AI PLAYGROUND) ==========
app.get('/', (req, res) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>BRONX AI V2.0</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#e0e0e0;font-family:'Rajdhani',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(139,0,255,.1),transparent 70%),radial-gradient(ellipse at 80% 100%,rgba(0,200,255,.06),transparent 50%);pointer-events:none;z-index:0}
.container{max-width:850px;width:100%;position:relative;z-index:1}
h1{font-family:'Orbitron',sans-serif;font-size:clamp(26px,5vw,44px);text-align:center;background:linear-gradient(90deg,#8b00ff,#00c8ff,#ff0080);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;animation:glow 3s ease infinite;background-size:200% 200%}@keyframes glow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.subtitle{text-align:center;color:#555;font-size:12px;letter-spacing:4px;margin-bottom:24px;text-transform:uppercase}
.card{background:rgba(10,10,20,.85);border:1px solid rgba(139,0,255,.08);border-radius:20px;padding:22px;margin-bottom:16px;backdrop-filter:blur(30px)}
.card h3{color:#8b00ff;font-size:14px;margin-bottom:12px;letter-spacing:2px;font-family:'Orbitron',sans-serif}
.card p{color:#666;font-size:11px;margin:6px 0}
code{display:block;background:rgba(0,0,0,.5);color:#00c8ff;padding:12px 16px;border-radius:12px;font-family:'Courier New',monospace;font-size:11px;margin:8px 0;word-break:break-all;border:1px solid rgba(0,200,255,.08)}
.endpoint{color:#00ff88;font-weight:700;font-size:13px;margin:8px 0}
.badge{display:inline-block;background:rgba(0,255,136,.06);color:#00ff88;padding:5px 14px;border-radius:20px;font-size:10px;font-weight:700;margin-bottom:12px;border:1px solid rgba(0,255,136,.12);letter-spacing:1px}
.chat-area{display:flex;gap:8px;margin-top:12px}
.chat-area input{flex:1;padding:15px 18px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.05);border-radius:14px;color:#fff;font-size:14px;outline:none;font-family:'Rajdhani',sans-serif;transition:.4s}
.chat-area input:focus{border-color:#8b00ff;box-shadow:0 0 40px rgba(139,0,255,.15)}
.chat-area button{padding:15px 26px;background:linear-gradient(135deg,#8b00ff,#5500cc,#00c8ff);background-size:200% 200%;color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;letter-spacing:1px;transition:.4s;animation:btnGlow 3s ease infinite;font-size:13px}
.chat-area button:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(139,0,255,.35)}@keyframes btnGlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.result-box{margin-top:16px;background:rgba(0,0,0,.5);border:1px solid rgba(0,255,136,.08);border-radius:14px;padding:18px;font-family:'Courier New',monospace;font-size:12px;color:#00ff88;max-height:400px;overflow:auto;display:none;white-space:pre-wrap;line-height:1.6}
.result-box.error{color:#ff0080;border-color:rgba(255,0,128,.15)}
.result-box.loading{color:#00c8ff}
.quick-prompts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.quick-prompt{background:rgba(139,0,255,.05);color:#888;border:1px solid rgba(139,0,255,.1);padding:8px 14px;border-radius:20px;font-size:10px;cursor:pointer;transition:.3s;font-family:'Rajdhani',sans-serif}
.quick-prompt:hover{background:rgba(139,0,255,.12);color:#fff;border-color:#8b00ff}
.footer{text-align:center;margin-top:20px;color:#1a1a1a;font-size:10px;letter-spacing:3px}
</style></head><body>
<div class="container">
<h1>BRONX AI V2.0</h1>
<p class="subtitle">DeepSeek Powered · Spaces & Hindi OK</p>
<div class="badge">✅ 24/7 ONLINE · ${serverUrl}</div>

<div class="card">
<h3>🤖 AI CHAT</h3>
<div class="chat-area">
<input type="text" id="aiInput" placeholder="Kuch bhi pucho... (Spaces, Hindi, English sab chalega)" onkeypress="if(event.key==='Enter')askAI()">
<button onclick="askAI()">⚡ ASK</button>
</div>
<div class="quick-prompts">
<span class="quick-prompt" onclick="quickAsk('Hallo bhai kasa ho?')">👋 Hallo</span>
<span class="quick-prompt" onclick="quickAsk('Mera naam Rahul hai')">🙋‍♂️ Intro</span>
<span class="quick-prompt" onclick="quickAsk('Python code for fibonacci series')">💻 Code</span>
<span class="quick-prompt" onclick="quickAsk('What is OSINT?')">🔍 OSINT</span>
<span class="quick-prompt" onclick="quickAsk('Write a short poem')">📝 Poem</span>
<span class="quick-prompt" onclick="quickAsk('Mujhe ek joke sunao')">😂 Joke</span>
</div>
<div class="result-box" id="result"></div>
</div>

<div class="card">
<h3>📡 API ENDPOINTS</h3>
<p class="endpoint">🔗 GET /ai?reply=YOUR_QUESTION</p>
<code>${serverUrl}/ai?reply=Hallo bhai kasa ho</code>
<p style="margin-top:8px">✅ Spaces, Hindi, Emojis - sab support!</p>
<p class="endpoint" style="margin-top:12px">🔗 POST /ai</p>
<code>curl -X POST ${serverUrl}/ai -H "Content-Type: application/json" -d '{"reply":"Hallo bhai"}'</code>
</div>

<div class="card">
<h3>📋 SAMPLE RESPONSE</h3>
<code>{
  "success": true,
  "query": "Hallo bhai kasa ho",
  "reply": "Hello bhai! Main theek hoon...",
  "model": "deepseek-chat",
  "powered_by": "BRONX_AI_V2"
}</code>
</div>
</div>
<p class="footer">BRONX AI V2.0 · DeepSeek · Render</p>
<script>
function quickAsk(q){
    document.getElementById('aiInput').value=q;
    askAI();
}
async function askAI(){
    var q=document.getElementById('aiInput').value.trim();
    var r=document.getElementById('result');
    if(!q){r.style.display='block';r.className='result-box error';r.textContent='❌ Please enter a question!';return}
    r.style.display='block';
    r.className='result-box loading';
    r.textContent='🤔 Thinking...';
    try{
        var resp=await fetch('/ai?reply='+encodeURIComponent(q));
        var data=await resp.json();
        if(data.success){
            r.className='result-box';
            r.textContent=data.reply;
        }else{
            r.className='result-box error';
            r.textContent='❌ '+ (data.error||'Unknown error');
        }
    }catch(e){
        r.className='result-box error';
        r.textContent='❌ Connection error: '+e.message;
    }
}
</script></body></html>`);
});

// ========== AI API - GET (URL Parameters - Spaces Support) ==========
app.get('/ai', async (req, res) => {
    try {
        // Get query from any parameter name
        let query = req.query.reply || req.query.q || req.query.ask || req.query.text || req.query.question || '';
        
        // Already decoded by Express, but just in case
        if (typeof query === 'string') {
            query = query.trim();
        }
        
        if (!query) {
            return res.json({
                success: false,
                error: '❌ Missing query! Use: /ai?reply=YOUR QUESTION HERE',
                examples: [
                    '/ai?reply=Hallo bhai kasa ho',
                    '/ai?reply=What is AI?',
                    '/ai?reply=Mera naam Rahul hai'
                ]
            });
        }

        console.log(`📝 [GET] Query: "${query.substring(0, 150)}"`);
        
        // Call DeepSeek API
        const aiResponse = await callDeepSeek(query);
        
        res.json({
            success: true,
            query: query,
            reply: aiResponse.reply,
            model: aiResponse.model,
            usage: aiResponse.usage,
            response_time_ms: aiResponse.time,
            powered_by: 'BRONX_AI_V2'
        });

    } catch (e) {
        console.error('❌ AI GET Error:', e.message);
        res.status(500).json({
            success: false,
            error: 'AI request failed: ' + (e.response?.data?.error?.message || e.message),
            query: req.query.reply || ''
        });
    }
});

// ========== AI API - POST (JSON Body - For Long Questions) ==========
app.post('/ai', async (req, res) => {
    try {
        let query = req.body.reply || req.body.q || req.body.ask || req.body.text || req.body.question || '';
        
        if (typeof query === 'string') {
            query = query.trim();
        }
        
        if (!query) {
            return res.json({
                success: false,
                error: '❌ Missing query in body! Send JSON: {"reply": "Your question"}'
            });
        }

        console.log(`📝 [POST] Query: "${query.substring(0, 150)}"`);
        
        const aiResponse = await callDeepSeek(query);
        
        res.json({
            success: true,
            query: query,
            reply: aiResponse.reply,
            model: aiResponse.model,
            usage: aiResponse.usage,
            response_time_ms: aiResponse.time,
            powered_by: 'BRONX_AI_V2'
        });

    } catch (e) {
        console.error('❌ AI POST Error:', e.message);
        res.status(500).json({
            success: false,
            error: 'AI request failed: ' + (e.response?.data?.error?.message || e.message)
        });
    }
});

// ========== DEEPSEEK API CALL ==========
async function callDeepSeek(query) {
    const startTime = Date.now();
    
    const response = await axios.post(
        `${DEEPSEEK_BASE_URL}/chat/completions`,
        {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are BRONX AI, a helpful, friendly, and knowledgeable assistant. Answer in the same language as the user's question. Keep responses clear and helpful. If the user speaks Hindi, reply in Hindi. If English, reply in English. Be concise but thorough."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            stream: false,
            max_tokens: 4000,
            temperature: 0.8,
            top_p: 0.9
        },
        {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 90000 // 90 seconds
        }
    );

    const endTime = Date.now();
    
    if (response.data?.choices?.length > 0) {
        return {
            reply: response.data.choices[0].message.content,
            model: response.data.model || 'deepseek-chat',
            usage: response.data.usage || {},
            time: endTime - startTime
        };
    } else {
        throw new Error('No response from DeepSeek API');
    }
}

// ========== HEALTH CHECK ==========
app.get('/test', (req, res) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
        status: '✅ BRONX AI V2.0 ONLINE',
        model: 'deepseek-chat',
        endpoints: {
            get: `${serverUrl}/ai?reply=YOUR_QUESTION`,
            post: `${serverUrl}/ai (JSON body)`,
            playground: serverUrl
        },
        features: [
            '✅ Spaces in questions',
            '✅ Hindi language support',
            '✅ Emoji support',
            '✅ GET & POST methods',
            '✅ Long questions supported',
            '✅ Auto language detection'
        ],
        powered_by: 'BRONX_AI_V2'
    });
});

// ========== 404 ==========
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        usage: {
            get: '/ai?reply=YOUR QUESTION',
            post: 'POST /ai with JSON body',
            test: '/test',
            home: '/'
        }
    });
});

// ========== START SERVER (FIXED) ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 BRONX AI V2.0 ONLINE!');
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🧠 Model: DeepSeek Chat`);
    console.log(`✅ Spaces/Hindi/Emoji Supported`);
    console.log(`🔗 GET  /ai?reply=YOUR_QUESTION`);
    console.log(`🔗 POST /ai  (JSON body)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
