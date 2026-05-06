"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, BarChart3, Zap, PieChart, Shield, Newspaper, Cloud } from "lucide-react";
import HeroWorkstation from "./HeroWorkstation";

const f = (d=0) => ({
  initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},
  viewport:{once:true,amount:0.15},transition:{duration:0.55,delay:d,ease:[.25,.1,.25,1] as const}
});

export default function NewLanding(){
return(
<div style={{background:"#060A10",color:"#E6EDF3",fontFamily:"'Inter',sans-serif",width:"100%",position:"relative"}}>

{/* Ambient orbs */}
<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
  <div className="l-orb" style={{width:700,height:600,top:"-10%",left:"-5%",background:"rgba(59,130,246,0.06)"}}/>
  <div className="l-orb" style={{width:500,height:500,top:"5%",right:"-10%",background:"rgba(0,255,163,0.05)",animationDelay:"-12s"}}/>
  <div className="l-orb" style={{width:400,height:350,bottom:"30%",left:"25%",background:"rgba(139,92,246,0.04)",animationDelay:"-8s"}}/>
</div>

{/* ═══ HERO ═══ */}
<section style={{position:"relative",zIndex:10,paddingTop:140,paddingBottom:100}}>
<div className="l-container">
<div className="l-hero-grid">

  {/* Left — copy */}
  <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:[.25,.1,.25,1] as const}}>
    <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:999,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",marginBottom:28}}>
      <span style={{position:"relative",width:8,height:8}}>
        <span className="l-pulse-ring" style={{position:"absolute",inset:0,borderRadius:"50%",background:"#00FFA3",opacity:0.6}}/>
        <span style={{position:"relative",display:"block",width:8,height:8,borderRadius:"50%",background:"#00FFA3"}}/>
      </span>
      <span className="l-eyebrow" style={{color:"#9CA3AF"}}>TradeSense Pro 2.0</span>
    </div>

    <h1 className="l-headline" style={{fontSize:"clamp(2.5rem,5.5vw,4.5rem)",marginBottom:24}}>
      Trade with<br/><span className="l-grad">intelligence,</span><br/>not instinct.
    </h1>

    <p className="l-body" style={{maxWidth:400,marginBottom:36}}>
      AI-powered consensus signals, institutional-grade charting, and SEBI-accurate profit math — engineered for Indian retail traders who demand precision.
    </p>

    <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:32}}>
      <Link href="/dashboard" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",background:"#00FFA3",color:"#060A10",fontWeight:800,fontSize:14,borderRadius:12,textDecoration:"none",transition:"all 0.2s"}}>
        Launch Terminal <ArrowRight size={14}/>
      </Link>
      <a href="#showcase" style={{display:"inline-flex",alignItems:"center",padding:"14px 28px",border:"1px solid rgba(255,255,255,0.12)",color:"#E6EDF3",fontWeight:600,fontSize:14,borderRadius:12,textDecoration:"none",transition:"all 0.2s"}}>
        See It Live
      </a>
    </div>

    <div style={{display:"flex",gap:24,fontSize:11,color:"#6B7280"}}>
      <span style={{display:"flex",alignItems:"center",gap:6}}><Shield size={12} color="#14B8A6"/>Zero API exposure</span>
      <span style={{display:"flex",alignItems:"center",gap:6}}><Zap size={12} color="#F59E0B"/>13ms latency</span>
    </div>
  </motion.div>

  {/* Right — workstation */}
  <div><HeroWorkstation/></div>

</div>
</div>
</section>

