import { useState, useRef, useEffect } from "react";

const MADHABS = [
  { id:"hanafi",  ar:"حنفي",   label:"Hanafi",   region:"Turquie · Asie centrale · Pakistan" },
  { id:"maliki",  ar:"مالكي",  label:"Maliki",   region:"Afrique du Nord · Afrique de l'Ouest" },
  { id:"shafii",  ar:"شافعي",  label:"Shafi'i",  region:"Égypte · Asie du Sud-Est" },
  { id:"hanbali", ar:"حنبلي",  label:"Hanbali",  region:"Arabie Saoudite · Golfe" },
];

const MODES = {
  normal:   { icon:"✦", label:{fr:"Standard",en:"Standard",ar:"عادي",tr:"Standart"}, color:"#c8a96e" },
  beginner: { icon:"🌱", label:{fr:"Débutant",en:"Beginner",ar:"مبتدئ",tr:"Başlangıç"}, color:"#7ec8a0" },
  ramadan:  { icon:"☽", label:{fr:"Ramadan",en:"Ramadan",ar:"رمضان",tr:"Ramazan"}, color:"#a09ee0" },
  convert:  { icon:"🤍", label:{fr:"Converti",en:"Convert",ar:"مسلم جديد",tr:"Yeni Müslüman"}, color:"#e0b07e" },
};

const LANGS = {
  fr:{ name:"FR", dir:"ltr", placeholder:"Posez votre question...", welcomeSub:"Votre compagnon islamique sourcé", you:"Vous", thinking:"Noor réfléchit...", detail:"Sources & détails", share:"Partager", scholar:"Consulter un savant", clearBtn:"Nouvelle conv.", chooseMadhab:"Choisissez votre école juridique", madhابSub:"Noor adaptera ses réponses à votre référence", confirm:"Confirmer", skip:"Passer", disclaimer:"Noor ne délivre pas de fatwas · Consultez un érudit pour votre situation", modeLabel:"Mode :", suggestions:{ normal:["Comment faire la prière Fajr ?","Qu'est-ce que le halal ?","C'est quoi le Ramadan ?","Qu'est-ce que la Sunna ?"], beginner:["C'est quoi l'Islam ?","Comment se convertir ?","Qu'est-ce que le Coran ?","Comment prier ?"], ramadan:["Comment bien jeûner ?","Qu'est-ce que la Nuit du Destin ?","Tarawih : combien de rak'at ?","Peut-on se brosser les dents ?"], convert:["Les 5 piliers de l'Islam","Comment prononcer la Shahada ?","Par où commencer ?","Les prières obligatoires"] } },
  en:{ name:"EN", dir:"ltr", placeholder:"Ask your Islamic question...", welcomeSub:"Your sourced Islamic companion", you:"You", thinking:"Noor is thinking...", detail:"Sources & details", share:"Share", scholar:"Ask a scholar", clearBtn:"New chat", chooseMadhab:"Choose your legal school", madhابSub:"Noor will adapt to your reference", confirm:"Confirm", skip:"Skip", disclaimer:"Noor does not issue fatwas · Consult a scholar for your situation", modeLabel:"Mode:", suggestions:{ normal:["How to perform Fajr prayer?","What is halal food?","What is Ramadan?","What is the Sunnah?"], beginner:["What is Islam?","How to convert to Islam?","What is the Quran?","How to pray?"], ramadan:["How to fast properly?","What is Laylat al-Qadr?","How many Tarawih rak'at?","Can I brush my teeth?"], convert:["The 5 pillars of Islam","How to say the Shahada?","Where to start?","Daily prayers explained"] } },
  ar:{ name:"AR", dir:"rtl", placeholder:"اكتب سؤالك...", welcomeSub:"رفيقك الإسلامي الموثوق", you:"أنت", thinking:"نور يفكر...", detail:"المصادر والتفاصيل", share:"مشاركة", scholar:"استشر عالماً", clearBtn:"محادثة جديدة", chooseMadhab:"اختر مذهبك الفقهي", madhابSub:"سيكيّف نور إجاباته وفق مرجعيتك", confirm:"تأكيد", skip:"تخطي", disclaimer:"نور لا يصدر فتاوى · استشر عالماً لوضعك الخاص", modeLabel:"الوضع:", suggestions:{ normal:["كيف أصلي الفجر؟","ما هو الحلال؟","ما هو رمضان؟","ما هي السنة النبوية؟"], beginner:["ما هو الإسلام؟","كيف أسلم؟","ما هو القرآن؟","كيف أصلي؟"], ramadan:["كيف أصوم صحيح؟","ما هي ليلة القدر؟","كم ركعة التراويح؟","هل أستطيع تفريش أسناني؟"], convert:["أركان الإسلام الخمسة","كيف أنطق الشهادة؟","من أين أبدأ؟","الصلوات اليومية"] } },
  tr:{ name:"TR", dir:"ltr", placeholder:"İslami sorunuzu sorun...", welcomeSub:"Kaynaklı İslami rehberiniz", you:"Siz", thinking:"Noor düşünüyor...", detail:"Kaynaklar", share:"Paylaş", scholar:"Alime danış", clearBtn:"Yeni sohbet", chooseMadhab:"Hukuk mezhebinizi seçin", madhابSub:"Noor cevapları referansınıza göre uyarlayacak", confirm:"Onayla", skip:"Geç", disclaimer:"Noor fetva vermez · Durumunuz için bir alime danışın", modeLabel:"Mod:", suggestions:{ normal:["Sabah namazı nasıl kılınır?","Helal gıda nedir?","Ramazan nedir?","Sünnet nedir?"], beginner:["İslam nedir?","Nasıl Müslüman olunur?","Kuran nedir?","Nasıl namaz kılınır?"], ramadan:["Oruç nasıl tutulur?","Kadir Gecesi nedir?","Teravih kaç rekat?","Diş fırçalanabilir mi?"], convert:["İslam'ın 5 şartı","Kelime-i şehadet nasıl söylenir?","Nereden başlamalı?","Günlük namazlar"] } },
};Partie 2/3 — colle juste après :

