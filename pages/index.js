import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";

// ─── STORAGE (localStorage for Replit) ──────────────────
function sGet(k){try{const d=localStorage.getItem(k);return d?JSON.parse(d):null;}catch{return null;}}
function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

// ─── AI (calls /api/ai backend) ─────────────────────────
async function callAI(system,messages,max_tokens=1500){
  const res=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system,messages,max_tokens})});
  if(!res.ok)throw new Error("API error");const data=await res.json();return data.content.map(b=>b.text||"").join("");
}

function today(){return new Date().toISOString().split("T")[0];}

const STATUS={nuevo:{label:"Nuevo",color:"#2563eb",bg:"#dbeafe",icon:"★"},contactado:{label:"Contactado",color:"#d97706",bg:"#FFE3B3",icon:"✉"},interesado:{label:"Interesado",color:"#7c3aed",bg:"#ede9fe",icon:"🎯"},cliente:{label:"Cliente",color:"#7ACE67",bg:"#d4edcc",icon:"✓"},perdido:{label:"Perdido",color:"#c0392b",bg:"#fee2e2",icon:"✕"}};
const TABS=[{id:"prospects",icon:"🔍",label:"Buscar"},{id:"clients",icon:"📋",label:"Clientes"},{id:"route",icon:"🗺️",label:"Ruta"},{id:"prices",icon:"💰",label:"Precios"},{id:"agent",icon:"🤖",label:"Agente"}];
const QUICK=[{label:"🍖 Carnicerías",q:"carnicería"},{label:"🍽️ Restaurantes",q:"restaurante"},{label:"🏪 Mercados",q:"mercado de alimentos"},{label:"🏨 Hoteles",q:"hotel con restaurante"},{label:"🍳 Fuentes de soda",q:"fuente de soda"},{label:"🍕 Pizzerías",q:"pizzería"},{label:"☕ Cafeterías",q:"cafetería"},{label:"🎂 Pastelerías",q:"pastelería"},{label:"🏥 Casinos",q:"casino empresa comedor"},{label:"🐟 Marisquerías",q:"cevichería marisquería"}];