{/* ═══ SOCIAL PROOF STRIP ═══ */}
<section style={{position:"relative",zIndex:10,paddingTop:20,paddingBottom:60}}>
<div className="l-container">
  <div className="l-glass" style={{borderRadius:14,overflow:"hidden",display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
    {[
      {v:"99.97%",l:"Uptime",s:"90-day SLA"},
      {v:"12+",l:"Indicators",s:"Per signal"},
      {v:"~13ms",l:"Latency",s:"Edge-computed"},
      {v:"2,400+",l:"Traders",s:"Active users"},
    ].map((m,i)=>(
      <div key={i} style={{padding:"20px 16px",textAlign:"center",borderRight:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}>
        <div className="l-mono" style={{fontSize:22,fontWeight:800,color:"#fff"}}>{m.v}</div>
        <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{m.l}</div>
        <div style={{fontSize:9,color:"#4B5563"}}>{m.s}</div>
      </div>
    ))}
  </div>
</div>
</section>

{/* ═══ FEATURES — editorial grid ═══ */}
<section id="features" style={{position:"relative",zIndex:10,paddingTop:100,paddingBottom:100,scrollMarginTop:80}}>
<div className="l-container">

  <motion.div {...f()} style={{marginBottom:56}}>
    <p className="l-eyebrow" style={{color:"#3B82F6",marginBottom:12}}>Core Intelligence</p>
    <h2 className="l-headline" style={{fontSize:"clamp(1.8rem,3.5vw,3rem)"}}>
      Six engines.<br/>One terminal.
    </h2>
  </motion.div>

  <div className="l-feature-grid">
    {/* Wide card — AI signals */}
    <motion.div {...f(0.05)} className="l-glass l-lift l-feat-wide" style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"28px 28px 0"}}>
        <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,255,163,0.08)",border:"1px solid rgba(0,255,163,0.15)",color:"#00FFA3",marginBottom:16}}><Zap size={20}/></div>
        <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>AI Consensus Engine</h3>
        <p className="l-body" style={{fontSize:13,maxWidth:420}}>Fuses RSI, MACD, Bollinger, and Moving Averages into one definitive signal with confidence scoring and historical accuracy tracking.</p>
      </div>
      <div style={{marginTop:20,padding:"16px 28px",background:"rgba(6,10,16,0.6)",borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div className="l-mono" style={{fontSize:22,fontWeight:900,color:"#00FFA3",textShadow:"0 0 16px rgba(0,255,163,0.2)"}}>STRONG BUY</div>
          <div className="l-mono" style={{fontSize:10,color:"#6B7280"}}>CONFIDENCE: 86% · 3 of 4 bullish</div>
        </div>
        <div style={{width:100,height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
          <div style={{width:"86%",height:"100%",borderRadius:3,background:"linear-gradient(90deg,#00FFA3,#3B82F6)"}}/>
        </div>
      </div>
    </motion.div>

    {/* TradingView */}
    <motion.div {...f(0.1)} className="l-glass l-lift" style={{padding:24}}>
      <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.15)",color:"#3B82F6",marginBottom:16}}><BarChart3 size={20}/></div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>TradingView Engine</h3>
      <p className="l-body" style={{fontSize:13}}>180-day OHLCV with candlestick rendering at 60fps, MA overlays, and crosshair inspection.</p>
      <div style={{marginTop:16,height:80,borderRadius:10,background:"#080C14",border:"1px solid rgba(255,255,255,0.04)",overflow:"hidden",position:"relative"}}>
        <svg viewBox="0 0 200 60" style={{width:"100%",height:"100%"}} preserveAspectRatio="none">
          <path d="M0,50 L40,35 L80,42 L120,20 L160,28 L200,10" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
        </svg>
      </div>
    </motion.div>

    {/* Portfolio */}
    <motion.div {...f(0.15)} className="l-glass l-lift" style={{padding:24}}>
      <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.15)",color:"#8B5CF6",marginBottom:16}}><PieChart size={20}/></div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>Portfolio Tracker</h3>
      <p className="l-body" style={{fontSize:13}}>FIFO-based holdings with real-time P&L, sector allocation, and performance attribution.</p>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:6,fontSize:12}}>
        {[{t:"TCS",v:"+₹3,200",c:"#00FFA3"},{t:"INFY",v:"-₹1,100",c:"#EF4444"},{t:"HDFC",v:"+₹5,440",c:"#00FFA3"}].map(p=>(
          <div key={p.t} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)"}}>
            <span style={{color:"#9CA3AF"}}>{p.t}</span>
            <span className="l-mono" style={{color:p.c,fontWeight:600}}>{p.v}</span>
          </div>
        ))}
      </div>
    </motion.div>

    {/* SEBI Math */}
    <motion.div {...f(0.2)} className="l-glass l-lift" style={{padding:24}}>
      <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.15)",color:"#F59E0B",marginBottom:16}}><Search size={20}/></div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>SEBI-Compliant Math</h3>
      <p className="l-body" style={{fontSize:13}}>STT, brokerage, stamp duty, STCG/LTCG — see your real net profit, not fantasy numbers.</p>
      <div className="l-mono" style={{marginTop:16,padding:12,borderRadius:10,background:"#080C14",border:"1px solid rgba(255,255,255,0.04)",fontSize:12}}>
        <div style={{display:"flex",justifyContent:"space-between",color:"#6B7280"}}><span>Gross</span><span style={{color:"#fff"}}>+₹14,500</span></div>
        <div style={{display:"flex",justifyContent:"space-between",color:"#6B7280",marginTop:4}}><span>Charges</span><span style={{color:"#EF4444"}}>-₹450</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:"1px solid rgba(255,255,255,0.06)",fontWeight:700}}><span>Net</span><span style={{color:"#00FFA3"}}>+₹14,050</span></div>
      </div>
    </motion.div>

    {/* News sentiment */}
    <motion.div {...f(0.25)} className="l-glass l-lift" style={{padding:24}}>
      <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(20,184,166,0.08)",border:"1px solid rgba(20,184,166,0.15)",color:"#14B8A6",marginBottom:16}}><Newspaper size={20}/></div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>News Sentiment</h3>
      <p className="l-body" style={{fontSize:13}}>AI-parsed market news with sentiment scoring to catch catalysts before they move price.</p>
    </motion.div>

    {/* Security — wide */}
    <motion.div {...f(0.3)} className="l-glass l-lift l-feat-wide" style={{padding:24,display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
      <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.15)",color:"#6366F1",flexShrink:0}}><Cloud size={20}/></div>
      <div style={{flex:1,minWidth:200}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:4}}>Cloudflare Edge Security</h3>
        <p className="l-body" style={{fontSize:13,margin:0}}>API keys never leave Cloudflare Workers. Your browser receives signals — never raw credentials. Zero-trust by architecture.</p>
      </div>
      <div className="l-mono" style={{display:"flex",gap:16,fontSize:11,color:"#6B7280",flexShrink:0}}>
        <span>🔒 E2E encrypted</span><span>⚡ Edge-computed</span><span>🛡️ Zero-trust</span>
      </div>
    </motion.div>
  </div>