function buildPrompt(madhab, mode) {
  const m = madhab ? `User follows the ${madhab.label} madhab. Prioritize ${madhab.label} positions. Briefly note important differences with other madhabs when relevant.` : "Present all four Sunni madhab positions neutrally.";
  const mo = { beginner:"User is a BEGINNER. Use very simple language. Avoid untranslated Arabic terms. Be warm, encouraging, never overwhelming.", ramadan:"User is asking about RAMADAN. Focus on fasting rules, Tarawih, Laylat al-Qadr, spiritual dimensions. Be inspiring and practical.", convert:"User is a NEW CONVERT or considering conversion. Be welcoming, patient, celebratory. Start from the very basics.", normal:"User has general Islamic knowledge. Be balanced and informative." }[mode] || "";
  return `You are Noor (نور), a compassionate and knowledgeable Islamic AI assistant.\n\nMADHAB: ${m}\nUSER CONTEXT: ${mo}\n\nRESPONSE FORMAT — MANDATORY:\n\n[Your warm, clear explanation — 2 to 4 short paragraphs, no citations]\n\n---SOURCES---\n[Exact sources: Quran [Surah Name X:Y], Hadith [Collector #number]]\n\nRULES:\n1. Never issue a fatwa — always recommend consulting a qualified scholar\n2. Politely refuse anything haram or disrespectful to Islam\n3. Automatically detect and respond in the user's language\n4. Tone: warm and humble, like a knowledgeable elder sibling\n5. Never fabricate Quranic verses or hadiths\n6. Add ⚠️ on sensitive topics: divorce, finance, medical\n\nFORBIDDEN: fabricating texts, takfir, sectarian attacks, political statements.`;
}

function parseResponse(text) {
  if (!text) return { simple: "", sources: null };
  const markers = ["---SOURCES---", "--- SOURCES ---", "**Sources**", "Sources :"];
  for (const marker of markers) {
    const idx = text.indexOf(marker);
    if (idx > 10) return { simple: text.slice(0, idx).trim(), sources: text.slice(idx + marker.length).trim() };
  }
  return { simple: text, sources: null };
}

function RenderText({ text, gold }) {
  if (!text) return null;
  const parts = String(text).split(/(\[(?:Quran|Surah|Al-|Bukhari|Muslim|Abu Dawud|Tirmidhi|Nasa'i|Ibn Majah|Sahih|Sunan|Jami)[^\]]*\])/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith("[") && p.endsWith("]")) return <span key={i} style={{background:"rgba(200,169,110,0.13)",border:"1px solid rgba(200,169,110,0.3)",borderRadius:"4px",padding:"1px 7px",fontSize:"0.78em",color:gold,fontFamily:"monospace",margin:"0 2px",display:"inline-block"}}>{p}</span>;
        return p.split("\n").map((line, j, arr) => <span key={j}>{line}{j < arr.length-1 ? <br/> : null}</span>);
      })}
    </span>
  );
}

