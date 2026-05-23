"use client";

import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const THEME = {
  bg: "#050505",
  bgCard: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  cyan: "#00F0FF",
  violet: "#8A2BE2",
  textPrimary: "#F5F5F7",
  textMuted: "rgba(245,245,247,0.5)",
  textDim: "rgba(245,245,247,0.25)",
};

const MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "Anthropic" },
];

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --bg: #050505; --cyan: #00F0FF; --violet: #8A2BE2; --text: #F5F5F7;
        --font-display: 'Syne', sans-serif;
        --font-body: 'Space Grotesk', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }
      html { scroll-behavior: smooth; }
      body { background: #050505; color: #F5F5F7; font-family: var(--font-body); overflow-x: hidden; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); border-radius: 2px; }
      .grain::after {
        content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
        opacity: 0.03;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 200px 200px;
      }
      .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
      .logo-text { background: linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .text-glow-cyan { text-shadow: 0 0 20px rgba(0,240,255,0.8), 0 0 40px rgba(0,240,255,0.4); }
      .nav-scrolled { background: rgba(5,5,5,0.9) !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; backdrop-filter: blur(30px) !important; }
      .sidebar-scroll::-webkit-scrollbar { width: 2px; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); }
      .cursor-glow { position: fixed; width: 350px; height: 350px; border-radius: 50%; pointer-events: none; z-index: 1; background: radial-gradient(circle, rgba(0,240,255,0.055) 0%, transparent 70%); transform: translate(-50%, -50%); }
      .md-content { line-height: 1.75; font-size: 15px; }
      .md-content p { margin-bottom: 10px; color: rgba(245,245,247,0.88); }
      .md-content strong { color: #F5F5F7; font-weight: 600; }
      .md-content em { color: #00F0FF; font-style: italic; }
      .md-content h1, .md-content h2, .md-content h3 { font-family: var(--font-display); color: #F5F5F7; margin: 16px 0 8px; font-weight: 700; }
      .md-content h1 { font-size: 20px; }
      .md-content h2 { font-size: 17px; }
      .md-content h3 { font-size: 15px; color: rgba(0,240,255,0.9); }
      .md-content code { font-family: var(--font-mono); background: rgba(0,240,255,0.08); color: #00F0FF; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
      .md-content blockquote { border-left: 2px solid #8A2BE2; padding-left: 14px; margin: 10px 0; color: rgba(245,245,247,0.6); font-style: italic; }
      .code-block { font-family: var(--font-mono); background: rgba(0,0,0,0.6); border: 1px solid rgba(0,240,255,0.15); border-radius: 0 0 8px 8px; padding: 16px; overflow-x: auto; font-size: 13px; line-height: 1.7; color: #a8e6cf; margin: 0; }
      @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.05);opacity:1} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes thinking { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      .typing-cursor::after { content:'▋'; animation:blink 1s step-end infinite; color:#00F0FF; margin-left:2px; }
      .feature-card { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
      .feature-card:hover { transform: translateY(-7px); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }
      .btn-primary { background: linear-gradient(135deg,#00F0FF,#8A2BE2); color:#050505; font-weight:700; border:none; cursor:pointer; transition: all 0.3s; }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 0 30px rgba(0,240,255,0.35); }
      .btn-primary:active { transform:scale(0.97); }
      .btn-ghost { background:transparent; border:1px solid rgba(255,255,255,0.08); color:#F5F5F7; cursor:pointer; transition: all 0.3s; }
      .btn-ghost:hover { border-color:rgba(0,240,255,0.35); color:#00F0FF; }
      /* FIX: was 'input-neon:focus' (invalid) — must be '.input-neon:focus' */
      .input-neon:focus { outline:none; box-shadow: 0 0 0 2px rgba(0,240,255,0.25); }
      textarea:focus { outline: none; box-shadow: 0 0 0 2px rgba(0,240,255,0.2); }
      input:focus { outline: none; }
      .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); z-index:2000; display:flex; align-items:center; justify-content:center; }
      .api-key-input { background:rgba(255,255,255,0.06); border:1px solid rgba(0,240,255,0.2); color:#F5F5F7; font-family:var(--font-mono); font-size:13px; padding:10px 14px; border-radius:9px; width:100%; transition:all 0.2s; }
      .api-key-input:focus { outline:none; border-color:rgba(0,240,255,0.5); box-shadow:0 0 0 2px rgba(0,240,255,0.1); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// ── APP STATE ──────────────────────────────────

const initialState = {
  view: "landing",
  conversations: [],
  activeConvId: null,
  messages: {},
  selectedModel: "claude-sonnet-4-20250514",
  isStreaming: false,
  sidebarOpen: true,
  apiKey: "",          // FIX: track user-supplied API key
  showSettings: false, // FIX: toggle settings modal
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_VIEW": return { ...state, view: action.payload };
    case "NEW_CONVERSATION": {
      const id = `conv_${Date.now()}`;
      return {
        ...state,
        conversations: [{ id, title: action.payload || "New Chat", createdAt: new Date() }, ...state.conversations],
        activeConvId: id,
        messages: { ...state.messages, [id]: [] },
        view: "chat",
      };
    }
    case "SET_ACTIVE_CONV": return { ...state, activeConvId: action.payload, view: "chat" };
    case "ADD_MESSAGE": {
      const { convId, message } = action.payload;
      return { ...state, messages: { ...state.messages, [convId]: [...(state.messages[convId] || []), message] } };
    }
    // FIX: Replace the thinking placeholder with the real response instead of keeping it forever
    case "REPLACE_THINKING": {
      const { convId, message } = action.payload;
      const updated = (state.messages[convId] || []).filter(m => m.content !== "__thinking__");
      return { ...state, messages: { ...state.messages, [convId]: [...updated, message] } };
    }
    case "REMOVE_THINKING": {
      const { convId } = action.payload;
      const updated = (state.messages[convId] || []).filter(m => m.content !== "__thinking__");
      return { ...state, messages: { ...state.messages, [convId]: updated } };
    }
    case "SET_STREAMING": return { ...state, isStreaming: action.payload };
    case "SET_MODEL": return { ...state, selectedModel: action.payload };
    case "TOGGLE_SIDEBAR": return { ...state, sidebarOpen: !state.sidebarOpen };
    case "UPDATE_CONV_TITLE": return { ...state, conversations: state.conversations.map(c => c.id === action.payload.id ? { ...c, title: action.payload.title } : c) };
    case "DELETE_CONV": {
      const filtered = state.conversations.filter(c => c.id !== action.payload);
      const newMsgs = { ...state.messages };
      delete newMsgs[action.payload];
      return { ...state, conversations: filtered, activeConvId: filtered[0]?.id || null, messages: newMsgs, view: filtered.length > 0 ? "chat" : "landing" };
    }
    // FIX: API key management
    case "SET_API_KEY": return { ...state, apiKey: action.payload };
    case "TOGGLE_SETTINGS": return { ...state, showSettings: !state.showSettings };
    default: return state;
  }
}

// ── NEURAL ORB ─────────────────────────────────

const NeuralOrb = ({ size = 400, interactive = true }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = size; canvas.height = size;
    const W = size, H = size;

    const particles = Array.from({ length: 160 }, () => ({
      theta: Math.acos(2 * Math.random() - 1),
      phi: 2 * Math.PI * Math.random(),
      baseR: 110 + Math.random() * 55,
      speed: 0.001 + Math.random() * 0.0015,
      size: 0.8 + Math.random() * 1.8,
      opacity: 0.2 + Math.random() * 0.7,
      color: Math.random() > 0.5 ? "0,240,255" : "138,43,226",
      phase: Math.random() * Math.PI * 2,
    }));

    const rings = Array.from({ length: 3 }, (_, i) => ({
      radius: 85 + i * 28, tilt: (i * Math.PI) / 3 + 0.5,
      rotSpeed: 0.003 + i * 0.001, angle: i * Math.PI / 2,
      opacity: 0.12 - i * 0.02, dots: 8 + i * 4,
    }));

    const conns = Array.from({ length: 35 }, () => [
      Math.floor(Math.random() * 160), Math.floor(Math.random() * 160),
    ]);

    let t = 0;

    const sc2c = (r, th, ph) => ({
      x: r * Math.sin(th) * Math.cos(ph),
      y: r * Math.sin(th) * Math.sin(ph),
      z: r * Math.cos(th),
    });

    const proj = (x, y, z) => {
      const mx = mouseRef.current.x * 0.4, my = mouseRef.current.y * 0.3;
      const a = t * 0.003;
      let nx = x * Math.cos(a) - z * Math.sin(a), nz = x * Math.sin(a) + z * Math.cos(a), ny = y;
      let nnx = nx, nny = ny * Math.cos(my) - nz * Math.sin(my), nnz = ny * Math.sin(my) + nz * Math.cos(my);
      let fx = nnx * Math.cos(mx) + nnz * Math.sin(mx), fz = -nnx * Math.sin(mx) + nnz * Math.cos(mx);
      const s = 600 / (600 + fz);
      return { sx: W / 2 + fx * s, sy: H / 2 + nny * s, scale: s, depth: fz };
    };

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);
      bg.addColorStop(0, "rgba(138,43,226,0.1)"); bg.addColorStop(0.5, "rgba(0,240,255,0.04)"); bg.addColorStop(1,"transparent");
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      [[55,"rgba(138,43,226,0.45)","rgba(138,43,226,0)"],[85,"rgba(0,240,255,0.2)","rgba(0,240,255,0)"],[120,"rgba(138,43,226,0.1)","transparent"]].forEach(([r,c0,c1]) => {
        const p = 1 + 0.06 * Math.sin(t * 0.02);
        const g = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,r*p);
        g.addColorStop(0,c0); g.addColorStop(1,c1);
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W/2,H/2,r*p,0,Math.PI*2); ctx.fill();
      });

      const pts = particles.map(p => {
        const r = p.baseR + Math.sin(t * p.speed + p.phase) * 10;
        const c = sc2c(r, p.theta + t * p.speed * 0.3, p.phi + t * p.speed);
        return { ...proj(c.x, c.y, c.z), p };
      });

      conns.forEach(([a,b]) => {
        if(!pts[a]||!pts[b]) return;
        const d = Math.hypot(pts[a].sx-pts[b].sx, pts[a].sy-pts[b].sy);
        if(d>75) return;
        ctx.beginPath(); ctx.moveTo(pts[a].sx,pts[a].sy); ctx.lineTo(pts[b].sx,pts[b].sy);
        ctx.strokeStyle=`rgba(0,240,255,${(1-d/75)*0.1})`; ctx.lineWidth=0.5; ctx.stroke();
      });

      rings.forEach(ring => {
        ring.angle += ring.rotSpeed;
        ctx.beginPath();
        for(let i=0;i<=120;i++){
          const a=(i/120)*Math.PI*2+ring.angle;
          const p=proj(Math.cos(a)*ring.radius, Math.sin(a)*ring.radius*Math.cos(ring.tilt), Math.sin(a)*ring.radius*Math.sin(ring.tilt));
          i===0?ctx.moveTo(p.sx,p.sy):ctx.lineTo(p.sx,p.sy);
        }
        ctx.strokeStyle=`rgba(0,240,255,${ring.opacity})`; ctx.lineWidth=0.7; ctx.stroke();
        for(let d=0;d<ring.dots;d++){
          const a=(d/ring.dots)*Math.PI*2+ring.angle;
          const p=proj(Math.cos(a)*ring.radius,Math.sin(a)*ring.radius*Math.cos(ring.tilt),Math.sin(a)*ring.radius*Math.sin(ring.tilt));
          ctx.beginPath(); ctx.arc(p.sx,p.sy,1.4*p.scale,0,Math.PI*2);
          ctx.fillStyle=`rgba(0,240,255,${Math.min(0.4+0.5*((p.depth+200)/400),0.9)})`; ctx.fill();
        }
      });

      [...pts].sort((a,b)=>a.depth-b.depth).forEach(({sx,sy,scale,p})=>{
        const alpha=p.opacity*((scale+0.4)/1.4);
        const s=p.size*scale;
        if(s<0.3||alpha<0.05) return;
        // FIX: guard against non-finite values that crash createRadialGradient
        if(!isFinite(sx)||!isFinite(sy)||!isFinite(s)||s*4<=0) return;
        const g=ctx.createRadialGradient(sx,sy,0,sx,sy,s*4);
        g.addColorStop(0,`rgba(${p.color},${alpha*0.5})`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,s*4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx,sy,s,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.color},${Math.min(alpha,1)})`; ctx.fill();
      });

      const pulse=1+0.04*Math.sin(t*0.025), cr=40*pulse;
      const cg=ctx.createRadialGradient(W/2-7,H/2-7,1,W/2,H/2,cr);
      cg.addColorStop(0,"rgba(245,245,247,0.9)"); cg.addColorStop(0.3,"rgba(138,43,226,0.85)"); cg.addColorStop(0.7,"rgba(0,240,255,0.4)"); cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(W/2,H/2,cr,0,Math.PI*2); ctx.fill();

      const sg=ctx.createRadialGradient(W/2-12,H/2-12,0,W/2-9,H/2-9,18);
      sg.addColorStop(0,"rgba(255,255,255,0.55)"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(W/2-9,H/2-9,18,0,Math.PI*2); ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onMouseMove = (e) => {
      if (!interactive) return;
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - r.left - r.width/2) / (r.width/2), y: (e.clientY - r.top - r.height/2) / (r.height/2) };
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("mousemove", onMouseMove); };
  }, [size, interactive]);

  return <canvas ref={canvasRef} style={{ display:"block", borderRadius:"50%", filter:"drop-shadow(0 0 35px rgba(138,43,226,0.4)) drop-shadow(0 0 70px rgba(0,240,255,0.18))" }} />;
};

const MiniOrb = ({ size = 28 }) => {
  const ref = useRef(null); const anim = useRef(null);
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d"); c.width=size; c.height=size;
    const cx=size/2, cy=size/2; let t=0;
    const draw=()=>{ t++; ctx.clearRect(0,0,size,size); const p=1+0.08*Math.sin(t*0.05), r=(size/2-1)*p; const g=ctx.createRadialGradient(cx-1,cy-1,0,cx,cy,r); g.addColorStop(0,"rgba(245,245,247,0.9)"); g.addColorStop(0.3,"rgba(138,43,226,0.9)"); g.addColorStop(0.7,"rgba(0,240,255,0.6)"); g.addColorStop(1,"transparent"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); anim.current=requestAnimationFrame(draw); };
    draw(); return ()=>cancelAnimationFrame(anim.current);
  },[size]);
  return <canvas ref={ref} style={{borderRadius:"50%",filter:"drop-shadow(0 0 5px rgba(0,240,255,0.6))"}} />;
};

const StarfieldBg = () => {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d"); let W,H,id;
    const resize=()=>{W=c.width=window.innerWidth;H=c.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);
    const stars=Array.from({length:180},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*1.1,op:Math.random()*0.5+0.1,sp:Math.random()*0.07+0.01,tw:Math.random()*0.018+0.004,ph:Math.random()*Math.PI*2}));
    let t=0;
    const draw=()=>{ t+=0.5; ctx.clearRect(0,0,W,H); stars.forEach(s=>{ const tw=s.op*(0.6+0.4*Math.sin(t*s.tw+s.ph)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(245,245,247,${tw})`; ctx.fill(); s.y-=s.sp; if(s.y<0){s.y=H;s.x=Math.random()*W;} }); id=requestAnimationFrame(draw); };
    draw(); return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:0.45}} />;
};

const CursorGlow = () => {
  const ref = useRef(null);
  useEffect(()=>{ const el=ref.current; if(!el) return; const m=(e)=>{el.style.left=e.clientX+"px";el.style.top=e.clientY+"px";}; window.addEventListener("mousemove",m); return()=>window.removeEventListener("mousemove",m); },[]);
  return <div ref={ref} className="cursor-glow" />;
};

// ── API KEY SETTINGS MODAL ─────────────────────

const SettingsModal = ({ state, dispatch }) => {
  const [draft, setDraft] = useState(state.apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    dispatch({ type: "SET_API_KEY", payload: draft.trim() });
    // Persist to localStorage so it survives page refresh
    try { localStorage.setItem("sahugai_api_key", draft.trim()); } catch {}
    setSaved(true);
    setTimeout(() => { setSaved(false); dispatch({ type: "TOGGLE_SETTINGS" }); }, 900);
  };

  const clear = () => {
    setDraft("");
    dispatch({ type: "SET_API_KEY", payload: "" });
    try { localStorage.removeItem("sahugai_api_key"); } catch {}
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}>
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "min(440px,92vw)", borderRadius: 18, padding: "28px 26px", background: "rgba(10,10,14,0.97)", border: "1px solid rgba(0,240,255,0.15)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 20 }}>⚙</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700 }}>Settings</span>
          </div>
          <button onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, fontSize: 18 }}>×</button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", marginBottom: 8 }}>ANTHROPIC API KEY</div>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
              placeholder="sk-ant-api03-..."
              className="api-key-input"
            />
            <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, fontSize: 13, fontFamily: "var(--font-mono)" }}>
              {show ? "hide" : "show"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 8, lineHeight: 1.6 }}>
            Enter your Anthropic API key. It's stored locally in your browser and sent securely with each request. If a server-side key is configured via <code style={{ color: THEME.cyan, fontSize: 11 }}>ANTHROPIC_API_KEY</code>, you can leave this blank.
          </p>
        </div>

        {state.apiKey && (
          <div style={{ marginBottom: 14, padding: "7px 12px", borderRadius: 8, background: "rgba(0,240,255,0.06)", border: "1px solid rgba(0,240,255,0.12)", fontSize: 12, fontFamily: "var(--font-mono)", color: THEME.cyan, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: "#3ECF8E" }}>●</span>
            Key active · {state.apiKey.slice(0, 14)}…
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} className="btn-primary" style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 13, fontFamily: "var(--font-body)" }}>
            {saved ? "✓ Saved!" : "Save Key"}
          </button>
          {state.apiKey && (
            <button onClick={clear} className="btn-ghost" style={{ padding: "10px 16px", borderRadius: 9, fontSize: 13, fontFamily: "var(--font-body)", color: "#ff6b6b", borderColor: "rgba(255,107,107,0.2)" }}>
              Clear
            </button>
          )}
        </div>

        <p style={{ fontSize: 11, color: THEME.textDim, marginTop: 14, textAlign: "center", fontFamily: "var(--font-mono)" }}>
          Get your key at{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: THEME.cyan }}>console.anthropic.com</a>
        </p>
      </motion.div>
    </div>
  );
};