</div>
</section>

{/* ═══ PRODUCT SHOWCASE ═══ */}
<section id="showcase" style={{position:"relative",zIndex:10,paddingTop:100,paddingBottom:100,scrollMarginTop:80}}>
<div className="l-container">
  <motion.div {...f()} style={{textAlign:"center",maxWidth:560,marginLeft:"auto",marginRight:"auto",marginBottom:56}}>
    <p className="l-eyebrow" style={{color:"#00FFA3",marginBottom:12}}>Live Preview</p>
    <h2 className="l-headline" style={{fontSize:"clamp(1.8rem,3.5vw,3rem)",marginBottom:12}}>Your command center.</h2>
    <p className="l-body">A Bloomberg-class terminal designed for India&apos;s retail traders — not a toy dashboard.</p>
  </motion.div>

  <motion.div {...f(0.1)} className="l-glass" style={{padding:0,overflow:"hidden",maxWidth:1100,marginLeft:"auto",marginRight:"auto",boxShadow:"0 30px 100px rgba(0,0,0,0.5), 0 0 80px rgba(0,255,163,0.03)"}}>
    {/* Chrome */}
    <div style={{height:36,padding:"0 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(6,10,16,0.9)",display:"flex",alignItems:"center",gap:10}}>
      <div style={{display:"flex",gap:6}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444",opacity:0.7}}/>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#F59E0B",opacity:0.7}}/>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981",opacity:0.7}}/>
      </div>
      <span className="l-mono" style={{fontSize:10,color:"#4B5563"}}>tradesense.pro/terminal</span>
    </div>

    <div className="l-terminal-grid">
      {/* Main panel */}
      <div style={{padding:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:18,fontWeight:800}}>RELIANCE</span>
          <span className="l-mono" style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:"rgba(59,130,246,0.1)",color:"#3B82F6",border:"1px solid rgba(59,130,246,0.2)",fontWeight:700}}>NSE</span>
          <span className="l-mono" style={{fontSize:16,fontWeight:700}}>₹2,847.60</span>
          <span className="l-mono" style={{fontSize:12,color:"#00FFA3",fontWeight:600}}>+1.37%</span>
        </div>
        <div style={{height:220,borderRadius:12,background:"#080C14",border:"1px solid rgba(255,255,255,0.04)",overflow:"hidden",position:"relative",marginBottom:12}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(to right,rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.015) 1px,transparent 1px)",backgroundSize:"36px 36px"}}/>
          <svg viewBox="0 0 400 160" style={{width:"100%",height:"100%"}} preserveAspectRatio="none">
            <defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FFA3" stopOpacity="0.12"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
            <path d="M0,140 L40,120 L80,130 L120,90 L160,100 L200,55 L240,70 L280,40 L320,50 L360,20 L400,35 L400,160 L0,160Z" fill="url(#sf)"/>
            <path d="M0,140 L40,120 L80,130 L120,90 L160,100 L200,55 L240,70 L280,40 L320,50 L360,20 L400,35" fill="none" stroke="#00FFA3" strokeWidth="2"/>
            <path d="M0,130 Q100,115 200,80 T400,45" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
          </svg>
        </div>
        <div className="l-mono" style={{display:"flex",flexWrap:"wrap",gap:16,fontSize:11,color:"#6B7280"}}>
          <span>O <span style={{color:"#9CA3AF"}}>2,821.30</span></span>
          <span>H <span style={{color:"#00FFA3"}}>2,854.90</span></span>
          <span>L <span style={{color:"#EF4444"}}>2,815.60</span></span>
          <span>C <span style={{color:"#9CA3AF"}}>2,847.60</span></span>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{padding:16,background:"rgba(6,10,16,0.5)",borderLeft:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,255,163,0.12)",background:"rgba(0,255,163,0.02)",marginBottom:12}}>
          <div style={{fontSize:9,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Signal</div>
          <div className="l-mono" style={{fontSize:18,fontWeight:900,color:"#00FFA3"}}>STRONG BUY</div>
          <div className="l-mono" style={{fontSize:9,color:"#6B7280"}}>86% confidence</div>
        </div>
        <div style={{padding:12,borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.01)",marginBottom:12}}>
          <div style={{fontSize:9,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Indicators</div>
          {[{n:"RSI (14)",v:"58.3",c:"#00FFA3"},{n:"MACD",v:"Bullish",c:"#00FFA3"},{n:"MA 20",v:"Above",c:"#3B82F6"},{n:"BB",v:"Mid",c:"#F59E0B"}].map(x=>(
            <div key={x.n} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
              <span style={{color:"#6B7280"}}>{x.n}</span>
              <span className="l-mono" style={{color:x.c,fontWeight:600}}>{x.v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:12,borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.01)"}}>
          <div style={{fontSize:9,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Portfolio</div>
          <div className="l-mono" style={{fontSize:20,fontWeight:900,color:"#00FFA3"}}>+₹14,050</div>
          <div style={{fontSize:10,color:"#4B5563"}}>Net after deductions</div>
        </div>
      </div>
    </div>
  </motion.div>
</div>
</section>

{/* ═══ HOW IT WORKS ═══ */}
<section id="how-it-works" style={{position:"relative",zIndex:10,paddingTop:100,paddingBottom:100,scrollMarginTop:80}}>
<div className="l-container">
  <motion.div {...f()} style={{textAlign:"center",maxWidth:500,marginLeft:"auto",marginRight:"auto",marginBottom:64}}>
    <p className="l-eyebrow" style={{color:"#F59E0B",marginBottom:12}}>How It Works</p>
    <h2 className="l-headline" style={{fontSize:"clamp(1.8rem,3.5vw,3rem)"}}>Signal to profit in 4 steps.</h2>
  </motion.div>

  <div className="l-steps-grid">
    {[
      {icon:<Search size={22}/>,n:"01",t:"Search",d:"Find any NSE/BSE stock instantly with real-time lookup and fuzzy matching.",c:"#3B82F6"},
      {icon:<BarChart3 size={22}/>,n:"02",t:"Analyze",d:"180-day OHLCV data with candlestick charting, MA overlays, and volume analysis.",c:"#00FFA3"},
      {icon:<Zap size={22}/>,n:"03",t:"Signal",d:"AI consensus fuses RSI, MACD, Bollinger, and MA into one clear, actionable call.",c:"#F59E0B"},
      {icon:<PieChart size={22}/>,n:"04",t:"Profit",d:"Track SEBI-accurate net returns with STT, brokerage, and tax deductions included.",c:"#14B8A6"},
    ].map((s,i)=>(
      <motion.div key={i} {...f(i*0.08)} style={{textAlign:"center",position:"relative",padding:"32px 20px"}}>
        {i<3 && <div className="hidden lg:block" style={{position:"absolute",top:32,right:0,width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)"}}/>}
        <div style={{width:52,height:52,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:"auto",marginRight:"auto",marginBottom:16,background:`${s.c}10`,border:`1px solid ${s.c}25`,color:s.c}}>
          {s.icon}
        </div>
        <div className="l-mono" style={{fontSize:10,color:"#4B5563",marginBottom:6}}>{s.n}</div>
        <h3 style={{fontSize:17,fontWeight:700,marginBottom:8}}>{s.t}</h3>
        <p className="l-body" style={{fontSize:13,maxWidth:220,marginLeft:"auto",marginRight:"auto"}}>{s.d}</p>
      </motion.div>
    ))}
  </div>
</div>
</section>
{/* ═══ FOUNDER ═══ */}
<section id="founder" style={{position:"relative",zIndex:10,paddingTop:120,paddingBottom:120,overflow:"hidden"}}>

{/* Ambient glow behind section */}
<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:600,background:"radial-gradient(ellipse at center,rgba(0,255,163,0.04) 0%,transparent 70%)",pointerEvents:"none"}}/>

<div className="l-container">

  <motion.div {...f()} style={{textAlign:"center",maxWidth:480,marginLeft:"auto",marginRight:"auto",marginBottom:72}}>
    <p className="l-eyebrow" style={{color:"#8B5CF6",marginBottom:12}}>The Mind Behind</p>
    <h2 className="l-headline" style={{fontSize:"clamp(1.8rem,3.5vw,3rem)"}}>Built by a<br/><span className="l-grad">Trader-Engineer.</span></h2>
  </motion.div>

  <div className="l-founder-grid">

    {/* Left — Photo composition */}
    <motion.div {...f(0.1)} style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>

      {/* Outer neon ring glow */}
      <div style={{position:"absolute",width:320,height:320,borderRadius:"50%",background:"conic-gradient(from 180deg,rgba(0,255,163,0.08),rgba(59,130,246,0.06),rgba(139,92,246,0.06),rgba(0,255,163,0.08))",filter:"blur(40px)",animation:"spin 20s linear infinite"}}/>

      {/* Photo frame */}
      <div style={{position:"relative",width:280,height:340,borderRadius:24,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,255,163,0.04)"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/founder.png"
          alt="Alok Kumar Sahu — Founder of TradeSense Pro"
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}
        />
        {/* Gradient overlay for depth */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 40%,rgba(6,10,16,0.85) 100%)"}}/>
        {/* Name overlay at bottom */}
        <div style={{position:"absolute",bottom:16,left:20,right:20}}>
          <div style={{fontSize:17,fontWeight:800,letterSpacing:"-0.02em"}}>Alok Kumar Sahu</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Founder · TradeSense Pro</div>
        </div>
      </div>

      {/* Floating stat badge */}
      <div className="l-glass" style={{position:"absolute",bottom:24,right:-12,padding:"10px 16px",borderRadius:14,minWidth:120,zIndex:5}}>
        <div className="l-mono" style={{fontSize:20,fontWeight:900,color:"#00FFA3"}}>1</div>
        <div style={{fontSize:10,color:"#6B7280",marginTop:1}}>Solo-built, full-stack</div>
      </div>

    </motion.div>

    {/* Right — Story & details */}
    <motion.div {...f(0.2)} style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:0}}>

      {/* Eyebrow tag */}
      <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.15)",width:"fit-content",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"#8B5CF6"}}/>
        <span style={{fontSize:11,fontWeight:700,color:"#A78BFA",letterSpacing:"0.04em"}}>Currently Building</span>
      </div>

      <h3 style={{fontSize:"clamp(1.5rem,2.5vw,2rem)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.2,marginBottom:16}}>
        Engineering meets<br/>trading intuition.
      </h3>

      <p className="l-body" style={{fontSize:15,maxWidth:440,marginBottom:8,lineHeight:1.7}}>
        I&apos;m a CSE undergraduate and full-stack developer who trades actively on Indian markets. TradeSense Pro exists because I couldn&apos;t find a single platform that combined institutional-grade charting, SEBI-accurate profit math, and AI consensus — without charging ₹15,000/year.
      </p>

      <p className="l-body" style={{fontSize:14,maxWidth:440,marginBottom:28,lineHeight:1.7,color:"#6B7280"}}>
        So I built one. Every line — from the Cloudflare Workers to the TradingView integration — is written by me, solo, with obsessive attention to the workflows real traders actually need.
      </p>

      {/* Skill tags */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>
        {["Next.js","TypeScript","Cloudflare Workers","TradingView","AI Signals","SEBI Math","Portfolio Engine"].map(tag=>(
          <span key={tag} style={{fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",color:"#9CA3AF",letterSpacing:"0.02em"}}>{tag}</span>
        ))}
      </div>

      {/* Social links */}
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        {[
          {href:"https://github.com/alokkumar2510",label:"GitHub",
           icon:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>},
          {href:"https://linkedin.com/in/alokkumarsahu",label:"LinkedIn",
           icon:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>},
          {href:"https://twitter.com/alokkumarsahu",label:"𝕏",
           icon:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
          {href:"https://instagram.com/alokkumarsahu_",label:"Instagram",
           icon:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>},
          {href:"https://alokkumarsahu.in",label:"Portfolio",
           icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>},
        ].map(s=>(
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
             style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#9CA3AF",fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
            {s.icon}
            {s.label}
          </a>
        ))}
      </div>

    </motion.div>

  </div>
</div>
</section>

{/* ═══ CTA ═══ */}
<section style={{position:"relative",zIndex:10,paddingTop:80,paddingBottom:140}}>
<div className="l-container">
  <div style={{position:"relative",maxWidth:720,marginLeft:"auto",marginRight:"auto"}}>
    <div style={{position:"absolute",inset:"-40px",background:"radial-gradient(ellipse at center,rgba(0,255,163,0.06) 0%,transparent 70%)",borderRadius:40,filter:"blur(40px)",pointerEvents:"none"}}/>
    <motion.div {...f()} className="l-glass" style={{padding:"56px 40px",textAlign:"center",position:"relative",boxShadow:"0 20px 80px rgba(0,0,0,0.4), 0 0 60px rgba(0,255,163,0.03)"}}>
      <h2 className="l-headline" style={{fontSize:"clamp(1.6rem,3vw,2.5rem)",marginBottom:16}}>Ready to trade with conviction?</h2>
      <p className="l-body" style={{maxWidth:440,marginLeft:"auto",marginRight:"auto",marginBottom:28}}>
        Professional-grade intelligence for Indian retail traders. Free forever — no credit card, no catch.
      </p>
      <Link href="/dashboard" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"16px 36px",background:"#00FFA3",color:"#060A10",fontWeight:800,fontSize:15,borderRadius:12,textDecoration:"none",boxShadow:"0 4px 32px rgba(0,255,163,0.25)"}}>
        Open Terminal <ArrowRight size={16}/>
      </Link>
    </motion.div>
  </div>
</div>
</section>

</div>
);
}