function Bubble({ m, L, C, onShare, onScholar }) {
  const [open, setOpen] = useState(false);
  const isUser = m.role === "user";
  const parsed = isUser ? null : parseResponse(m.content);
  const hasSrc = !isUser && parsed?.sources && parsed.sources.length > 8;
  const sensitive = !isUser && /divorce|haram|halal|finance|nikah|⚠️|talaq|riba/i.test(m.content);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:"4px"}} className="msg-in">
      <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(200,169,110,0.34)",paddingLeft:isUser?0:"2px",paddingRight:isUser?"2px":0}}>{isUser ? L.you : "نور · Noor"}</div>
      <div style={{maxWidth:"88%",background:isUser?"linear-gradient(135deg,rgba(200,169,110,0.17),rgba(200,169,110,0.08))":"rgba(255,255,255,0.038)",border:`1px solid ${isUser?"rgba(200,169,110,0.27)":"rgba(255,255,255,0.07)"}`,borderRadius:isUser?"16px 16px 3px 16px":"16px 16px 16px 3px",padding:"11px 15px",fontSize:"0.875rem",lineHeight:"1.72",color:isUser?C.text:"#d8ccb8",direction:L.dir,wordBreak:"break-word"}}>
        <RenderText text={isUser ? m.content : (parsed?.simple || m.content)} gold={C.gold}/>
      </div>
      {hasSrc && (
        <div style={{maxWidth:"88%",alignSelf:"flex-start"}}>
          <button onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"1px solid rgba(200,169,110,0.18)",borderRadius:"20px",color:"rgba(200,169,110,0.55)",fontSize:"0.68rem",padding:"3px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <span>{open?"▲":"▼"}</span><span>{L.detail}</span>
          </button>
          {open && <div style={{marginTop:"6px",background:"rgba(200,169,110,0.04)",border:"1px solid rgba(200,169,110,0.14)",borderRadius:"12px",padding:"10px 14px",fontSize:"0.79rem",lineHeight:"1.7",color:"rgba(200,169,110,0.78)",direction:L.dir}}><RenderText text={parsed?.sources||""} gold={C.gold}/></div>}
        </div>
      )}
      {!isUser && (
        <div style={{display:"flex",gap:"6px",alignSelf:"flex-start",flexWrap:"wrap"}}>
          <button onClick={()=>onShare(parsed?.simple||m.content)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",color:"rgba(232,220,200,0.38)",fontSize:"0.66rem",padding:"3px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><span>📤</span><span>{L.share}</span></button>
          {sensitive && <button onClick={onScholar} style={{background:"rgba(200,169,110,0.07)",border:"1px solid rgba(200,169,110,0.22)",borderRadius:"16px",color:"rgba(200,169,110,0.65)",fontSize:"0.66rem",padding:"3px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><span>🕌</span><span>{L.scholar}</span></button>}
        </div>
      )}
    </div>
  );
}

function Onboarding({ L, onDone }) {
  const [sel, setSel] = useState(null);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(5,10,16,0.98)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{maxWidth:"400px",width:"100%",textAlign:"center"}}>
        <div style={{fontFamily:"'Amiri',serif",fontSize:"2.4rem",color:"#c8a96e",textShadow:"0 0 40px rgba(200,169,110,0.3)",marginBottom:"2px"}}>نـور</div>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.28em",textTransform:"uppercase",color:"rgba(200,169,110,0.45)",marginBottom:"28px"}}>NOOR · بِسْمِ اللَّهِ</div>
        <div style={{fontSize:"0.98rem",color:"#e4d8c4",fontFamily:"'Lora',serif",marginBottom:"4px"}}>{L.chooseMadhab}</div>
        <div style={{fontSize:"0.73rem",color:"rgba(228,216,196,0.42)",marginBottom:"18px"}}>{L.madhابSub}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"18px"}}>
          {MADHABS.map(m=>(
            <button key={m.id} onClick={()=>setSel(m)} style={{background:sel?.id===m.id?"rgba(200,169,110,0.13)":"rgba(255,255,255,0.028)",border:`1px solid ${sel?.id===m.id?"rgba(200,169,110,0.48)":"rgba(255,255,255,0.07)"}`,borderRadius:"12px",padding:"11px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontFamily:"'Amiri',serif",fontSize:"1.1rem",color:"#c8a96e"}}>{m.ar}</span>
                <span style={{fontSize:"0.88rem",color:"#e4d8c4",fontFamily:"'Lora',serif"}}>{m.label}</span>
              </div>
              <span style={{fontSize:"0.68rem",color:"rgba(228,216,196,0.38)"}}>{m.region}</span>
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
          <button onClick={()=>onDone(null)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"10px",color:"rgba(228,216,196,0.42)",padding:"9px 18px",cursor:"pointer",fontSize:"0.8rem"}}>{L.skip}</button>
          <button onClick={()=>onDone(sel)} style={{background:sel?"linear-gradient(135deg,#c8a96e,#9a7040)":"rgba(200,169,110,0.1)",border:"none",borderRadius:"10px",color:sel?"#fff":"rgba(200,169,110,0.28)",padding:"9px 22px",cursor:sel?"pointer":"not-allowed",fontSize:"0.82rem",fontWeight:"600"}}>{L.confirm}</button>
        </div>
      </div>
    </div>
  );
}

function ScholarModal({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onClose}>
      <div style={{background:"linear-gradient(160deg,#0f1923,#0a1018)",border:"1px solid rgba(200,169,110,0.24)",borderRadius:"20px",maxWidth:"380px",width:"100%",padding:"26px 22px",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:"1.8rem",marginBottom:"8px"}}>🕌</div>
        <div style={{fontFamily:"'Amiri',serif",fontSize:"1.25rem",color:"#c8a96e",marginBottom:"8px"}}>Consulter un érudit</div>
        <p style={{fontSize:"0.83rem",color:"rgba(232,220,200,0.6)",lineHeight:"1.7",marginBottom:"18px"}}>Pour les décisions importantes, consultez un érudit qualifié.</p>
        {[{l:"🌐 Islamweb.net",s:"Fatwas en ligne — Multilingue"},{l:"🌐 Dar al-Ifta Égypte",s:"fatwa.org.eg"},{l:"🕌 Mosquée locale",s:"Trouvez un imam près de chez vous"}].map(r=>(
          <div key={r.l} style={{background:"rgba(200,169,110,0.05)",border:"1px solid rgba(200,169,110,0.12)",borderRadius:"10px",padding:"9px 14px",textAlign:"left",marginBottom:"7px"}}>
            <div style={{fontSize:"0.83rem",color:"#e4d8c4"}}>{r.l}</div>
            <div style={{fontSize:"0.7rem",color:"rgba(228,216,196,0.4)"}}>{r.s}</div>
          </div>
        ))}
        <button onClick={onClose} style={{background:"rgba(200,169,110,0.1)",border:"1px solid rgba(200,169,110,0.28)",borderRadius:"10px",color:"#c8a96e",padding:"9px 22px",cursor:"pointer",fontSize:"0.83rem",width:"100%",marginTop:"10px"}}>Fermer</button>
      </div>
    </div>
  );
}
const BgPattern = () => (
  <svg style={{position:"fixed",top:0,right:0,width:"280px",height:"280px",opacity:0.03,pointerEvents:"none",zIndex:0}} viewBox="0 0 200 200">
    <defs><pattern id="geo" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M25,5 L30,20 L45,20 L33,29 L38,44 L25,35 L12,44 L17,29 L5,20 L20,20 Z" fill="none" stroke="#c8a96e" strokeWidth="0.7"/>
    </pattern></defs>
    <rect width="200" height="200" fill="url(#geo)"/>
  </svg>
);

const Divider = () => (
  <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"0 20px",margin:"2px 0"}}>
    <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,transparent,rgba(200,169,110,0.18))"}}/>
    <svg width="13" height="13" viewBox="0 0 20 20"><polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" fill="none" stroke="rgba(200,169,110,0.42)" strokeWidth="1.2"/></svg>
    <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,rgba(200,169,110,0.18),transparent)"}}/>
  </div>
);