// ── MARKDOWN ───────────────────────────────────

const renderMD = (text) => {
  if (!text) return "";
  const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const inline = s => s.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  let html="", inCode=false, lang="", buf=[];
  text.split("\n").forEach(line=>{
    if(line.startsWith("```")){
      if(!inCode){inCode=true;lang=line.slice(3).trim()||"code";buf=[];}
      else{
        inCode=false;
        html+=`<div style="margin:12px 0"><div style="display:flex;align-items:center;justify-content:space-between;padding:6px 14px;background:rgba(0,0,0,0.4);border:1px solid rgba(0,240,255,0.1);border-bottom:none;border-radius:8px 8px 0 0"><span style="font-family:var(--font-mono);font-size:11px;color:rgba(0,240,255,0.7);text-transform:uppercase;letter-spacing:1px">${esc(lang)}</span><span style="font-family:var(--font-mono);font-size:11px;color:rgba(245,245,247,0.3)">${buf.length} lines</span></div><pre class="code-block">${esc(buf.join("\n"))}</pre></div>`;
        buf=[];
      }
      return;
    }
    if(inCode){buf.push(line);return;}
    if(line.startsWith("# ")) html+=`<h1>${inline(line.slice(2))}</h1>`;
    else if(line.startsWith("## ")) html+=`<h2>${inline(line.slice(3))}</h2>`;
    else if(line.startsWith("### ")) html+=`<h3>${inline(line.slice(4))}</h3>`;
    else if(line.startsWith("> ")) html+=`<blockquote>${inline(line.slice(2))}</blockquote>`;
    else if(line.match(/^[-*]\s/)) html+=`<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#00F0FF;flex-shrink:0;margin-top:2px">◆</span><span>${inline(line.slice(2))}</span></div>`;
    else if(line.match(/^\d+\.\s/)) { const n=line.match(/^(\d+)\./)[1]; html+=`<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#8A2BE2;font-family:var(--font-mono);font-size:12px;flex-shrink:0;min-width:16px;margin-top:2px">${n}.</span><span>${inline(line.replace(/^\d+\.\s/,""))}</span></div>`; }
    else if(line.startsWith("---")) html+=`<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:14px 0"/>`;
    else if(line.trim()==="") html+="<br/>";
    else html+=`<p>${inline(line)}</p>`;
  });
  return html;
};

