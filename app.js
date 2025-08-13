const offlineDATA = [
  { feeling:"sad / grieving",
    quran:{ ar:"فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا • إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", en:"For indeed, with hardship comes ease. Indeed, with hardship comes ease.", ref:"Q 94:5–6" },
    hadith:{ en:"Amazing is the affair of the believer... if hardship befalls him, he is patient—and that is best for him.", ref:"Muslim 2999 (paraphr.)" },
    counsel:{ by:"Wise Counsel", text:"Grieve before Allah like Ya‘qub: “I only complain of my grief to Allah.”", ref:"Q 12:86" },
    dua:"اللهم آجرني في مصيبتي واخلف لي خيرا منها"
  }
];

const apiBase = (window.API_BASE||'').trim().replace(/\/$/,'');
const aiNotice = document.getElementById('aiNotice');
aiNotice.innerHTML = apiBase
  ? `✅ <b>AI Assist connected:</b> ${apiBase.replace(/^https?:\/\//,'')}`
  : `⚠️ <b>AI Assist is OFF.</b> To enable it, edit <code>config.js</code> and set <code>window.API_BASE</code> to your Vercel URL ending with <code>/api</code>.`;

document.getElementById('goBtn').addEventListener('click', run);
document.getElementById('customFeeling').addEventListener('keydown', e => { if(e.key==='Enter') run(); });

async function run(){
  const sel = document.getElementById('feelingSelect').value;
  const custom = document.getElementById('customFeeling').value.trim();
  const feeling = custom || sel;
  if(!feeling){ alert('Choose or type a feeling.'); return; }

  if(!apiBase){ renderOffline(feeling); return; }

  try{
    const res = await fetch(`${apiBase}/feel`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ input: feeling, profile: 'despair-not' })
    });
    if(!res.ok){ throw new Error(`HTTP ${res.status}`); }
    const data = await res.json();
    renderAI(data, feeling);
  }catch(err){
    console.warn('AI failed, fallback to offline. Error:', err);
    renderOffline(feeling);
  }
}

function renderAI(data, feeling){
  const r = document.getElementById('results');
  const b = document.getElementById('blocks');
  const t = document.getElementById('title');

  const m = (data && data.mapped) || {};
  t.textContent = `Comfort for: ${m.feeling || feeling}`;

  b.innerHTML = '';
  if(m.quran){
    b.appendChild(block('Qur’an', m.quran.ar, m.quran.en, m.quran.ref));
  }
  if(m.quran2){
    b.appendChild(block('Qur’an', m.quran2.ar, m.quran2.en, m.quran2.ref));
  }
  if(m.hadith){
    b.appendChild(block('Hadith', m.hadith.ar, m.hadith.en, m.hadith.ref));
  }
  if(m.counsel){
    b.appendChild(block(m.counsel.by || 'Wise Counsel', null, m.counsel.text, m.counsel.ref));
  }
  if(m.dua){
    b.appendChild(block('Dua', m.dua, null, null));
  }

  const pep = document.getElementById('peptalk');
  if(data && data.peptalk){ pep.textContent = data.peptalk; pep.classList.remove('hidden'); }
  else { pep.classList.add('hidden'); }

  r.classList.remove('hidden');
}

function renderOffline(feeling){
  const r = document.getElementById('results');
  const b = document.getElementById('blocks');
  const t = document.getElementById('title');
  const d = offlineDATA[0];
  t.textContent = `Comfort for: ${feeling}`;
  b.innerHTML = '';
  b.appendChild(block('Qur’an', d.quran.ar, d.quran.en, d.quran.ref));
  b.appendChild(block('Hadith', null, d.hadith.en, d.hadith.ref));
  b.appendChild(block(d.counsel.by, null, d.counsel.text, d.counsel.ref));
  b.appendChild(block('Dua', d.dua, null, null));
  document.getElementById('peptalk').classList.add('hidden');
  r.classList.remove('hidden');
}

function block(label, ar, en, ref){
  const el = document.createElement('div');
  el.className = 'block';
  el.innerHTML = `
    <div class="eyebrow">${label}</div>
    ${ar ? `<div class="ar">“${ar}”</div>` : ''}
    ${en ? `<div class="en">“${en}”</div>` : ''}
    ${ref ? `<div class="meta">${ref}</div>` : ''}
  `;
  return el;
}