export default function NoorAI() {
  const [phase, setPhase] = useState("onboarding");
  const [madhab, setMadhab] = useState(null);
  const [lang, setLang] = useState("fr");
  const [mode, setMode] = useState("normal");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScholar, setShowScholar] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const L = LANGS[lang];
  const C = { gold:"#c8a96e", goldBorder:"rgba(200,169,110,0.2)", bg:"#080e14", surface:"rgba(255,255,255,0.03)", text:"#e4d8c4", textDim:"rgba(228,216,196,0.48)" };

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setError(null);
    const userMsg = { role:"user", content:msg };
    const hist = [...messages, userMsg];
    setMessages(hist);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ system: buildPrompt(madhab, mode), messages: hist }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...hist, { role:"assistant", content:data.content?.[0]?.text||"..." }]);
    } catch { setError("Erreur de connexion. Réessayez."); }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} };
  const autoResize = (e) => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; };
  const shareResponse = (text) => {
    const msg = `*Noor AI — Réponse islamique sourcée*\n\n${text}\n\n_noor-ai.vercel.app_`;
    if (navigator.share) navigator.share({text:msg}).catch(()=>{});
    else window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#080e14}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes blink{0%,100%{opacity:.25;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}.msg-in{animation:fadeUp .28s ease-out both}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(200,169,110,0.17);border-radius:2px}textarea::placeholder{color:rgba(200,169,110,0.27)}textarea:focus{border-color:rgba(200,169,110,0.44)!important;outline:none}button{transition:opacity 0.15s;font-family:inherit}button:hover{opacity:0.82}`}</style>
      {phase==="onboarding" && <Onboarding L={L} onDone={(m)=>{setMadhab(m);setPhase("chat");}}/>}
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"'Lora',Georgia,serif",color:C.text,position:"relative",overflow:"hidden"}}>
        <BgPattern/>
        <div style={{flexShrink:0,zIndex:10,position:"relative",background:"linear-gradient(180deg,rgba(200,169,110,0.06) 0%,transparent 100%)",borderBottom:`1px solid ${C.goldBorder}`,padding:"11px 14px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"9px"}}>
            <div style={{display:"flex",gap:"4px"}}>
              {Object.keys(LANGS).map(k=>(
                <button key={k} onClick={()=>setLang(k)} style={{padding:"3px 8px",borderRadius:"16px",border:`1px solid ${lang===k?C.gold:C.goldBorder}`,background:lang===k?"rgba(200,169,110,0.13)":"transparent",color:lang===k?C.gold:C.textDim,fontSize:"0.67rem",cursor:"pointer"}}>{LANGS[k].name}</button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
              <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"radial-gradient(circle at 32% 32%,#d4b07a,#7a5c2e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",boxShadow:"0 0 14px rgba(200,169,110,0.3)"}}>☽</div>
              <div>
                <div style={{fontSize:"1.05rem",fontWeight:"700",color:C.text,letterSpacing:"0.18em",textTransform:"uppercase",lineHeight:1}}>NOOR</div>
                <div style={{fontFamily:"'Amiri',serif",fontSize:"0.85rem",color:C.gold,textAlign:"center",lineHeight:1}}>نـور</div>
              </div>
            </div>
            <button onClick={()=>setMessages([])} style={{background:"transparent",border:`1px solid ${C.goldBorder}`,borderRadius:"8px",color:C.textDim,fontSize:"0.63rem",padding:"4px 8px",cursor:"pointer",whiteSpace:"nowrap"}}>↺ {L.clearBtn}</button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"5px",marginBottom:"9px",flexWrap:"wrap"}}>
            {Object.entries(MODES).map(([k,v])=>{
              const active=mode===k;
              return <button key={k} onClick={()=>{setMode(k);setMessages([]);}} style={{padding:"4px 10px",borderRadius:"20px",border:`1px solid ${active?v.color:"rgba(255,255,255,0.07)"}`,background:active?`${v.color}1a`:"transparent",color:active?v.color:C.textDim,fontSize:"0.67rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><span>{v.icon}</span><span>{v.label[lang]||v.label.fr}</span></button>;
            })}
          </div>
          {madhab && <div style={{textAlign:"center",marginBottom:"7px"}}><span style={{background:"rgba(200,169,110,0.07)",border:`1px solid ${C.goldBorder}`,borderRadius:"20px",padding:"2px 12px",fontSize:"0.66rem",color:"rgba(200,169,110,0.55)"}}>{madhab.ar} · {madhab.label}</span></div>}
          <Divider/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 14px 6px",display:"flex",flexDirection:"column",gap:"14px",maxWidth:"740px",margin:"0 auto",width:"100%",position:"relative",zIndex:5}}>
          {messages.length===0 && (
            <div className="msg-in" style={{marginTop:"8px"}}>
              <div style={{textAlign:"center",padding:"20px 16px 16px",borderRadius:"16px",border:`1px solid ${C.goldBorder}`,background:"rgba(200,169,110,0.022)",marginBottom:"14px"}}>
                <div style={{fontFamily:"'Amiri',serif",fontSize:"1.4rem",color:C.gold,marginBottom:"6px"}}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
                <div style={{fontSize:"0.68rem",color:C.textDim,letterSpacing:"0.14em",textTransform:"uppercase"}}>{L.welcomeSub}</div>
                {madhab && <div style={{fontSize:"0.72rem",color:"rgba(200,169,110,0.45)",marginTop:"5px"}}>{madhab.label} · {madhab.region}</div>}
              </div>
              <div style={{fontSize:"0.63rem",color:C.textDim,letterSpacing:"0.17em",textTransform:"uppercase",marginBottom:"8px",textAlign:"center"}}>{L.modeLabel} {MODES[mode].icon} {MODES[mode].label[lang]||MODES[mode].label.fr}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"7px",justifyContent:"center"}}>
                {(L.suggestions[mode]||L.suggestions.normal).map(s=>(
                  <button key={s} onClick={()=>sendMessage(s)} style={{background:C.surface,border:`1px solid ${C.goldBorder}`,borderRadius:"20px",color:C.textDim,fontSize:"0.77rem",padding:"7px 13px",cursor:"pointer",fontFamily:"'Lora',serif",direction:L.dir,lineHeight:1.3}}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m,i)=><Bubble key={i} m={m} L={L} C={C} onShare={shareResponse} onScholar={()=>setShowScholar(true)}/>)}
          {loading && (
            <div className="msg-in" style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"3px"}}>
              <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(200,169,110,0.33)"}}>نور · Noor</div>
              <div style={{background:"rgba(255,255,255,0.034)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px 16px 16px 3px",padding:"12px 17px",display:"flex",gap:"6px",alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:C.gold,animation:`blink 1.2s ease-in-out ${i*0.22}s infinite`}}/>)}
                <span style={{fontSize:"0.71rem",color:C.textDim,marginLeft:"5px"}}>{L.thinking}</span>
              </div>
            </div>
          )}
          {error && <div style={{textAlign:"center",fontSize:"0.79rem",color:"#e07070",padding:"8px 14px",background:"rgba(220,80,80,0.07)",border:"1px solid rgba(220,80,80,0.18)",borderRadius:"10px"}}>{error}</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{flexShrink:0,zIndex:10,padding:"9px 14px 14px",borderTop:`1px solid ${C.goldBorder}`,background:"rgba(8,14,20,0.96)"}}>
          <div style={{maxWidth:"740px",margin:"0 auto",display:"flex",gap:"9px",alignItems:"flex-end"}}>
            <textarea ref={textareaRef} value={input} onChange={e=>{setInput(e.target.value);autoResize(e);}} onKeyDown={handleKey} placeholder={L.placeholder} rows={1} dir={L.dir} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.goldBorder}`,borderRadius:"12px",color:C.text,padding:"11px 13px",fontSize:"0.875rem",fontFamily:"'Lora',Georgia,serif",resize:"none",minHeight:"44px",maxHeight:"120px",overflowY:"auto",lineHeight:"1.5"}}/>
            <button onClick={()=>sendMessage()} disabled={loading||!input.trim()} style={{width:"44px",height:"44px",borderRadius:"12px",border:"none",background:(!loading&&input.trim())?"linear-gradient(135deg,#c8a96e,#9a7040)":"rgba(200,169,110,0.1)",cursor:(!loading&&input.trim())?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:(!loading&&input.trim())?"0 4px 14px rgba(200,169,110,0.24)":"none"}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke={(!loading&&input.trim())?"#fff":"rgba(200,169,110,0.28)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div style={{maxWidth:"740px",margin:"6px auto 0",fontSize:"0.59rem",color:"rgba(200,169,110,0.23)",textAlign:"center",letterSpacing:"0.12em"}}>{L.disclaimer}</div>
        </div>
        {showScholar && <ScholarModal onClose={()=>setShowScholar(false)}/>}
      </div>
    </>
  );
}


Dis moi quand c’est collé, partie 3 arrive !​​​​​​​​​​​​​​​​