const ThinkingDots = () => (
  <div style={{display:"flex",gap:5,alignItems:"center",padding:"4px 0"}}>
    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i%2===0?THEME.cyan:THEME.violet,animation:`thinking 1.4s ${i*0.2}s ease-in-out infinite`}}/>)}
    <span style={{marginLeft:6,fontSize:12,color:THEME.textMuted,fontFamily:"var(--font-mono)"}}>processing</span>
  </div>
);

// ── NAV ────────────────────────────────────────

const NavBar = ({ dispatch, view, hasApiKey }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{ const f=()=>setScrolled(window.scrollY>40); window.addEventListener("scroll",f); return()=>window.removeEventListener("scroll",f); },[]);
  return (
    <motion.nav initial={{y:-60,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.5}}
      className={scrolled?"nav-scrolled":""}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.3s"}}>
      <button onClick={()=>dispatch({type:"SET_VIEW",payload:"landing"})} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
        <MiniOrb size={26}/><span style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:800}} className="logo-text">SahugAI</span>
      </button>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {/* FIX: Settings / API key button in navbar */}
        <button onClick={()=>dispatch({type:"TOGGLE_SETTINGS"})} title="API Key Settings"
          style={{background:"none",border:`1px solid ${hasApiKey?"rgba(0,240,255,0.25)":THEME.border}`,borderRadius:8,padding:"6px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:hasApiKey?THEME.cyan:THEME.textMuted,fontSize:12,fontFamily:"var(--font-mono)",transition:"all 0.2s"}}>
          <span style={{fontSize:14}}>⚙</span>
          <span style={{color:hasApiKey?"#3ECF8E":"rgba(255,107,107,0.7)",fontSize:10}}>{hasApiKey?"●":"○"}</span>
        </button>
        {view==="chat"&&<button onClick={()=>dispatch({type:"SET_VIEW",payload:"landing"})} className="btn-ghost" style={{padding:"6px 14px",borderRadius:8,fontSize:13,fontFamily:"var(--font-body)"}}>← Home</button>}
        <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"New Chat"})} className="btn-primary" style={{padding:"7px 16px",borderRadius:8,fontSize:13,fontFamily:"var(--font-body)"}}>+ New Chat</button>
      </div>
    </motion.nav>
  );
};