const S={input:{width:"100%",padding:"14px 16px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"14px",color:"#1e293b",fontSize:"16px",outline:"none",fontFamily:"'Nunito',sans-serif"},card:{background:"#fff",borderRadius:"14px",border:"2px solid #e2e8f0",padding:"16px",marginBottom:"10px"},section:{fontSize:"13px",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"10px"},btn:{padding:"14px 24px",background:"linear-gradient(135deg,#31B189,#28967a)",border:"none",borderRadius:"14px",color:"#fff",fontWeight:800,fontSize:"16px",cursor:"pointer",boxShadow:"0 3px 12px rgba(49,177,137,0.25)",fontFamily:"'Nunito',sans-serif",width:"100%"},btnSm:{padding:"8px 14px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"10px",color:"#475569",fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}};

// ━━━ LOGIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginScreen({onLogin}){const[mode,setMode]=useState("login");const[name,setName]=useState("");const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[error,setError]=useState("");const[loading,setLoading]=useState(false);
  const submit=()=>{if(!email.trim()||!pass.trim()){setError("Completa todos los campos");return;}if(mode==="register"&&!name.trim()){setError("Ingresa tu nombre");return;}setLoading(true);setError("");
    const users=sGet("rv-users")||{};if(mode==="register"){if(users[email]){setError("Email ya existe");setLoading(false);return;}users[email]={name:name.trim(),pass,created:today()};sSet("rv-users",users);onLogin({email,name:name.trim()});}else{const u=users[email];if(!u||u.pass!==pass){setError("Email o contraseña incorrectos");setLoading(false);return;}onLogin({email,name:u.name});}setLoading(false);};
  return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#e8f5e9,#FFE3B3,#fff)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Nunito',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:'Nunito',sans-serif}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{width:"100%",maxWidth:"400px",animation:"fadeIn 0.5s"}}>
      <div style={{textAlign:"center",marginBottom:"28px"}}><div style={{width:"60px",height:"60px",borderRadius:"16px",background:"linear-gradient(135deg,#31B189,#28967a)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:900,color:"#fff",boxShadow:"0 8px 24px rgba(49,177,137,0.3)",marginBottom:"14px"}}>R</div><h1 style={{fontSize:"26px",fontWeight:900}}>RutaVenta</h1><p style={{fontSize:"14px",color:"#64748b"}}>Tu agente de ventas con IA</p></div>
      <div style={{background:"#fff",borderRadius:"18px",padding:"28px 24px",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",border:"2px solid #f1f5f9"}}>
        <div style={{display:"flex",background:"#f1f5f9",borderRadius:"10px",padding:"3px",marginBottom:"20px"}}><button onClick={()=>{setMode("login");setError("");}} style={{flex:1,padding:"9px",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:700,cursor:"pointer",background:mode==="login"?"#fff":"transparent",color:mode==="login"?"#31B189":"#94a3b8"}}>Iniciar Sesión</button><button onClick={()=>{setMode("register");setError("");}} style={{flex:1,padding:"9px",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:700,cursor:"pointer",background:mode==="register"?"#fff":"transparent",color:mode==="register"?"#31B189":"#94a3b8"}}>Crear Cuenta</button></div>
        {mode==="register"&&<div style={{marginBottom:"12px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Tu nombre</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="ej: María González" style={S.input} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>}
        <div style={{marginBottom:"12px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" type="email" style={S.input} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>
        <div style={{marginBottom:"18px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Contraseña</label><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&submit()} style={S.input} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>
        {error&&<div style={{background:"#fef2f2",color:"#c0392b",padding:"10px 14px",borderRadius:"10px",fontSize:"14px",fontWeight:600,marginBottom:"14px",borderLeft:"4px solid #c0392b"}}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{...S.btn,opacity:loading?0.7:1}}>{loading?"...":mode==="login"?"Entrar":"Crear Cuenta Gratis"}</button>
      </div>
      <p style={{textAlign:"center",fontSize:"12px",color:"#94a3b8",marginTop:"16px"}}>Hecho en Chile 🇨🇱 · Gratis para los primeros 50 vendedores</p>
    </div>
  </div>);
}

// ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App(){const[user,setUser]=useState(null);const[ready,setReady]=useState(false);
  useEffect(()=>{const s=sGet("rv-session");if(s)setUser(s);setReady(true);},[]);
  const login=u=>{setUser(u);sSet("rv-session",u);};const logout=()=>{setUser(null);sSet("rv-session",null);};
  if(!ready)return<div style={{minHeight:"100vh",background:"#f8f9fb",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap');`}</style>Cargando...</div>;
  if(!user)return<LoginScreen onLogin={login}/>;return<MainApp user={user} onLogout={logout}/>;
}

function MainApp({user,onLogout}){
  const[tab,setTab]=useState("prospects");const[clients,setClients]=useState([]);const[route,setRoute]=useState([]);const[priceText,setPriceText]=useState("");const[streak,setStreak]=useState({count:0,lastDate:null});const[loaded,setLoaded]=useState(false);
  const[profile,setProfile]=useState({empresa:"",giro:"",zona:"",telefono:"",emailEmpresa:"",descripcion:"",ofertas:""});
  const uid=user.email.replace(/[^a-z0-9]/gi,"");
  useEffect(()=>{
    const c=sGet(`${uid}-cl`)||[];const r=sGet(`${uid}-rt`)||[];const p=sGet(`${uid}-pr`)||"";const s=sGet(`${uid}-sk`)||{count:0,lastDate:null};const pf=sGet(`${uid}-pf`)||{empresa:"",giro:"",zona:"",telefono:"",emailEmpresa:"",descripcion:"",ofertas:""};
    setClients(c);setRoute(r);setPriceText(p);setProfile(pf);
    const td=today();if(s.lastDate===td){setStreak(s);}else{const y=new Date();y.setDate(y.getDate()-1);const yd=y.toISOString().split("T")[0];if(s.lastDate===yd){const u={count:s.count+1,lastDate:td};setStreak(u);sSet(`${uid}-sk`,u);}else{const u={count:1,lastDate:td};setStreak(u);sSet(`${uid}-sk`,u);}}
    setLoaded(true);
  },[uid]);
  useEffect(()=>{if(loaded)sSet(`${uid}-cl`,clients);},[clients,loaded]);
  useEffect(()=>{if(loaded)sSet(`${uid}-rt`,route);},[route,loaded]);

  const addClient=useCallback(p=>{setClients(prev=>prev.find(c=>c.id===p.id)?prev:[...prev,{...p,status:"nuevo",notes:[],added:today(),lastContact:null}]);},[]);
  const setStatus=useCallback((id,s)=>setClients(prev=>prev.map(c=>c.id===id?{...c,status:s,lastContact:today()}:c)),[]);
  const addNote=useCallback((id,t)=>setClients(prev=>prev.map(c=>c.id===id?{...c,notes:[...(c.notes||[]),{text:t,date:today()}],lastContact:today()}:c)),[]);
  const delClient=useCallback(id=>{setClients(p=>p.filter(c=>c.id!==id));setRoute(p=>p.filter(i=>i!==id));},[]);
  const togglePaid=useCallback((id)=>setClients(prev=>prev.map(c=>c.id===id?{...c,paid:c.paid==="yes"?"no":c.paid==="no"?"":"yes",lastContact:today()}:c)),[]);
  const toRoute=useCallback(id=>setRoute(p=>p.includes(id)?p:[...p,id]),[]);
  const offRoute=useCallback(id=>setRoute(p=>p.filter(i=>i!==id)),[]);
  const moveRoute=useCallback((f,t)=>setRoute(p=>{const a=[...p];const[m]=a.splice(f,1);a.splice(t,0,m);return a;}),[]);
  const reorderRoute=useCallback((newOrder)=>setRoute(newOrder),[]);
  const savePrices=useCallback(t=>{setPriceText(t);sSet(`${uid}-pr`,t);},[uid]);
  const saveProfile=useCallback(p=>{setProfile(p);sSet(`${uid}-pf`,p);},[uid]);
  const routeClients=route.map(id=>clients.find(c=>c.id===id)).filter(Boolean);
  const todaysActions=clients.filter(c=>c.lastContact===today()).length;
  const[showProfile,setShowProfile]=useState(false);

  return(<><Head><title>RutaVenta</title><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/><meta name="theme-color" content="#31B189"/><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗺</text></svg>"/></Head>
    <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,textarea,button{font-family:'Nunito',sans-serif}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}}/>
    <div style={{minHeight:"100vh",background:"#f8f9fb",fontFamily:"'Nunito',sans-serif",color:"#1e293b",display:"flex",flexDirection:"column"}}>
      <header style={{padding:"12px 16px",background:"#fff",borderBottom:"2px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,#31B189,#28967a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",fontWeight:900,color:"#fff"}}>R</div><div><div style={{fontSize:"15px",fontWeight:800}}>Hola, {user.name.split(" ")[0]} 👋</div><div style={{fontSize:"11px",color:"#64748b",fontWeight:600}}>🔥 Racha: {streak.count} días · {clients.filter(c=>c.status==="cliente").length} clientes</div></div></div><div style={{display:"flex",gap:"6px",alignItems:"center"}}><button onClick={()=>setShowProfile(true)} style={{padding:"6px 10px",background:profile.empresa?"#edf7e6":"#e8f5e9",border:`2px solid ${profile.empresa?"#b9e6a0":"#b2dfdb"}`,borderRadius:"8px",color:profile.empresa?"#7ACE67":"#31B189",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>{profile.empresa?"👤":"⚙️ Perfil"}</button><button onClick={onLogout} style={{padding:"6px 10px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"8px",color:"#94a3b8",fontSize:"11px",fontWeight:600,cursor:"pointer"}}>Salir</button></div></header>
      {tab==="prospects"&&<div style={{background:"linear-gradient(135deg,#e8f5e9,#FFE3B3)",padding:"10px 16px",borderBottom:"2px solid #b2dfdb",display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"20px"}}>🎯</span><div><div style={{fontSize:"13px",fontWeight:800,color:"#2e7d32"}}>Meta de hoy</div><div style={{fontSize:"12px",color:"#558b2f"}}>{clients.filter(c=>c.status==="nuevo").length>3?`Contacta ${Math.min(3,clients.filter(c=>c.status==="nuevo").length)} clientes y sigue a ${Math.min(2,clients.filter(c=>c.status==="contactado").length)} contactados`:`Agrega ${Math.max(0,5-clients.length)} clientes a tu cartera`}</div></div></div>}
      <nav style={{display:"flex",background:"#fff",borderBottom:"2px solid #e2e8f0",padding:"0 2px",overflowX:"auto"}}>{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:"55px",padding:"10px 2px 8px",border:"none",cursor:"pointer",background:"transparent",color:tab===t.id?"#31B189":"#94a3b8",display:"flex",flexDirection:"column",alignItems:"center",gap:"1px",borderBottom:tab===t.id?"3px solid #31B189":"3px solid transparent",fontWeight:tab===t.id?800:600}}><span style={{fontSize:"18px"}}>{t.icon}</span><span style={{fontSize:"10px"}}>{t.label}</span></button>)}</nav>
      <main style={{flex:1,overflow:"auto",padding:"14px",maxWidth:"600px",margin:"0 auto",width:"100%"}}>
        {tab==="prospects"&&<Prospects clients={clients} addClient={addClient}/>}
        {tab==="clients"&&<CL clients={clients} setStatus={setStatus} addNote={addNote} delClient={delClient} toRoute={toRoute} route={route} addClient={addClient} togglePaid={togglePaid}/>}
        {tab==="route"&&<RT routeClients={routeClients} offRoute={offRoute} moveRoute={moveRoute} setStatus={setStatus} reorderRoute={reorderRoute}/>}
        {tab==="prices"&&<PR priceText={priceText} savePrices={savePrices}/>}
        {tab==="agent"&&<AG clients={clients} routeClients={routeClients} priceText={priceText} streak={streak} userName={user.name} todaysActions={todaysActions} uid={uid} profile={profile}/>}
      </main>
    </div>
    {/* PROFILE MODAL */}
    {showProfile&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",overflow:"auto"}} onClick={()=>setShowProfile(false)}><div style={{background:"#f8f9fb",borderRadius:"20px",width:"100%",maxWidth:"500px",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",marginTop:"20px"}} onClick={e=>e.stopPropagation()}><div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:"20px",fontWeight:900}}>👤 Mi Perfil</h2><button onClick={()=>setShowProfile(false)} style={{width:"32px",height:"32px",borderRadius:"8px",border:"2px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div><div style={{padding:"16px 20px 20px"}}><ProfileTab profile={profile} saveProfile={(p)=>{saveProfile(p);}} userName={user.name} userEmail={user.email} onClose={()=>setShowProfile(false)}/></div></div></div>}
  </>);
}

// ━━━ PROSPECTS (GOOGLE PLACES REAL SEARCH) ━━━━━━━━━━━━
function Prospects({clients,addClient}){const[q,setQ]=useState("");const[loc,setLoc]=useState("");const[results,setResults]=useState([]);const[ld,setLd]=useState(false);const[searched,setSearched]=useState(false);
  const search=async c=>{const sq=c||q;if(!sq.trim()||!loc.trim())return;setLd(true);setSearched(true);
    try{
      const res=await fetch("/api/places",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:sq,location:loc})});
      if(!res.ok)throw new Error("Search failed");
      const data=await res.json();
      setResults(data.results||[]);
    }catch{setResults([]);}setLd(false);};
  const has=id=>clients.some(c=>c.id===id);
  return(<div style={{animation:"fadeIn 0.4s"}}><h2 style={{fontSize:"22px",fontWeight:900,marginBottom:"4px"}}>Buscar Clientes</h2><p style={{fontSize:"14px",color:"#64748b",marginBottom:"14px"}}>Negocios reales cerca de tu ubicación</p>
    <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="📍 Tu ciudad (ej: Puerto Montt, Puerto Varas)" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>{QUICK.map(qs=><button key={qs.q} onClick={()=>{setQ(qs.q);search(qs.q);}} style={{padding:"7px 11px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"20px",color:"#475569",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>{qs.label}</button>)}</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Otro tipo..." onKeyDown={e=>e.key==="Enter"&&search()} style={{...S.input,flex:1}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/><button onClick={()=>search()} disabled={ld} style={{...S.btn,width:"auto",padding:"12px 18px",opacity:ld?0.6:1}}>{ld?"...":"Buscar"}</button></div>
    {ld&&<div style={{textAlign:"center",padding:"36px",color:"#94a3b8"}}><div style={{fontSize:"32px",marginBottom:"8px"}}>🔍</div>Buscando negocios reales...</div>}
    {!ld&&searched&&results.length===0&&<div style={{textAlign:"center",padding:"36px",color:"#94a3b8"}}>No se encontraron negocios. Prueba otra búsqueda.</div>}
    {results.map((r,i)=><div key={r.id||i} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",animation:`fadeIn 0.3s ease ${i*0.05}s both`}}><div style={{flex:1}}><div style={{fontSize:"16px",fontWeight:800,marginBottom:"2px"}}>{r.name}</div><div style={{fontSize:"13px",color:"#64748b",marginBottom:"4px"}}>{r.address}</div><div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:"12px",padding:"2px 8px",borderRadius:"10px",background:"#e8f5e9",color:"#1e7a5f",fontWeight:700}}>{r.type}</span>{r.rating>0&&<span style={{fontSize:"12px",color:"#d97706",fontWeight:700}}>{"★".repeat(Math.round(r.rating))} {r.rating}</span>}{r.user_ratings_total>0&&<span style={{fontSize:"11px",color:"#94a3b8"}}>({r.user_ratings_total})</span>}{r.open_now===true&&<span style={{fontSize:"11px",color:"#7ACE67",fontWeight:700}}>● Abierto</span>}{r.open_now===false&&<span style={{fontSize:"11px",color:"#c0392b",fontWeight:700}}>● Cerrado</span>}</div></div>{!has(r.id)?<button onClick={()=>addClient(r)} style={{padding:"9px 13px",background:"linear-gradient(135deg,#31B189,#28967a)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:800,fontSize:"13px",cursor:"pointer",flexShrink:0}}>+ Agregar</button>:<span style={{padding:"9px 13px",background:"#d4edcc",borderRadius:"10px",color:"#7ACE67",fontWeight:700,fontSize:"13px"}}>✓</span>}</div>)}
  </div>);
}

// ━━━ CLIENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CL({clients,setStatus,addNote,delClient,toRoute,route,addClient,togglePaid}){const[filter,setFilter]=useState("todos");const[openId,setOpenId]=useState(null);const[note,setNote]=useState("");
  const[showAdd,setShowAdd]=useState(false);const[newName,setNewName]=useState("");const[newAddr,setNewAddr]=useState("");const[newPhone,setNewPhone]=useState("");const[newType,setNewType]=useState("");const[newEmail,setNewEmail]=useState("");const[newWhatsapp,setNewWhatsapp]=useState("");const[newRut,setNewRut]=useState("");const[newLocalidad,setNewLocalidad]=useState("");
  const fileRef=useRef(null);const[importMsg,setImportMsg]=useState("");
  const handleAddManual=()=>{if(!newName.trim())return;addClient({id:"m_"+Date.now()+"_"+Math.random().toString(36).slice(2,8),name:newName.trim(),address:newAddr.trim()||"Sin dirección",phone:newPhone.trim(),type:newType.trim()||"",rating:0,email:newEmail.trim(),whatsapp:newPhone.trim(),rut:newRut.trim(),localidad:newLocalidad.trim()});setNewName("");setNewAddr("");setNewPhone("");setNewType("");setNewEmail("");setNewWhatsapp("");setNewRut("");setNewLocalidad("");setShowAdd(false);};

  // ── DOWNLOAD TEMPLATE ──
  const downloadTemplate=()=>{
    const header="RUT,Cliente,Dirección,Localidad,Giro,Email,Teléfono";
    const example1="12.345.678-9,Restaurante El Fogón,Av. Angelmó 1876,Puerto Montt,Restaurante,contacto@elfogon.cl,+56912345678";
    const example2="98.765.432-1,Carnicería Don Pedro,Vicente Pérez Rosales 890,Puerto Varas,Carnicería,donpedro@gmail.com,+56987654321";
    const example3="11.222.333-4,Hotel Los Lagos,Gramado 156,Puerto Varas,Hotelería,reservas@loslagos.cl,+56911112222";
    const csv=header+"\n"+example1+"\n"+example2+"\n"+example3+"\n";
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="plantilla_rutaventa.csv";a.click();URL.revokeObjectURL(url);
  };

  // ── IMPORT CSV/EXCEL ──
  const cleanLocalidad=(s)=>{
    if(!s)return"";
    return s.trim().replace(/\.$/,"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()
      .replace(/^ALERCE$/i,"ALERCE").replace(/^FRUTIILAR$/i,"FRUTILLAR")
      .split(" ").map(w=>w.charAt(0)+w.slice(1).toLowerCase()).join(" ");
  };
  const cleanPhone=(p)=>{
    if(!p)return"";
    let phone=String(p).split("/")[0].trim().replace(/\s+/g,"").replace(/[^\d+]/g,"");
    if(phone&&!phone.startsWith("+")&&phone.length>=8&&phone.length<=9)phone="+569"+phone;
    if(phone&&!phone.startsWith("+")&&phone.length>=10)phone="+56"+phone;
    return phone;
  };

  const handleImport=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    let rows=[];

    if(file.name.endsWith(".xlsx")||file.name.endsWith(".xls")){
      // XLSX: read with SheetJS
      try{
        const XLSX=await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
        const buf=await file.arrayBuffer();
        const wb=XLSX.read(buf,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws,{defval:""});
      }catch(err){
        console.error("XLSX parse error:",err);
        setImportMsg("❌ Error al leer Excel. Guarda como CSV (separado por ;) e intenta de nuevo.");
        setTimeout(()=>setImportMsg(""),4000);
        if(fileRef.current)fileRef.current.value="";
        return;
      }
    }else{
      // CSV/TXT: parse manually
      let text=await file.text();
      text=text.replace(/^\uFEFF/,"");
      const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l);
      if(lines.length<2){setImportMsg("❌ Archivo vacío");setTimeout(()=>setImportMsg(""),3000);return;}
      const sep=lines[0].includes(";")?";":lines[0].includes("\t")?"\t":",";
      const hdrs=lines[0].split(sep).map(h=>h.trim().replace(/"/g,"").replace(/\uFEFF/g,""));
      for(let i=1;i<lines.length;i++){
        const cols=lines[i].split(sep).map(c=>c.trim().replace(/^"|"$/g,""));
        const obj={};hdrs.forEach((h,j)=>{obj[h]=cols[j]||"";});
        rows.push(obj);
      }
    }

    if(rows.length===0){setImportMsg("❌ No se encontraron datos");setTimeout(()=>setImportMsg(""),3000);return;}

    // Map columns flexibly
    const keys=Object.keys(rows[0]).map(k=>k.toLowerCase().trim());
    const origKeys=Object.keys(rows[0]);
    const find=(patterns)=>{const idx=keys.findIndex(k=>patterns.some(p=>k.includes(p)));return idx>=0?origKeys[idx]:null;};

    const colName=find(["cliente","nombre","name"])||find(["razon"]);
    const colRut=find(["rut","ruc"]);
    const colAddr=find(["direc","address","domicilio"]);
    const colLoc=find(["localidad","ciudad","comuna","zona","city"]);
    const colType=find(["tipo","giro","rubro","type","actividad"]);
    const colEmail=find(["mail","correo","email"]);
    const colPhone=find(["fono","telef","phone","celular","movil"]);

    if(!colName){setImportMsg("❌ No encontré columna 'Cliente' o 'Nombre'. Revisa los encabezados.");setTimeout(()=>setImportMsg(""),4000);if(fileRef.current)fileRef.current.value="";return;}

    const existingRuts=new Set(clients.filter(c=>c.rut).map(c=>c.rut.trim()));
    const existingNames=new Set(clients.map(c=>(c.name||"").trim().toLowerCase()));
    let count=0;let skipped=0;

    for(const row of rows){
      const name=String(row[colName]||"").trim();
      if(!name)continue;
      const rut=colRut?String(row[colRut]||"").trim():"";
      if(rut&&existingRuts.has(rut)){skipped++;continue;}
      if(existingNames.has(name.toLowerCase())){skipped++;continue;}

      const phone=cleanPhone(colPhone?row[colPhone]:"");
      const loc=cleanLocalidad(colLoc?row[colLoc]:"");

      addClient({
        id:"imp_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)+"_"+count,
        name:name,
        address:colAddr?String(row[colAddr]||"").trim()||"":"",
        phone:phone,
        type:colType?String(row[colType]||"").trim():"",
        email:colEmail?String(row[colEmail]||"").trim():"",
        whatsapp:phone,
        rut:rut,
        localidad:loc,
        rating:0,
      });
      existingRuts.add(rut);
      existingNames.add(name.toLowerCase());
      count++;
    }
    setImportMsg(`✅ ${count} clientes importados${skipped>0?` · ${skipped} duplicados omitidos`:""}`);
    setTimeout(()=>setImportMsg(""),4000);
    if(fileRef.current)fileRef.current.value="";
  };

  // ── EXPORT CSV ──
  const handleExport=()=>{
    if(clients.length===0)return;
    const header="RUT,Cliente,Dirección,Localidad,Giro,Email,Teléfono,Estado,Último Contacto,Pagó";
    const rows=clients.map(c=>[
      `"${c.rut||""}"`,
      `"${(c.name||"").replace(/"/g,'""')}"`,
      `"${(c.address||"").replace(/"/g,'""')}"`,
      `"${c.localidad||""}"`,
      `"${c.type||""}"`,
      `"${c.email||""}"`,
      `"${c.phone||c.whatsapp||""}"`,
      `"${c.status||""}"`,
      `"${c.lastContact||""}"`,
      `"${c.paid||""}"`,
    ].join(","));
    const csv=header+"\n"+rows.join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="mis_clientes_rutaventa.csv";a.click();URL.revokeObjectURL(url);
  };

  const getLocalidad=(c)=>{
    let loc=c.localidad||"";
    if(!loc&&c.address){const parts=c.address.split(/[,;]/);if(parts.length>=2){const last=parts[parts.length-1].trim();if(last&&last.length>2&&!/^\d/.test(last))loc=last;}}
    if(!loc)return"";
    return loc.trim().replace(/\.$/,"").split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ").replace(/^Alerce$/i,"Alerce").replace(/^Frutiilar$/i,"Frutillar").replace(/^Puerto montt$/i,"Puerto Montt").replace(/^Puerto varas$/i,"Puerto Varas");
  };
  const[filterLoc,setFilterLoc]=useState("todas");
  const localidades=[...new Set(clients.map(c=>getLocalidad(c)).filter(l=>l&&l.trim()))].sort();
  const list0=filter==="todos"?clients:filter==="enruta"?clients.filter(c=>route.includes(c.id)):filter==="sinruta"?clients.filter(c=>!route.includes(c.id)):clients.filter(c=>c.status===filter);
  const list=filterLoc==="todas"?list0:list0.filter(c=>getLocalidad(c)===filterLoc);
  const cnt={todos:clients.length};Object.keys(STATUS).forEach(s=>{cnt[s]=clients.filter(c=>c.status===s).length;});
  return(<div style={{animation:"fadeIn 0.4s"}}><h2 style={{fontSize:"22px",fontWeight:900,marginBottom:"4px"}}>Mi Cartera</h2><p style={{fontSize:"14px",color:"#64748b",marginBottom:"14px"}}>{clients.length} clientes · {cnt.cliente||0} activos{filterLoc!=="todas"&&` · 📍 ${filterLoc}`}</p>
    {/* ADD / IMPORT / EXPORT BUTTONS */}
    <div style={{display:"flex",gap:"6px",marginBottom:"8px",flexWrap:"wrap"}}>
      {!showAdd&&<button onClick={()=>setShowAdd(true)} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#059669,#10b981)",fontSize:"14px",padding:"11px",width:"auto"}}>➕ Agregar</button>}
      <button onClick={downloadTemplate} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#7c3aed,#a855f7)",fontSize:"14px",padding:"11px",width:"auto"}}>📋 Plantilla</button>
    </div>
    <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
      <input type="file" ref={fileRef} onChange={handleImport} accept=".csv,.txt,.tsv,.xls,.xlsx" style={{display:"none"}}/>
      <button onClick={()=>fileRef.current?.click()} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",fontSize:"14px",padding:"11px",width:"auto"}}>📥 Importar</button>
      {clients.length>0&&<button onClick={handleExport} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#d97706,#f59e0b)",fontSize:"14px",padding:"11px",width:"auto"}}>📤 Exportar</button>}
      {clients.length>0&&<button onClick={()=>{if(confirm("¿Borrar TODOS los clientes? Esta acción no se puede deshacer.")){clients.forEach(c=>delClient(c.id));}}} style={{...S.btn,flex:0,background:"#ef4444",fontSize:"14px",padding:"11px",width:"auto",minWidth:"40px"}}>🗑️</button>}
    </div>
    {importMsg&&<div style={{padding:"10px 14px",borderRadius:"10px",marginBottom:"10px",fontSize:"14px",fontWeight:700,background:importMsg.startsWith("✅")?"#edf7e6":"#fef2f2",color:importMsg.startsWith("✅")?"#7ACE67":"#c0392b",border:`2px solid ${importMsg.startsWith("✅")?"#b9e6a0":"#fecaca"}`}}>{importMsg}</div>}
    {showAdd&&<div style={{...S.card,border:"2px solid #10b981",marginBottom:"14px"}}>
      <div style={{fontSize:"15px",fontWeight:800,color:"#7ACE67",marginBottom:"10px"}}>➕ Nuevo Cliente</div>
      <input value={newRut} onChange={e=>setNewRut(e.target.value)} placeholder="RUT (ej: 12.345.678-9)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre del cliente *" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newAddr} onChange={e=>setNewAddr(e.target.value)} placeholder="Dirección (ej: Av. Angelmó 1876)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newLocalidad} onChange={e=>setNewLocalidad(e.target.value)} placeholder="Localidad (ej: Puerto Montt)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newType} onChange={e=>setNewType(e.target.value)} placeholder="Giro (ej: Restaurante, Carnicería, Hotelería)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="📧 Email (opcional)" type="email" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="📞 Teléfono / WhatsApp (ej: +56 9 1234 5678)" style={{...S.input,marginBottom:"10px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#7ACE67"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <div style={{display:"flex",gap:"8px"}}><button onClick={handleAddManual} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#059669,#10b981)",fontSize:"15px",padding:"12px"}}>✓ Guardar</button><button onClick={()=>setShowAdd(false)} style={{...S.btnSm,flex:0,padding:"12px 18px"}}>Cancelar</button></div>
    </div>}
    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}><Pill l={`Todos(${cnt.todos})`} on={filter==="todos"} fn={()=>setFilter("todos")} c="#64748b"/>{Object.entries(STATUS).map(([k,v])=><Pill key={k} l={`${v.icon}${v.label}(${cnt[k]||0})`} on={filter===k} fn={()=>setFilter(k)} c={v.color}/>)}<Pill l={`🗺️ En ruta(${clients.filter(c=>route.includes(c.id)).length})`} on={filter==="enruta"} fn={()=>setFilter("enruta")} c="#31B189"/><Pill l={`⭕ Sin ruta(${clients.filter(c=>!route.includes(c.id)).length})`} on={filter==="sinruta"} fn={()=>setFilter("sinruta")} c="#64748b"/></div>
    {localidades.length>1&&<div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"14px"}}><Pill l="📍 Todas" on={filterLoc==="todas"} fn={()=>setFilterLoc("todas")} c="#0ea5e9"/>{localidades.map(loc=><Pill key={loc} l={`📍 ${loc}`} on={filterLoc===loc} fn={()=>setFilterLoc(loc)} c="#0ea5e9"/>)}</div>}
    {list.length===0&&<div style={{textAlign:"center",padding:"44px",color:"#94a3b8"}}><div style={{fontSize:"36px",marginBottom:"8px"}}>📋</div>{clients.length===0?"Agrega clientes con el botón verde ☝️ o busca en 🔍":"Sin resultados"}</div>}
    {list.map((c,i)=>{const cfg=STATUS[c.status];const open=openId===c.id;const inR=route.includes(c.id);const loc=getLocalidad(c);return(<div key={c.id} style={{...S.card,padding:0,overflow:"hidden",animation:`fadeIn 0.3s ease ${i*0.03}s both`}}>
      <div onClick={()=>setOpenId(open?null:c.id)} style={{padding:"14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px",flexWrap:"wrap"}}>
            <span style={{fontSize:"16px",fontWeight:800,color:"#1e293b"}}>{c.name}</span>
            <span style={{fontSize:"11px",padding:"2px 7px",borderRadius:"8px",background:cfg.bg,color:cfg.color,fontWeight:700}}>{cfg.icon}{cfg.label}</span>
            {c.paid==="yes"&&<span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:"#d4edcc",color:"#2e7d32",fontWeight:700}}>💰</span>}
            {c.paid==="no"&&<span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:"#fee2e2",color:"#c0392b",fontWeight:700}}>⚠️</span>}
            {inR&&<span style={{fontSize:"10px",padding:"2px 5px",borderRadius:"6px",background:"#e8f5e9",color:"#31B189",fontWeight:700}}>🗺️</span>}
          </div>
          {(c.address||loc)&&<div style={{fontSize:"13px",color:"#475569",marginBottom:"1px"}}>📍 {c.address&&c.address!=="Sin dirección"?c.address:""}{loc?`${c.address&&c.address!=="Sin dirección"?", ":""}${loc}`:""}</div>}
          {c.type&&<div style={{fontSize:"12px",color:"#64748b"}}>{c.type}</div>}
        </div>
        <span style={{color:"#c8d1da",fontSize:"14px",transform:open?"rotate(180deg)":"none",transition:"0.2s",marginTop:"6px",flexShrink:0}}>▾</span>
      </div>
      {open&&<div style={{padding:"0 14px 14px",borderTop:"2px solid #f1f5f9"}}>
        {/* Client details */}
        <div style={{padding:"10px 0",display:"flex",flexDirection:"column",gap:"4px"}}>
          {c.rut&&<div style={{fontSize:"12px",color:"#94a3b8"}}>RUT: {c.rut}</div>}
          {(c.phone||c.whatsapp)&&<div style={{fontSize:"13px",color:"#475569"}}>📞 {c.phone||c.whatsapp}</div>}
          {c.email&&<div style={{fontSize:"13px",color:"#475569"}}>📧 {c.email}</div>}
        </div><div style={{...S.section,marginTop:"10px"}}>Estado</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"10px"}}>{Object.entries(STATUS).map(([k,v])=><button key={k} onClick={()=>setStatus(c.id,k)} style={{padding:"6px 10px",borderRadius:"8px",fontSize:"12px",fontWeight:700,cursor:"pointer",background:c.status===k?v.color:"#f8fafc",color:c.status===k?"#fff":v.color,border:`2px solid ${c.status===k?v.color:"#e2e8f0"}`}}>{v.icon}{v.label}</button>)}</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>{!inR&&<button onClick={()=>toRoute(c.id)} style={{...S.btnSm,color:"#31B189",borderColor:"#b2dfdb",background:"#e8f5e9",fontSize:"12px"}}>🗺️ A ruta</button>}<button onClick={()=>togglePaid(c.id)} style={{...S.btnSm,color:c.paid==="yes"?"#7ACE67":c.paid==="no"?"#c0392b":"#64748b",borderColor:c.paid==="yes"?"#b9e6a0":c.paid==="no"?"#fecaca":"#e2e8f0",background:c.paid==="yes"?"#edf7e6":c.paid==="no"?"#fef2f2":"#f8fafc",fontSize:"12px"}}>{c.paid==="yes"?"💰 Pagó":c.paid==="no"?"⚠️ Debe":"💲 Marcar pago"}</button><button onClick={()=>delClient(c.id)} style={{...S.btnSm,color:"#c0392b",borderColor:"#fecaca",background:"#fef2f2",fontSize:"12px"}}>🗑️ Eliminar</button></div>
        {/* CONTACT BUTTONS */}
        {(c.phone||c.whatsapp||c.email)&&<div style={{marginBottom:"10px"}}><div style={S.section}>Contactar</div><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {(c.whatsapp||c.phone)&&(c.whatsapp||c.phone).replace(/[^0-9]/g,"").length>=8&&<a href={`https://wa.me/${(c.whatsapp||c.phone).replace(/[^0-9+]/g,"").replace("+","")}`} target="_blank" rel="noopener noreferrer" style={{...S.btnSm,color:"#fff",background:"#25d366",borderColor:"#25d366",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>💬 WhatsApp</a>}
          {c.email&&c.email.includes("@")&&<a href={`mailto:${c.email}`} style={{...S.btnSm,color:"#fff",background:"#2563eb",borderColor:"#2563eb",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>📧 Email</a>}
          {(c.phone||c.whatsapp)&&(c.phone||c.whatsapp).replace(/[^0-9]/g,"").length>=8&&<a href={`tel:${c.phone||c.whatsapp}`} style={{...S.btnSm,color:"#fff",background:"#7c3aed",borderColor:"#7c3aed",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>📞 Llamar</a>}
          {!(c.phone||c.whatsapp||"").replace(/[^0-9]/g,"").length&&!c.email&&<span style={{fontSize:"13px",color:"#94a3b8"}}>Sin datos de contacto — edita el cliente para agregar</span>}
        </div></div>}
        <div style={S.section}>Notas ({(c.notes||[]).length})</div>{(c.notes||[]).map((n,ni)=><div key={ni} style={{padding:"8px 10px",background:"#fffbeb",borderLeft:"3px solid #f59e0b",borderRadius:"0 8px 8px 0",marginBottom:"4px"}}><div style={{fontSize:"13px",lineHeight:1.5}}>{n.text}</div><div style={{fontSize:"10px",color:"#94a3b8",marginTop:"2px"}}>{n.date}</div></div>)}
        <div style={{display:"flex",gap:"6px",marginTop:"5px"}}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Nota..." onKeyDown={e=>{if(e.key==="Enter"&&note.trim()){addNote(c.id,note.trim());setNote("");}}} style={{...S.input,flex:1,fontSize:"14px",padding:"10px 12px"}}/><button onClick={()=>{if(note.trim()){addNote(c.id,note.trim());setNote("");}}} style={{padding:"10px 14px",background:"#31B189",border:"none",borderRadius:"10px",color:"#fff",fontWeight:800,cursor:"pointer"}}>+</button></div>
      </div>}
    </div>);})}
  </div>);
}
function Pill({l,on,fn,c}){return<button onClick={fn} style={{padding:"6px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:700,cursor:"pointer",background:on?c:"#f1f5f9",color:on?"#fff":"#64748b",border:`2px solid ${on?c:"#e2e8f0"}`}}>{l}</button>;}

// ━━━ ROUTE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RT({routeClients,offRoute,moveRoute,setStatus,reorderRoute}){
  const[optimizing,setOptimizing]=useState(false);
  const[routeInfo,setRouteInfo]=useState(null);

  const optimizeRoute=async()=>{
    if(routeClients.length<3)return; // need at least 3 to optimize
    setOptimizing(true);
    try{
      const addresses=routeClients.map(c=>c.address||c.name);
      const res=await fetch("/api/optimize-route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({addresses})});
      if(!res.ok)throw new Error("Failed");
      const data=await res.json();
      if(data.optimized&&data.waypoint_order){
        // Reorder: first stay, middle reorder by waypoint_order, last stay
        const first=routeClients[0];
        const last=routeClients[routeClients.length-1];
        const middle=routeClients.slice(1,-1);
        const reordered=[first,...data.waypoint_order.map(i=>middle[i]),last];
        reorderRoute(reordered.map(c=>c.id));
        setRouteInfo({distance:data.total_distance,duration:data.total_duration});
      }
    }catch{console.error("Optimize failed");}
    setOptimizing(false);
  };

  if(routeClients.length===0)return<div style={{animation:"fadeIn 0.4s",textAlign:"center",padding:"44px"}}><div style={{fontSize:"44px",marginBottom:"10px"}}>🗺️</div><h2 style={{fontSize:"20px",fontWeight:900,marginBottom:"6px"}}>Ruta vacía</h2><p style={{fontSize:"14px",color:"#64748b"}}>Agrega clientes desde 📋</p></div>;
  const addrs=routeClients.map(c=>encodeURIComponent(c.address||c.name));const o=addrs[0];const d=addrs[addrs.length-1];const w=addrs.length>2?addrs.slice(1,-1).join("|"):"";
  const link=`https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}${w?`&waypoints=${w}`:""}&travelmode=driving`;
  return(<div style={{animation:"fadeIn 0.4s"}}><h2 style={{fontSize:"22px",fontWeight:900,marginBottom:"4px"}}>Ruta del Día</h2><p style={{fontSize:"14px",color:"#64748b",marginBottom:"12px"}}>{routeClients.length} paradas</p>
    <div style={{background:"linear-gradient(135deg,#e8f5e9,#FFE3B3)",borderRadius:"12px",padding:"14px",border:"2px solid #b2dfdb",marginBottom:"10px",display:"flex",justifyContent:"space-around",textAlign:"center"}}><div><div style={{fontSize:"24px",fontWeight:900,color:"#31B189"}}>{routeClients.length}</div><div style={{fontSize:"11px",color:"#2e7d32",fontWeight:600}}>Paradas</div></div><div><div style={{fontSize:"24px",fontWeight:900,color:"#d97706"}}>{routeInfo?routeInfo.distance:"—"}</div><div style={{fontSize:"11px",color:"#2e7d32",fontWeight:600}}>Distancia</div></div><div><div style={{fontSize:"24px",fontWeight:900,color:"#7ACE67"}}>{routeInfo?routeInfo.duration:"—"}</div><div style={{fontSize:"11px",color:"#2e7d32",fontWeight:600}}>Tiempo</div></div></div>
    {/* OPTIMIZE BUTTON */}
    {routeClients.length>=3&&<button onClick={optimizeRoute} disabled={optimizing} style={{...S.btn,marginBottom:"8px",background:optimizing?"#94a3b8":"linear-gradient(135deg,#7c3aed,#a855f7)",fontSize:"16px",padding:"14px"}}>{optimizing?"⏳ Calculando ruta óptima...":"🧠 Optimizar Ruta (más corta)"}</button>}
    <a href={link} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"14px",background:"#1a73e8",color:"#fff",borderRadius:"12px",fontSize:"17px",fontWeight:800,textDecoration:"none",marginBottom:"12px",boxShadow:"0 3px 12px rgba(26,115,232,0.3)"}}>📍 Navegar en Google Maps</a>
    {routeClients.map((c,idx)=>{const cfg=STATUS[c.status];return(<div key={c.id}>{idx>0&&<div style={{width:"3px",height:"14px",background:"#b2dfdb",margin:"0 0 0 24px"}}/>}<div style={{...S.card,display:"flex",gap:"10px",alignItems:"flex-start"}}><div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,#31B189,#28967a)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"16px",flexShrink:0}}>{idx+1}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px",flexWrap:"wrap"}}><span style={{fontSize:"15px",fontWeight:800}}>{c.name}</span><span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:cfg.bg,color:cfg.color,fontWeight:700}}>{cfg.icon}{cfg.label}</span></div><div style={{fontSize:"12px",color:"#64748b",marginBottom:"6px"}}>{c.address}</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{idx>0&&<button onClick={()=>moveRoute(idx,idx-1)} style={S.btnSm}>↑</button>}{idx<routeClients.length-1&&<button onClick={()=>moveRoute(idx,idx+1)} style={S.btnSm}>↓</button>}<button onClick={()=>setStatus(c.id,"contactado")} style={{...S.btnSm,color:"#d97706",borderColor:"#FFE3B3",background:"#fffbeb"}}>✉</button><button onClick={()=>offRoute(c.id)} style={{...S.btnSm,color:"#c0392b",borderColor:"#fecaca",background:"#fef2f2"}}>✕</button></div></div></div></div>);})}
  </div>);
}

// ━━━ PRICES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PR({priceText,savePrices}){const[text,setText]=useState(priceText);const[saved,setSaved]=useState(false);const ref=useRef(null);const[upl,setUpl]=useState(false);
  const handleFile=async e=>{const f=e.target.files[0];if(!f)return;setUpl(true);
    if(f.name.endsWith(".txt")||f.name.endsWith(".csv")){
      const c=await f.text();setText(c);savePrices(c);setSaved(true);setTimeout(()=>setSaved(false),2000);
    } else if(f.name.endsWith(".xlsx")||f.name.endsWith(".xls")){
      // Excel: read as text via AI
      const reader=new FileReader();reader.onload=async()=>{const b64=reader.result.split(",")[1];try{const ext=await callAI("Extract ALL products and prices from this Excel file. Format: one per line 'Product - $Price per unit'. Include ALL items. Spanish.",[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",data:b64}},{type:"text",text:"Extrae todos los productos y precios de este Excel"}]}],3000);setText(ext);savePrices(ext);setSaved(true);setTimeout(()=>setSaved(false),2000);}catch{alert("Error al leer Excel. Intenta guardar como CSV y subir de nuevo.");}};reader.readAsDataURL(f);
    } else{
      // PDF
      const reader=new FileReader();reader.onload=async()=>{const b64=reader.result.split(",")[1];try{const ext=await callAI("Extract ALL products and prices. Format: one per line 'Product - $Price/unit'. Spanish.",[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},{type:"text",text:"Extrae productos y precios"}]}],3000);setText(ext);savePrices(ext);setSaved(true);setTimeout(()=>setSaved(false),2000);}catch{alert("Error. Copia y pega manualmente.");}};reader.readAsDataURL(f);
    } setUpl(false);};
  const save=()=>{savePrices(text);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(<div style={{animation:"fadeIn 0.4s"}}><h2 style={{fontSize:"22px",fontWeight:900,marginBottom:"4px"}}>Lista de Precios</h2><p style={{fontSize:"14px",color:"#64748b",marginBottom:"14px"}}>Sube tu lista y el agente IA la usará</p>
    <input type="file" ref={ref} onChange={handleFile} accept=".pdf,.txt,.csv,.xlsx,.xls" style={{display:"none"}}/>
    <button onClick={()=>ref.current?.click()} disabled={upl} style={{...S.btn,marginBottom:"10px",background:upl?"#94a3b8":"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>{upl?"Leyendo archivo...":"📄 Subir Excel, PDF o TXT"}</button>
    <div style={{fontSize:"12px",color:"#94a3b8",marginBottom:"8px",textAlign:"center"}}>Acepta: .xlsx, .csv, .pdf, .txt · O pega tu lista aquí:</div>
    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"Pechuga de pollo - $3.200/kg\nLomo liso - $8.900/kg\nCostillar cerdo - $4.500/kg"} rows={10} style={{...S.input,resize:"vertical",minHeight:"180px",lineHeight:1.7,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    <button onClick={save} style={{...S.btn,background:saved?"#7ACE67":"linear-gradient(135deg,#31B189,#28967a)"}}>{saved?"✓ Guardado":"💾 Guardar Precios"}</button>
    {text&&<div style={{marginTop:"14px",padding:"12px",background:"#edf7e6",borderRadius:"10px",border:"2px solid #b9e6a0"}}><div style={{fontSize:"13px",fontWeight:700,color:"#7ACE67"}}>✓ Lista cargada</div><div style={{fontSize:"12px",color:"#2e7d32"}}>{text.split("\n").filter(l=>l.trim()).length} productos disponibles para el agente IA</div></div>}
  </div>);
}

// ━━━ PROFILE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfileTab({profile,saveProfile,userName,userEmail,onClose}){
  const[p,setP]=useState(profile);const[saved,setSaved]=useState(false);
  const upd=(k,v)=>setP(prev=>({...prev,[k]:v}));
  const save=()=>{saveProfile(p);setSaved(true);setTimeout(()=>{setSaved(false);if(onClose)onClose();},1500);};
  const lbl={fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"};
  return(<div>
    <p style={{fontSize:"13px",color:"#64748b",marginBottom:"14px"}}>El agente IA usa estos datos para pitches, cotizaciones y mensajes</p>

    <div style={{...S.card,border:"2px solid #e2e8f0",marginBottom:"12px"}}>
      <div style={{fontSize:"15px",fontWeight:800,color:"#1e293b",marginBottom:"12px"}}>👤 Datos del Vendedor</div>
      <div style={{fontSize:"14px",color:"#64748b",marginBottom:"10px"}}>Nombre: <strong>{userName}</strong> · Email: <strong>{userEmail}</strong></div>
      <label style={lbl}>Teléfono de contacto</label>
      <input value={p.telefono||""} onChange={e=>upd("telefono",e.target.value)} placeholder="+56 9 1234 5678" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <label style={lbl}>Zona de trabajo</label>
      <input value={p.zona||""} onChange={e=>upd("zona",e.target.value)} placeholder="ej: Puerto Montt, Puerto Varas, Osorno" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>

    <div style={{...S.card,border:"2px solid #e2e8f0",marginBottom:"12px"}}>
      <div style={{fontSize:"15px",fontWeight:800,color:"#1e293b",marginBottom:"12px"}}>🏢 Mi Empresa</div>
      <label style={lbl}>Nombre de la empresa</label>
      <input value={p.empresa||""} onChange={e=>upd("empresa",e.target.value)} placeholder="ej: Distribuidora Sur Limpio Ltda." style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <label style={lbl}>Giro / Rubro</label>
      <input value={p.giro||""} onChange={e=>upd("giro",e.target.value)} placeholder="ej: Distribución de productos de limpieza industrial" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <label style={lbl}>Email de la empresa</label>
      <input value={p.emailEmpresa||""} onChange={e=>upd("emailEmpresa",e.target.value)} placeholder="ventas@miempresa.cl" type="email" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <label style={lbl}>Descripción de lo que vendemos (ventajas, diferenciadores)</label>
      <textarea value={p.descripcion||""} onChange={e=>upd("descripcion",e.target.value)} placeholder={"ej: Vendemos productos de limpieza industrial para restaurantes, hoteles y empresas. Trabajamos con protocolos SEREMI. Entrega en 24 horas en toda la región de Los Lagos. Precios mayoristas directos."} rows={4} style={{...S.input,resize:"vertical",minHeight:"100px",lineHeight:1.6,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>

    <div style={{...S.card,border:"2px solid #f59e0b",marginBottom:"12px"}}>
      <div style={{fontSize:"15px",fontWeight:800,color:"#d97706",marginBottom:"8px"}}>🔥 Ofertas de la Semana</div>
      <p style={{fontSize:"13px",color:"#64748b",marginBottom:"10px"}}>Productos en promoción — el agente IA los incluye en pitches y cotizaciones</p>
      <textarea value={p.ofertas||""} onChange={e=>upd("ofertas",e.target.value)} placeholder={"ej:\nDesengrasante industrial 5L - $8.990 (antes $12.990)\nPack sanitización restaurante - $45.000\nLimpiador multiuso caja 12u - $15.900\n2x1 en guantes industriales"} rows={5} style={{...S.input,resize:"vertical",minHeight:"120px",lineHeight:1.6,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>

    <button onClick={save} style={{...S.btn,background:saved?"#7ACE67":"linear-gradient(135deg,#31B189,#28967a)",fontSize:"18px",padding:"16px"}}>{saved?"✓ Perfil Guardado":"💾 Guardar Perfil"}</button>

    {p.empresa&&<div style={{marginTop:"14px",padding:"14px",background:"#edf7e6",borderRadius:"12px",border:"2px solid #b9e6a0"}}>
      <div style={{fontSize:"14px",fontWeight:700,color:"#7ACE67",marginBottom:"4px"}}>✓ Perfil configurado</div>
      <div style={{fontSize:"13px",color:"#2e7d32"}}>El agente IA ya conoce tu empresa y usará estos datos automáticamente en pitches, cotizaciones y mensajes.</div>
    </div>}
  </div>);
}

// ━━━ AGENT (with 3-day chat history + profile context) ━━━
function AG({clients,routeClients,priceText,streak,userName,todaysActions,uid,profile}){const fn=userName.split(" ")[0];
  const hasProfile=profile&&profile.empresa;
  const welcome=streak.count>=5?`🔥 ¡${fn}, llevas ${streak.count} días de racha! Top 10%. Los que mantienen 20+ duplican su cartera.\n\n`:streak.count>=2?`💪 ${fn}, van ${streak.count} días de racha.\n\n`:`¡Hola ${fn}! Hoy empieza tu racha. 🔥\n\n`;
  const profileMsg=hasProfile?`🏢 ${profile.empresa}${profile.giro?` · ${profile.giro}`:""}\n`:"";
  const offersMsg=profile&&profile.ofertas?`🔥 Ofertas activas: Sí\n`:"";
  const stats=`${profileMsg}${offersMsg}📊 Cartera: ${clients.length} en cartera, ${clients.filter(c=>c.status==="cliente").length} activos, ${clients.filter(c=>c.status==="nuevo").length} sin contactar.\n${todaysActions>0?`✅ Hoy: ${todaysActions} acciones.`:"🎯 Aún no haces contactos hoy."}\n\n${!hasProfile?"⚠️ Configura tu perfil en 👤 Perfil para que pueda ayudarte mejor.\n\n":""}Te ayudo con: 🎯Pitch · 💬Objeciones · 💰Cotización · 📝WhatsApp · 📊Cartera\n\n¿Qué necesitas?`;
  const defaultMsg=[{role:"assistant",content:welcome+stats,ts:Date.now()}];

  // Load saved chat history (max 3 days old)
  const loadChat=()=>{
    const saved=sGet(`${uid}-chat`);if(!saved||!saved.messages)return defaultMsg;
    const threeDaysAgo=Date.now()-(3*24*60*60*1000);
    const valid=saved.messages.filter(m=>!m.ts||m.ts>threeDaysAgo);
    return valid.length>0?valid:defaultMsg;
  };

  const[msgs,setMsgs]=useState(defaultMsg);const[input,setInput]=useState("");const[busy,setBusy]=useState(false);const ref=useRef(null);const[chatLoaded,setChatLoaded]=useState(false);

  // Load chat on mount
  useEffect(()=>{const saved=loadChat();setMsgs(saved);setChatLoaded(true);},[uid]);

  // Save chat whenever messages change
  useEffect(()=>{if(chatLoaded&&msgs.length>0)sSet(`${uid}-chat`,{messages:msgs});},[msgs,chatLoaded]);

  const clearChat=()=>{setMsgs(defaultMsg);sSet(`${uid}-chat`,{messages:defaultMsg});};

  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const QA=[
    {label:"🚀 ¿Qué hago ahora?",m:`Mira mi cartera completa: ${clients.length} clientes total, ${clients.filter(c=>c.status==="nuevo").length} sin contactar, ${clients.filter(c=>c.status==="contactado").length} contactados esperando, ${clients.filter(c=>c.status==="interesado").length} interesados, ${clients.filter(c=>c.paid==="no").length} que me deben plata. Tengo ${routeClients.length} paradas en la ruta de hoy. Dime LA ÚNICA acción más rentable que debería hacer AHORA MISMO y dame el guión exacto.`},
    {label:"💰 Cotización rápida",m:"Arma una cotización profesional usando mis precios y ofertas de la semana. Que quede lista para copiar y enviar por WhatsApp. Formato limpio con productos, precios, condiciones de pago y datos de mi empresa."},
    {label:"💬 Escribir WhatsApp",m:"Necesito un mensaje de WhatsApp. Pregúntame para quién es (cliente nuevo, seguimiento, reactivar uno que dejó de comprar, o agradecer una compra) y genérame el mensaje perfecto listo para copiar."},
    {label:"🛡️ Me dijeron NO",m:"Un cliente me rechazó o me puso una objeción. Pregúntame qué me dijo exactamente y dame el contraargumento perfecto para responderle ahora mismo por WhatsApp o en persona."},
    {label:"🏦 Cobrar deuda",m:`Necesito cobrar una deuda. Tengo ${clients.filter(c=>c.paid==="no").length} clientes que me deben. Pregúntame el caso específico (cheque protestado, factura vencida, pago atrasado) y dame 3 versiones del mensaje: una amigable, una firme, y un último aviso. Que sean profesionales pero directos, estilo chileno. Incluye referencia a las consecuencias legales si corresponde (DICOM, protesto, etc).`},
    {label:"📊 Resumen semanal",m:`Dame el resumen de mi situación: ${clients.length} clientes totales, ${clients.filter(c=>c.status==="cliente").length} activos comprando, ${clients.filter(c=>c.status==="nuevo").length} sin contactar, ${clients.filter(c=>c.status==="interesado").length} interesados sin cerrar, ${clients.filter(c=>c.paid==="no").length} que me deben plata, racha de ${streak.count} días. Dime qué hice bien, qué estoy descuidando, y las 3 acciones más importantes para esta semana.`}
  ];
  const send=async c=>{const text=c||input;if(!text.trim()||busy)return;setInput("");const um={role:"user",content:text,ts:Date.now()};setMsgs(p=>[...p,um]);setBusy(true);
    try{
      const profileCtx=hasProfile?`
PERFIL DEL VENDEDOR:
- Empresa: ${profile.empresa}
- Giro: ${profile.giro||"No especificado"}
- Zona: ${profile.zona||"No especificada"}
- Teléfono: ${profile.telefono||"No especificado"}
- Email empresa: ${profile.emailEmpresa||"No especificado"}
- Descripción: ${profile.descripcion||"No especificada"}
${profile.ofertas?`\nOFERTAS DE LA SEMANA:\n${profile.ofertas}`:""}
`:"(El vendedor NO ha configurado su perfil. Sugiérele que vaya a 👤 Perfil para configurar su empresa, giro y descripción.)";
      const ctx=`VENDEDOR: ${userName}, racha ${streak.count}d, ${clients.length} en cartera, ${clients.filter(c=>c.status==="cliente").length} activos, ${clients.filter(c=>c.status==="nuevo").length} nuevos, ${routeClients.length} paradas hoy.\n${profileCtx}\n${priceText?`LISTA DE PRECIOS:\n${priceText}`:"(Sin lista de precios cargada)"}`;
      const reply=await callAI(`Coach de ventas de ${fn}. Vendedor estrella chileno — directo, práctico. Chilenismos moderados.

IMPORTANTE: Conoces la empresa del vendedor y sus productos. USA esta información en cada respuesta:
- Cuando haga pitch, usa el nombre de la empresa y sus ventajas
- Cuando arme cotización, usa los precios y ofertas de la semana
- Cuando redacte mensajes, firma con los datos de la empresa
- Si tiene ofertas de la semana, SIEMPRE menciónalas en pitches y cotizaciones

COBRANZA Y DEUDAS: Eres experto en cobranza comercial chilena. Conoces:
- Cheques protestados: consecuencias legales, DICOM, boletín comercial
- Facturas vencidas: plazos legales, intereses moratorios
- Mensajes de cobranza en 3 niveles: amigable (recordatorio), firme (con plazo), último aviso (con consecuencias)
- Siempre profesional, nunca amenazante. Firme pero respetuoso.
- Referencia a normativa chilena cuando corresponda

PSICOLOGÍA: 1)VALIDA acciones 2)Racha ${streak.count}d 3)UNA acción concreta 4)Guiones EXACTOS para copiar 5)"${clients.filter(c=>c.status==="nuevo").length} sin contactar—otro vendedor puede llegar antes" 6)"Seguimiento en 48h = 3x más ventas"
Max 250 palabras. Termina con 1 acción concreta. ${ctx}`,[...msgs.filter((_,i)=>i>0),um].map(m=>({role:m.role,content:m.content})),1500);
      setMsgs(p=>[...p,{role:"assistant",content:reply,ts:Date.now()}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"Error. Intenta de nuevo.",ts:Date.now()}]);}setBusy(false);};
  return(<div style={{animation:"fadeIn 0.4s",display:"flex",flexDirection:"column",height:"calc(100vh - 160px)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}><div><h2 style={{fontSize:"20px",fontWeight:900}}>Agente de Ventas</h2><p style={{fontSize:"12px",color:"#64748b"}}>Tu coach personal</p></div><div style={{display:"flex",gap:"6px",alignItems:"center"}}>{msgs.length>1&&<button onClick={clearChat} style={{padding:"4px 8px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"6px",color:"#94a3b8",fontSize:"10px",fontWeight:600,cursor:"pointer"}}>🗑️ Limpiar</button>}<div style={{background:streak.count>=5?"linear-gradient(135deg,#FFC872,#f5a623)":"#FFE3B3",padding:"6px 12px",borderRadius:"10px",border:streak.count>=5?"none":"2px solid #b2dfdb",textAlign:"center"}}><div style={{fontSize:"16px",fontWeight:900,color:streak.count>=5?"#fff":"#FFC872"}}>🔥{streak.count}</div><div style={{fontSize:"9px",fontWeight:700,color:streak.count>=5?"#5d4037":"#d97706"}}>RACHA</div></div></div></div>
    {msgs.length<=1&&<div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"10px"}}>{QA.map(q=><button key={q.label} onClick={()=>send(q.m)} style={{padding:"7px 10px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"8px",color:"#475569",fontSize:"12px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>{q.label}</button>)}</div>}
    <div ref={ref} style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:"8px",paddingBottom:"6px"}}>{msgs.map((m,i)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%"}}><div style={{padding:"12px 14px",borderRadius:"14px",fontSize:"14px",lineHeight:1.7,whiteSpace:"pre-wrap",...(m.role==="user"?{background:"linear-gradient(135deg,#31B189,#28967a)",color:"#fff",borderBottomRightRadius:"4px"}:{background:"#fff",color:"#1e293b",border:"2px solid #e2e8f0",borderBottomLeftRadius:"4px"})}}>{m.content}</div></div>)}{busy&&<div style={{alignSelf:"flex-start",padding:"12px 14px",borderRadius:"14px",background:"#fff",border:"2px solid #e2e8f0"}}><span style={{color:"#94a3b8"}}>Pensando...</span></div>}</div>
    <div style={{display:"flex",gap:"8px",paddingTop:"8px",borderTop:"2px solid #e2e8f0"}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Pregúntame..." onKeyDown={e=>e.key==="Enter"&&send()} style={{...S.input,flex:1}} onFocus={e=>e.target.style.borderColor="#31B189"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/><button onClick={()=>send()} disabled={busy} style={{padding:"12px 16px",background:busy?"#94a3b8":"linear-gradient(135deg,#31B189,#28967a)",border:"none",borderRadius:"12px",color:"#fff",fontWeight:900,fontSize:"18px",cursor:busy?"not-allowed":"pointer"}}>→</button></div>
  </div>);
}