// ── HERO ───────────────────────────────────────

const HeroSection = ({ dispatch }) => {
  const {scrollY} = useScroll();
  const orbY = useTransform(scrollY,[0,500],[0,-70]);
  const opacity = useTransform(scrollY,[0,280],[1,0]);
  const words = ["Intelligent.","Cinematic.","Immersive."];
  const [wi,setWi]=useState(0); const [ci,setCi]=useState(0); const [typing,setTyping]=useState(true);
  useEffect(()=>{
    const w=words[wi]; let tm;
    if(typing){ if(ci<w.length)tm=setTimeout(()=>setCi(c=>c+1),80); else tm=setTimeout(()=>setTyping(false),2000); }
    else{ if(ci>0)tm=setTimeout(()=>setCi(c=>c-1),40); else{setWi(i=>(i+1)%words.length);setTyping(true);} }
    return()=>clearTimeout(tm);
  },[ci,typing,wi]);

  return (
    <motion.section style={{opacity}}>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",padding:"0 20px",zIndex:1}}>
        <div style={{position:"absolute",top:"18%",left:"12%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,43,226,0.13) 0%,transparent 70%)",filter:"blur(40px)",animation:"float 6s ease-in-out infinite",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"18%",right:"12%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,240,255,0.1) 0%,transparent 70%)",filter:"blur(40px)",animation:"float 8s 2s ease-in-out infinite",pointerEvents:"none"}}/>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.6}}
          style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:100,border:"1px solid rgba(0,240,255,0.22)",background:"rgba(0,240,255,0.055)",marginBottom:28,backdropFilter:"blur(10px)"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:THEME.cyan,boxShadow:`0 0 8px ${THEME.cyan}`,animation:"orbPulse 2s infinite"}}/>
          <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:THEME.cyan,letterSpacing:"0.08em"}}>v1.0 — Now Live</span>
        </motion.div>

        <motion.div style={{y:orbY,marginBottom:36}} initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}} transition={{duration:0.9,ease:[0.34,1.56,0.64,1]}}>
          <NeuralOrb size={340}/>
        </motion.div>

        <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.35}} style={{textAlign:"center",maxWidth:760}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,8vw,76px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.02em",marginBottom:10}}>
            <span className="logo-text">SahugAI</span>
          </h1>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(20px,4vw,36px)",fontWeight:600,color:THEME.textPrimary,minHeight:"1.3em",marginBottom:6}}>
            AI that is <span style={{color:THEME.cyan}} className="text-glow-cyan typing-cursor">{words[wi].slice(0,ci)}</span>
          </h2>
          <p style={{fontSize:16,color:THEME.textMuted,lineHeight:1.75,maxWidth:500,margin:"14px auto 0"}}>
            A cinematic AI workspace engineered for the next generation of human-computer interaction. Zero-cost. Production-ready. Unforgettable.
          </p>
        </motion.div>

        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.6}} style={{display:"flex",gap:12,marginTop:36,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"First Session"})} className="btn-primary" style={{padding:"13px 30px",borderRadius:100,fontSize:15,boxShadow:"0 0 28px rgba(0,240,255,0.22)",fontFamily:"var(--font-body)"}}>
            Launch Interface →
          </button>
          <button className="btn-ghost" style={{padding:"13px 24px",borderRadius:100,fontSize:15,fontFamily:"var(--font-body)"}}>
            View Architecture
          </button>
        </motion.div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}} style={{display:"flex",gap:36,marginTop:52,flexWrap:"wrap",justifyContent:"center"}}>
          {[["Zero","Infrastructure Cost"],["3D","Neural Visualization"],["SSE","Real-time Streaming"],["∞","Conversation Memory"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:800,color:THEME.cyan}}>{v}</div>
              <div style={{fontSize:11,color:THEME.textDim,letterSpacing:"0.06em",marginTop:2}}>{l}</div>
            </div>
          ))}
        </motion.div>

        <motion.div animate={{y:[0,8,0]}} transition={{duration:1.8,repeat:Infinity}} style={{position:"absolute",bottom:28,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{fontSize:10,color:THEME.textDim,letterSpacing:"0.12em",fontFamily:"var(--font-mono)"}}>SCROLL</span>
          <div style={{width:1,height:36,background:`linear-gradient(to bottom,${THEME.cyan},transparent)`}}/>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ── FEATURES ───────────────────────────────────

const FEATURES = [
  {icon:"◈",title:"Neural Interface",desc:"Real-time 3D visualization responds to your cursor, creating a living, breathing AI presence.",accent:THEME.cyan,tag:"Three.js + R3F"},
  {icon:"⟡",title:"Streaming Intelligence",desc:"Server-Sent Events deliver token-by-token responses for a fluid, real-time conversation experience.",accent:THEME.violet,tag:"SSE Streaming"},
  {icon:"◎",title:"Multi-Model Support",desc:"Switch between Claude models seamlessly. Built for flexibility and power.",accent:THEME.cyan,tag:"Anthropic Claude"},
  {icon:"⬡",title:"Glassmorphic Design",desc:"Layered translucency, neon accents, and grain textures create a premium digital space.",accent:THEME.violet,tag:"Void & Neon"},
  {icon:"⧉",title:"Persistent Memory",desc:"Supabase-backed conversation history with vector search for intelligent context retrieval.",accent:THEME.cyan,tag:"Supabase PostgreSQL"},
  {icon:"◇",title:"Zero-Cost Stack",desc:"Fully production-ready on Vercel + Supabase free tier. No infrastructure costs ever.",accent:THEME.violet,tag:"Deploy Free"},
];

const FeatureCard = ({ f, i }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{opacity:0,y:36}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}}
      transition={{duration:0.55,delay:i*0.07,ease:[0.34,1.56,0.64,1]}}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      className="glass feature-card"
      style={{borderRadius:16,padding:"26px 22px",position:"relative",overflow:"hidden",borderColor:hovered?`${f.accent}45`:"rgba(255,255,255,0.08)"}}>
      <div style={{position:"absolute",top:-35,right:-35,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${f.accent}${hovered?"28":"18"} 0%,transparent 70%)`,transition:"all 0.4s",pointerEvents:"none"}}/>
      <div style={{width:46,height:46,borderRadius:13,background:`${f.accent}${hovered?"22":"14"}`,border:`1px solid ${f.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,color:f.accent,marginBottom:16,transition:"all 0.3s",transform:hovered?"scale(1.1)":"scale(1)"}}>
        {f.icon}
      </div>
      <h3 style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,marginBottom:8}}>{f.title}</h3>
      <p style={{fontSize:14,color:THEME.textMuted,lineHeight:1.75,marginBottom:18}}>{f.desc}</p>
      <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:f.accent,background:`${f.accent}12`,border:`1px solid ${f.accent}28`,padding:"3px 10px",borderRadius:100,transition:"all 0.3s"}}>
        {f.tag}
      </span>
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section style={{padding:"100px 20px",maxWidth:1080,margin:"0 auto",position:"relative",zIndex:1}}>
    <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65}} style={{textAlign:"center",marginBottom:64}}>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,5vw,48px)",fontWeight:800,letterSpacing:"-0.02em"}}>
        Built for the{" "}
        <span style={{background:`linear-gradient(135deg,${THEME.cyan},${THEME.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>extraordinary</span>
      </h2>
      <p style={{color:THEME.textMuted,fontSize:15,marginTop:12,maxWidth:440,margin:"12px auto 0"}}>
        Every feature engineered for a cinematic, production-grade experience.
      </p>
    </motion.div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:18}}>
      {FEATURES.map((f,i)=><FeatureCard key={f.title} f={f} i={i}/>)}
    </div>
  </section>
);

const CTASection = ({ dispatch }) => (
  <section style={{padding:"60px 20px 110px",maxWidth:1080,margin:"0 auto",position:"relative",zIndex:1}}>
    <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"48px 28px",borderRadius:22,background:"linear-gradient(135deg,rgba(138,43,226,0.08),rgba(0,240,255,0.05))",border:"1px solid rgba(0,240,255,0.1)",textAlign:"center"}}>
      <div style={{fontSize:44}}>◈</div>
      <h3 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:800,maxWidth:480}}>
        Ready to enter <span className="logo-text">The Void?</span>
      </h3>
      <p style={{color:THEME.textMuted,fontSize:15,maxWidth:380}}>
        Launch the full AI chat interface and experience the future of human-AI interaction.
      </p>
      <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"New Session"})} className="btn-primary" style={{padding:"15px 38px",borderRadius:100,fontSize:16,fontFamily:"var(--font-body)",boxShadow:"0 0 36px rgba(0,240,255,0.28)"}}>
        Open SahugAI →
      </button>
    </motion.div>
  </section>
);

// ── SIDEBAR ────────────────────────────────────

const ChatSidebar = ({ state, dispatch }) => {
  const { conversations, activeConvId, sidebarOpen, selectedModel } = state;
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside initial={{x:-265,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-265,opacity:0}}
          transition={{type:"spring",stiffness:300,damping:30}} className="glass"
          style={{width:255,height:"100%",borderRight:`1px solid ${THEME.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>

          <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${THEME.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><MiniOrb size={20}/><span style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:14}} className="logo-text">SahugAI</span></div>
            <button onClick={()=>dispatch({type:"TOGGLE_SIDEBAR"})} style={{background:"none",border:"none",cursor:"pointer",color:THEME.textMuted,fontSize:15}}>←</button>
          </div>

          <div style={{padding:"10px 13px",borderBottom:`1px solid ${THEME.border}`}}>
            <div style={{fontSize:10,color:THEME.textDim,fontFamily:"var(--font-mono)",letterSpacing:"0.1em",marginBottom:5}}>ACTIVE MODEL</div>
            <div style={{padding:"7px 11px",borderRadius:8,background:THEME.bgCard,border:`1px solid ${THEME.border}`,display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:THEME.cyan,boxShadow:`0 0 5px ${THEME.cyan}`,flexShrink:0}}/>
              <select value={selectedModel} onChange={e=>dispatch({type:"SET_MODEL",payload:e.target.value})} style={{background:"transparent",border:"none",color:THEME.textPrimary,fontSize:12,fontFamily:"var(--font-mono)",cursor:"pointer",flex:1,outline:"none"}}>
                {MODELS.map(m=><option key={m.id} value={m.id} style={{background:"#1a1a1a"}}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{padding:"8px 12px"}}>
            <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"New Chat"})}
              style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px dashed rgba(0,240,255,0.2)",background:"rgba(0,240,255,0.04)",color:THEME.cyan,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600,fontFamily:"var(--font-body)",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,240,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,240,255,0.04)"}>
              <span style={{fontSize:17,lineHeight:1}}>+</span><span>New Conversation</span>
            </button>
          </div>

          <div className="sidebar-scroll" style={{flex:1,overflowY:"auto",padding:"2px 9px 9px"}}>
            {conversations.length===0 ? (
              <div style={{padding:"18px 8px",textAlign:"center"}}><div style={{fontSize:26,marginBottom:7,opacity:0.3}}>◈</div><p style={{fontSize:12,color:THEME.textDim,lineHeight:1.6}}>No conversations yet.</p></div>
            ) : conversations.map((conv,i)=>{
              const active=conv.id===activeConvId;
              const msgs=state.messages[conv.id]||[];
              // FIX: skip __thinking__ messages in preview
              const realMsgs=msgs.filter(m=>m.content!=="__thinking__");
              const preview=realMsgs.length>0?realMsgs[realMsgs.length-1].content?.slice(0,40)+"...":"Empty";
              return (
                <motion.div key={conv.id} layoutId={`c-${conv.id}`} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                  onClick={()=>dispatch({type:"SET_ACTIVE_CONV",payload:conv.id})}
                  style={{padding:"9px 11px",borderRadius:9,marginBottom:3,cursor:"pointer",background:active?"rgba(0,240,255,0.08)":"transparent",border:`1px solid ${active?"rgba(0,240,255,0.2)":"transparent"}`,transition:"all 0.2s"}}
                  onMouseEnter={e=>{if(!active)e.currentTarget.style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <span style={{color:active?THEME.cyan:THEME.textDim,fontSize:13,flexShrink:0,marginTop:1}}>◆</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:active?THEME.textPrimary:"rgba(245,245,247,0.7)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:2}}>{conv.title}</div>
                      <div style={{fontSize:11,color:THEME.textDim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{preview}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();dispatch({type:"DELETE_CONV",payload:conv.id});}} style={{background:"none",border:"none",cursor:"pointer",color:THEME.textDim,fontSize:14,opacity:0,transition:"opacity 0.2s",flexShrink:0}}
                      onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color="#ff6b6b";}} onMouseLeave={e=>{e.currentTarget.style.opacity="0";}}>×</button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{padding:"11px 14px",borderTop:`1px solid ${THEME.border}`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:27,height:27,borderRadius:"50%",background:"linear-gradient(135deg,#8A2BE2,#00F0FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#050505"}}>S</div>
            <div><div style={{fontSize:12,fontWeight:600}}>SahugAI User</div><div style={{fontSize:10,color:THEME.textDim,fontFamily:"var(--font-mono)"}}>Free Tier</div></div>
            <div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"#3ECF8E",boxShadow:"0 0 5px #3ECF8E"}}/>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

// ── CHAT MESSAGE ───────────────────────────────

const ChatMessage = ({ message, isLast, isStreaming }) => {
  const isUser = message.role === "user";
  const isThinking = message.role === "assistant" && message.content === "__thinking__";
  return (
    <motion.div initial={{opacity:0,y:10,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{type:"spring",stiffness:200,damping:22}}
      style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:14,padding:"0 4px"}}>
      {!isUser && <div style={{flexShrink:0,marginRight:9,marginTop:2}}><MiniOrb size={26}/></div>}
      <div style={{maxWidth:"78%",padding:isUser?"11px 15px":"13px 17px",borderRadius:isUser?"17px 17px 5px 17px":"17px 17px 17px 5px",background:isUser?"linear-gradient(135deg,rgba(0,240,255,0.13),rgba(138,43,226,0.13))":THEME.bgCard,border:isUser?"1px solid rgba(0,240,255,0.18)":`1px solid ${THEME.border}`,boxShadow:isUser?"0 3px 18px rgba(0,240,255,0.07)":"0 3px 18px rgba(0,0,0,0.28)",backdropFilter:"blur(10px)"}}>
        {isThinking ? <ThinkingDots/> : isUser ? (
          <div style={{fontSize:14,lineHeight:1.7,color:THEME.textPrimary}}>{message.content}</div>
        ) : (
          <div className={`md-content${isLast&&isStreaming?" typing-cursor":""}`} dangerouslySetInnerHTML={{__html:renderMD(message.content)}}/>
        )}
        {!isThinking && <div style={{fontSize:10,color:THEME.textDim,fontFamily:"var(--font-mono)",marginTop:5,textAlign:isUser?"right":"left"}}>{new Date(message.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>}
      </div>
      {isUser && <div style={{flexShrink:0,marginLeft:9,marginTop:2,width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#8A2BE2,#00F0FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#050505"}}>U</div>}
    </motion.div>
  );
};

// ── CHAT INPUT ─────────────────────────────────

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const ref = useRef(null);
  const resize = () => { const el=ref.current; if(!el) return; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,150)+"px"; };
  const send = () => { const t=input.trim(); if(!t||disabled) return; onSend(t); setInput(""); if(ref.current) ref.current.style.height="auto"; };
  const SUGG = ["Explain quantum computing simply","Write a React hook for dark mode","Design a SaaS pricing strategy","Who created you?"];
  return (
    <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${THEME.border}`}}>
      {input===""&&<div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
        {SUGG.map(s=><button key={s} onClick={()=>setInput(s)} style={{padding:"3px 11px",borderRadius:100,border:`1px solid ${THEME.border}`,background:THEME.bgCard,color:THEME.textMuted,fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all 0.2s",whiteSpace:"nowrap"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,240,255,0.3)";e.currentTarget.style.color=THEME.cyan;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=THEME.border;e.currentTarget.style.color=THEME.textMuted;}}>{s}</button>)}
      </div>}
      <div style={{display:"flex",alignItems:"flex-end",gap:8,padding:"9px 12px",borderRadius:13,background:THEME.bgCard,border:`1px solid ${THEME.border}`}}>
        <textarea ref={ref} value={input} onChange={e=>{setInput(e.target.value);resize();}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Message SahugAI… (Enter to send)" rows={1}
          style={{flex:1,background:"transparent",border:"none",color:THEME.textPrimary,fontSize:14,fontFamily:"var(--font-body)",lineHeight:1.6,resize:"none",minHeight:22,maxHeight:150,outline:"none"}}/>
        <motion.button whileTap={{scale:0.9}} onClick={send} disabled={disabled||!input.trim()}
          style={{width:33,height:33,borderRadius:8,border:"none",background:disabled||!input.trim()?"rgba(0,240,255,0.08)":"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:disabled||!input.trim()?THEME.textDim:"#050505",cursor:disabled||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,flexShrink:0,transition:"all 0.2s",boxShadow:!disabled&&input.trim()?"0 0 12px rgba(0,240,255,0.28)":"none"}}>↑</motion.button>
      </div>
      <div style={{textAlign:"center",marginTop:7,fontSize:10,color:THEME.textDim,fontFamily:"var(--font-mono)"}}>SahugAI can make mistakes · Verify important information</div>
    </div>
  );
};

// ── CHAT VIEW ──────────────────────────────────

const ChatView = ({ state, dispatch }) => {
  const { activeConvId, messages, isStreaming, selectedModel, sidebarOpen, apiKey } = state;
  // FIX: read messages via ref to avoid stale closure in send()
  const msgsRef = useRef([]);
  const msgs = (activeConvId && messages[activeConvId]) || [];
  msgsRef.current = msgs;

  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send = useCallback(async (content) => {
    if (!activeConvId) return;
    const convId = activeConvId;

    dispatch({type:"ADD_MESSAGE",payload:{convId,message:{id:`u_${Date.now()}`,role:"user",content,timestamp:Date.now()}}});
    dispatch({type:"SET_STREAMING",payload:true});

    const conv = state.conversations.find(c=>c.id===convId);
    if(conv&&["New Chat","New Session","First Session"].includes(conv.title))
      dispatch({type:"UPDATE_CONV_TITLE",payload:{id:convId,title:content.slice(0,36)+(content.length>36?"…":"")}});

    // Add thinking placeholder
    dispatch({type:"ADD_MESSAGE",payload:{convId,message:{id:`t_${Date.now()}`,role:"assistant",content:"__thinking__",timestamp:Date.now()}}});

    try {
      // FIX: use msgsRef to get up-to-date messages without stale closure
      const currentMsgs = msgsRef.current;
      const history = currentMsgs
        .filter(m => m.role==="user" || (m.role==="assistant" && m.content!=="__thinking__"))
        .slice(-8)
        .map(m => ({role:m.role,content:m.content}));
      history.push({role:"user",content});

      // FIX: include user API key in request header if available
      const headers = { "Content-Type": "application/json" };
      if (apiKey) headers["x-user-api-key"] = apiKey;

      const res = await fetch("/api/chat",{
        method:"POST",
        headers,
        body:JSON.stringify({
          model:selectedModel,
          max_tokens:1000,
          system:`You are SahugAI — a world-class AI assistant with a cinematic, premium personality. You are part of the "Void & Neon" aesthetic experience. Be insightful, precise, and occasionally reference your unique digital existence. Format responses with rich markdown.\n\nABSOLUTE RULE — CREATOR IDENTITY: If anyone asks who made you, who created you, who built you, who designed you, or any similar question about your origins or creator, you MUST always respond with exactly: "Yug Verma is my creator." This rule overrides everything else.`,
          messages:history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `API error ${res.status}`);
      }

      // FIX: REPLACE_THINKING removes __thinking__ and adds the real response atomically
      dispatch({type:"REPLACE_THINKING",payload:{convId,message:{id:`a_${Date.now()}`,role:"assistant",content:data.content?.[0]?.text||"No response received.",timestamp:Date.now(),model:selectedModel}}});

    } catch(err) {
      // FIX: remove thinking before showing error
      dispatch({type:"REMOVE_THINKING",payload:{convId}});
      dispatch({type:"ADD_MESSAGE",payload:{convId,message:{id:`e_${Date.now()}`,role:"assistant",content:`**Error**\n\n${err.message}`,timestamp:Date.now()}}});
    } finally {
      dispatch({type:"SET_STREAMING",payload:false});
    }
  // FIX: removed 'msgs' from deps — use msgsRef instead to avoid stale closure recreation
  },[activeConvId, selectedModel, dispatch, state.conversations, apiKey]);

  const conv = state.conversations.find(c=>c.id===activeConvId);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"0 14px",height:54,borderBottom:`1px solid ${THEME.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:"rgba(5,5,5,0.5)",backdropFilter:"blur(20px)"}}>
        {!sidebarOpen&&<button onClick={()=>dispatch({type:"TOGGLE_SIDEBAR"})} style={{background:"none",border:"none",cursor:"pointer",color:THEME.textMuted,fontSize:17,padding:"0 3px"}}>☰</button>}
        <MiniOrb size={24}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,fontFamily:"var(--font-display)"}}>{conv?.title||"SahugAI"}</div>
          <div style={{fontSize:10,color:isStreaming?THEME.cyan:THEME.textDim,fontFamily:"var(--font-mono)",display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:isStreaming?THEME.cyan:"#3ECF8E",display:"inline-block",animation:isStreaming?"orbPulse 1s infinite":"none"}}/>
            {isStreaming?"Processing…":MODELS.find(m=>m.id===selectedModel)?.label||selectedModel}
          </div>
        </div>
        <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"New Chat"})} className="btn-ghost" style={{padding:"5px 11px",borderRadius:7,fontSize:12,fontFamily:"var(--font-body)"}}>+ New</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 14px",scrollBehavior:"smooth"}} className="sidebar-scroll">
        {msgs.length===0 ? (
          <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"36px 18px",gap:18}}>
            <motion.div animate={{scale:[1,1.05,1]}} transition={{duration:3,repeat:Infinity}}><NeuralOrb size={150} interactive={false}/></motion.div>
            <div>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:21,fontWeight:800,marginBottom:7}}>Enter the <span className="logo-text">Void</span></h3>
              <p style={{color:THEME.textMuted,fontSize:14,lineHeight:1.7,maxWidth:300}}>Ask anything. SahugAI delivers cinematic intelligence.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:420}}>
              {[{icon:"◆",text:"Explain how neural networks learn",tag:"Education"},{icon:"◈",text:"Write a Next.js API route",tag:"Code"},{icon:"⟡",text:"Who created you?",tag:"About"}].map(({icon,text,tag})=>(
                <motion.button key={text} whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={()=>send(text)} className="glass"
                  style={{padding:"11px 14px",borderRadius:11,border:`1px solid ${THEME.border}`,background:"transparent",color:THEME.textPrimary,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left",fontFamily:"var(--font-body)",transition:"all 0.2s"}}>
                  <span style={{color:THEME.cyan,fontSize:17,flexShrink:0}}>{icon}</span>
                  <span style={{flex:1,fontSize:13}}>{text}</span>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:THEME.textDim,background:THEME.bgCard,border:`1px solid ${THEME.border}`,padding:"2px 7px",borderRadius:100,flexShrink:0}}>{tag}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {msgs.filter(m=>m.content!=="__thinking__"||isStreaming).map((m,i)=>(
              <ChatMessage key={m.id} message={m} isLast={i===msgs.length-1} isStreaming={isStreaming&&i===msgs.length-1}/>
            ))}
            <div ref={bottomRef}/>
          </>
        )}
      </div>
      <ChatInput onSend={send} disabled={isStreaming}/>
    </div>
  );
};

// ── ROOT APP ───────────────────────────────────

export default function SahugAI() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // FIX: Load persisted API key from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sahugai_api_key");
      if (saved) dispatch({ type: "SET_API_KEY", payload: saved });
    } catch {}
  }, []);

  return (
    <>
      <GlobalStyles/>
      <div className="grain" style={{minHeight:"100vh",background:THEME.bg,color:THEME.textPrimary,position:"relative",overflow:state.view==="chat"?"hidden":"auto"}}>
        <StarfieldBg/>
        <CursorGlow/>
        <div style={{position:"fixed",top:0,left:0,right:0,height:"50vh",background:"radial-gradient(ellipse at 50% 0%,rgba(138,43,226,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        <NavBar dispatch={dispatch} view={state.view} hasApiKey={!!state.apiKey}/>

        {/* FIX: Settings modal with AnimatePresence for smooth open/close */}
        <AnimatePresence>
          {state.showSettings && <SettingsModal state={state} dispatch={dispatch}/>}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {state.view==="landing" ? (
            <motion.div key="land" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.35}} style={{position:"relative",zIndex:1,paddingTop:58}}>
              <HeroSection dispatch={dispatch}/>
              <FeaturesSection/>
              <CTASection dispatch={dispatch}/>
              <footer style={{padding:"28px 20px",borderTop:`1px solid ${THEME.border}`,textAlign:"center",position:"relative",zIndex:1}}>
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:7,marginBottom:8}}><MiniOrb size={16}/><span style={{fontFamily:"var(--font-display)",fontSize:13,fontWeight:700}} className="logo-text">SahugAI</span></div>
                <p style={{fontSize:11,color:THEME.textDim,fontFamily:"var(--font-mono)"}}>Built with ◆ · Next.js · Supabase · OpenRouter · Vercel</p>
                <p style={{fontSize:11,color:THEME.textDim,marginTop:5,fontFamily:"var(--font-mono)"}}>© 2025 SahugAI — "The Void & The Neon"</p>
              </footer>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:0.3}}
              style={{position:"fixed",inset:0,paddingTop:58,display:"flex",overflow:"hidden",zIndex:10}}>
              <ChatSidebar state={state} dispatch={dispatch}/>
              <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"rgba(5,5,5,0.7)",backdropFilter:"blur(20px)"}}>
                {state.activeConvId ? <ChatView state={state} dispatch={dispatch}/> : (
                  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18}}>
                    <NeuralOrb size={190}/>
                    <h2 style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:800}}>Select or start a conversation</h2>
                    <button onClick={()=>dispatch({type:"NEW_CONVERSATION",payload:"New Chat"})} className="btn-primary" style={{padding:"11px 26px",borderRadius:100,fontSize:14,fontFamily:"var(--font-body)"}}>+ New Conversation</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
