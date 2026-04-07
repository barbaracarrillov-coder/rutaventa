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

const STATUS={nuevo:{label:"Nuevo",color:"#2563eb",bg:"#dbeafe",icon:"★"},contactado:{label:"Contactado",color:"#d97706",bg:"#fef3c7",icon:"✉"},interesado:{label:"Interesado",color:"#7c3aed",bg:"#ede9fe",icon:"🎯"},cliente:{label:"Cliente",color:"#059669",bg:"#d1fae5",icon:"✓"},perdido:{label:"Perdido",color:"#dc2626",bg:"#fee2e2",icon:"✕"}};
const TABS=[{id:"prospects",icon:"🔍",label:"Buscar"},{id:"clients",icon:"📋",label:"Clientes"},{id:"route",icon:"🗺️",label:"Ruta"},{id:"prices",icon:"💰",label:"Precios"},{id:"agent",icon:"🤖",label:"Agente"}];
const QUICK=[{label:"🍖 Carnicerías",q:"carnicería"},{label:"🍽️ Restaurantes",q:"restaurante"},{label:"🏪 Mercados",q:"mercado de alimentos"},{label:"🏨 Hoteles",q:"hotel con restaurante"},{label:"🍳 Fuentes de soda",q:"fuente de soda"},{label:"🍕 Pizzerías",q:"pizzería"},{label:"☕ Cafeterías",q:"cafetería"},{label:"🎂 Pastelerías",q:"pastelería"},{label:"🏥 Casinos",q:"casino empresa comedor"},{label:"🐟 Marisquerías",q:"cevichería marisquería"}];

const S={input:{width:"100%",padding:"14px 16px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"14px",color:"#1e293b",fontSize:"16px",outline:"none",fontFamily:"'Nunito',sans-serif"},card:{background:"#fff",borderRadius:"14px",border:"2px solid #e2e8f0",padding:"16px",marginBottom:"10px"},section:{fontSize:"13px",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"10px"},btn:{padding:"14px 24px",background:"linear-gradient(135deg,#ea580c,#dc2626)",border:"none",borderRadius:"14px",color:"#fff",fontWeight:800,fontSize:"16px",cursor:"pointer",boxShadow:"0 3px 12px rgba(234,88,12,0.25)",fontFamily:"'Nunito',sans-serif",width:"100%"},btnSm:{padding:"8px 14px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"10px",color:"#475569",fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}};

// ━━━ LOGIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginScreen({onLogin}){const[mode,setMode]=useState("login");const[name,setName]=useState("");const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[error,setError]=useState("");const[loading,setLoading]=useState(false);
  const submit=()=>{if(!email.trim()||!pass.trim()){setError("Completa todos los campos");return;}if(mode==="register"&&!name.trim()){setError("Ingresa tu nombre");return;}setLoading(true);setError("");
    const users=sGet("rv-users")||{};if(mode==="register"){if(users[email]){setError("Email ya existe");setLoading(false);return;}users[email]={name:name.trim(),pass,created:today()};sSet("rv-users",users);onLogin({email,name:name.trim()});}else{const u=users[email];if(!u||u.pass!==pass){setError("Email o contraseña incorrectos");setLoading(false);return;}onLogin({email,name:u.name});}setLoading(false);};
  return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fff7ed,#fef3c7,#fff)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Nunito',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:'Nunito',sans-serif}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{width:"100%",maxWidth:"400px",animation:"fadeIn 0.5s"}}>
      <div style={{textAlign:"center",marginBottom:"28px"}}><div style={{width:"60px",height:"60px",borderRadius:"16px",background:"linear-gradient(135deg,#ea580c,#dc2626)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:900,color:"#fff",boxShadow:"0 8px 24px rgba(234,88,12,0.3)",marginBottom:"14px"}}>R</div><h1 style={{fontSize:"26px",fontWeight:900}}>RutaVenta</h1><p style={{fontSize:"14px",color:"#64748b"}}>Tu agente de ventas con IA</p></div>
      <div style={{background:"#fff",borderRadius:"18px",padding:"28px 24px",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",border:"2px solid #f1f5f9"}}>
        <div style={{display:"flex",background:"#f1f5f9",borderRadius:"10px",padding:"3px",marginBottom:"20px"}}><button onClick={()=>{setMode("login");setError("");}} style={{flex:1,padding:"9px",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:700,cursor:"pointer",background:mode==="login"?"#fff":"transparent",color:mode==="login"?"#ea580c":"#94a3b8"}}>Iniciar Sesión</button><button onClick={()=>{setMode("register");setError("");}} style={{flex:1,padding:"9px",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:700,cursor:"pointer",background:mode==="register"?"#fff":"transparent",color:mode==="register"?"#ea580c":"#94a3b8"}}>Crear Cuenta</button></div>
        {mode==="register"&&<div style={{marginBottom:"12px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Tu nombre</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="ej: María González" style={S.input} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>}
        <div style={{marginBottom:"12px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" type="email" style={S.input} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>
        <div style={{marginBottom:"18px"}}><label style={{fontSize:"13px",fontWeight:700,color:"#475569",display:"block",marginBottom:"5px"}}>Contraseña</label><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&submit()} style={S.input} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></div>
        {error&&<div style={{background:"#fef2f2",color:"#dc2626",padding:"10px 14px",borderRadius:"10px",fontSize:"14px",fontWeight:600,marginBottom:"14px",borderLeft:"4px solid #dc2626"}}>{error}</div>}
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
  const uid=user.email.replace(/[^a-z0-9]/gi,"");
  useEffect(()=>{
    const c=sGet(`${uid}-cl`)||[];const r=sGet(`${uid}-rt`)||[];const p=sGet(`${uid}-pr`)||"";const s=sGet(`${uid}-sk`)||{count:0,lastDate:null};
    setClients(c);setRoute(r);setPriceText(p);
    const td=today();if(s.lastDate===td){setStreak(s);}else{const y=new Date();y.setDate(y.getDate()-1);const yd=y.toISOString().split("T")[0];if(s.lastDate===yd){const u={count:s.count+1,lastDate:td};setStreak(u);sSet(`${uid}-sk`,u);}else{const u={count:1,lastDate:td};setStreak(u);sSet(`${uid}-sk`,u);}}
    setLoaded(true);
  },[uid]);
  useEffect(()=>{if(loaded)sSet(`${uid}-cl`,clients);},[clients,loaded]);
  useEffect(()=>{if(loaded)sSet(`${uid}-rt`,route);},[route,loaded]);

  const addClient=useCallback(p=>{setClients(prev=>prev.find(c=>c.id===p.id)?prev:[...prev,{...p,status:"nuevo",notes:[],added:today(),lastContact:null}]);},[]);
  const setStatus=useCallback((id,s)=>setClients(prev=>prev.map(c=>c.id===id?{...c,status:s,lastContact:today()}:c)),[]);
  const addNote=useCallback((id,t)=>setClients(prev=>prev.map(c=>c.id===id?{...c,notes:[...(c.notes||[]),{text:t,date:today()}],lastContact:today()}:c)),[]);
  const delClient=useCallback(id=>{setClients(p=>p.filter(c=>c.id!==id));setRoute(p=>p.filter(i=>i!==id));},[]);
  const togglePaid=useCallback((id)=>setClients(prev=>prev.map(c=>c.id===id?{...c,paid:c.paid==="yes"?"no":"yes",lastContact:today()}:c)),[]);
  const toRoute=useCallback(id=>setRoute(p=>p.includes(id)?p:[...p,id]),[]);
  const offRoute=useCallback(id=>setRoute(p=>p.filter(i=>i!==id)),[]);
  const moveRoute=useCallback((f,t)=>setRoute(p=>{const a=[...p];const[m]=a.splice(f,1);a.splice(t,0,m);return a;}),[]);
  const reorderRoute=useCallback((newOrder)=>setRoute(newOrder),[]);
  const savePrices=useCallback(t=>{setPriceText(t);sSet(`${uid}-pr`,t);},[uid]);
  const routeClients=route.map(id=>clients.find(c=>c.id===id)).filter(Boolean);
  const todaysActions=clients.filter(c=>c.lastContact===today()).length;

  return(<><Head><title>RutaVenta</title><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/><meta name="theme-color" content="#ea580c"/><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗺</text></svg>"/></Head>
    <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,textarea,button{font-family:'Nunito',sans-serif}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}}/>
    <div style={{minHeight:"100vh",background:"#f8f9fb",fontFamily:"'Nunito',sans-serif",color:"#1e293b",display:"flex",flexDirection:"column"}}>
      <header style={{padding:"12px 16px",background:"#fff",borderBottom:"2px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,#ea580c,#dc2626)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",fontWeight:900,color:"#fff"}}>R</div><div><div style={{fontSize:"15px",fontWeight:800}}>Hola, {user.name.split(" ")[0]} 👋</div><div style={{fontSize:"11px",color:"#64748b",fontWeight:600}}>🔥 Racha: {streak.count} días · {clients.filter(c=>c.status==="cliente").length} clientes</div></div></div><button onClick={onLogout} style={{padding:"5px 10px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"8px",color:"#94a3b8",fontSize:"11px",fontWeight:600,cursor:"pointer"}}>Salir</button></header>
      {tab==="prospects"&&<div style={{background:"linear-gradient(135deg,#fff7ed,#fef3c7)",padding:"10px 16px",borderBottom:"2px solid #fed7aa",display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"20px"}}>🎯</span><div><div style={{fontSize:"13px",fontWeight:800,color:"#92400e"}}>Meta de hoy</div><div style={{fontSize:"12px",color:"#a16207"}}>{clients.filter(c=>c.status==="nuevo").length>3?`Contacta ${Math.min(3,clients.filter(c=>c.status==="nuevo").length)} clientes y sigue a ${Math.min(2,clients.filter(c=>c.status==="contactado").length)} contactados`:`Agrega ${Math.max(0,5-clients.length)} clientes a tu cartera`}</div></div></div>}
      <nav style={{display:"flex",background:"#fff",borderBottom:"2px solid #e2e8f0",padding:"0 2px",overflowX:"auto"}}>{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:"55px",padding:"10px 2px 8px",border:"none",cursor:"pointer",background:"transparent",color:tab===t.id?"#ea580c":"#94a3b8",display:"flex",flexDirection:"column",alignItems:"center",gap:"1px",borderBottom:tab===t.id?"3px solid #ea580c":"3px solid transparent",fontWeight:tab===t.id?800:600}}><span style={{fontSize:"18px"}}>{t.icon}</span><span style={{fontSize:"10px"}}>{t.label}</span></button>)}</nav>
      <main style={{flex:1,overflow:"auto",padding:"14px",maxWidth:"600px",margin:"0 auto",width:"100%"}}>
        {tab==="prospects"&&<Prospects clients={clients} addClient={addClient}/>}
        {tab==="clients"&&<CL clients={clients} setStatus={setStatus} addNote={addNote} delClient={delClient} toRoute={toRoute} route={route} addClient={addClient} togglePaid={togglePaid}/>}
        {tab==="route"&&<RT routeClients={routeClients} offRoute={offRoute} moveRoute={moveRoute} setStatus={setStatus} reorderRoute={reorderRoute}/>}
        {tab==="prices"&&<PR priceText={priceText} savePrices={savePrices}/>}
        {tab==="agent"&&<AG clients={clients} routeClients={routeClients} priceText={priceText} streak={streak} userName={user.name} todaysActions={todaysActions} uid={uid}/>}
      </main>
    </div>
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
    <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="📍 Tu ciudad (ej: Puerto Montt, Puerto Varas)" style={{...S.input,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>{QUICK.map(qs=><button key={qs.q} onClick={()=>{setQ(qs.q);search(qs.q);}} style={{padding:"7px 11px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"20px",color:"#475569",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>{qs.label}</button>)}</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Otro tipo..." onKeyDown={e=>e.key==="Enter"&&search()} style={{...S.input,flex:1}} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/><button onClick={()=>search()} disabled={ld} style={{...S.btn,width:"auto",padding:"12px 18px",opacity:ld?0.6:1}}>{ld?"...":"Buscar"}</button></div>
    {ld&&<div style={{textAlign:"center",padding:"36px",color:"#94a3b8"}}><div style={{fontSize:"32px",marginBottom:"8px"}}>🔍</div>Buscando negocios reales...</div>}
    {!ld&&searched&&results.length===0&&<div style={{textAlign:"center",padding:"36px",color:"#94a3b8"}}>No se encontraron negocios. Prueba otra búsqueda.</div>}
    {results.map((r,i)=><div key={r.id||i} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",animation:`fadeIn 0.3s ease ${i*0.05}s both`}}><div style={{flex:1}}><div style={{fontSize:"16px",fontWeight:800,marginBottom:"2px"}}>{r.name}</div><div style={{fontSize:"13px",color:"#64748b",marginBottom:"4px"}}>{r.address}</div><div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:"12px",padding:"2px 8px",borderRadius:"10px",background:"#fff7ed",color:"#c2410c",fontWeight:700}}>{r.type}</span>{r.rating>0&&<span style={{fontSize:"12px",color:"#d97706",fontWeight:700}}>{"★".repeat(Math.round(r.rating))} {r.rating}</span>}{r.user_ratings_total>0&&<span style={{fontSize:"11px",color:"#94a3b8"}}>({r.user_ratings_total})</span>}{r.open_now===true&&<span style={{fontSize:"11px",color:"#059669",fontWeight:700}}>● Abierto</span>}{r.open_now===false&&<span style={{fontSize:"11px",color:"#dc2626",fontWeight:700}}>● Cerrado</span>}</div></div>{!has(r.id)?<button onClick={()=>addClient(r)} style={{padding:"9px 13px",background:"linear-gradient(135deg,#ea580c,#dc2626)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:800,fontSize:"13px",cursor:"pointer",flexShrink:0}}>+ Agregar</button>:<span style={{padding:"9px 13px",background:"#d1fae5",borderRadius:"10px",color:"#059669",fontWeight:700,fontSize:"13px"}}>✓</span>}</div>)}
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
  const handleImport=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(l=>l);
    if(lines.length<2){setImportMsg("❌ El archivo está vacío");setTimeout(()=>setImportMsg(""),3000);return;}
    // Detect separator
    const sep=lines[0].includes("\t")?"\t":",";
    const headers=lines[0].toLowerCase().split(sep).map(h=>h.trim().replace(/"/g,""));
    // Find column indices
    const nameIdx=headers.findIndex(h=>h.includes("nombre")||h==="name"||h.includes("cliente"));
    const addrIdx=headers.findIndex(h=>h.includes("direc")||h.includes("address"));
    const phoneIdx=headers.findIndex(h=>h.includes("teléfono")||h.includes("telefono")||h.includes("phone")||h.includes("fono"));
    const typeIdx=headers.findIndex(h=>h.includes("giro")||h.includes("tipo")||h.includes("type")||h.includes("rubro"));
    const emailIdx=headers.findIndex(h=>h.includes("email")||h.includes("correo")||h.includes("mail"));
    const waIdx=headers.findIndex(h=>h.includes("whatsapp")||h.includes("wsp")||h.includes("wa"));
    const rutIdx=headers.findIndex(h=>h.includes("rut")||h.includes("ruc")||h.includes("tax"));
    const locIdx=headers.findIndex(h=>h.includes("localidad")||h.includes("ciudad")||h.includes("city")||h.includes("comuna"));
    if(nameIdx===-1){setImportMsg("❌ No se encontró la columna 'Cliente'. Usa la plantilla.");setTimeout(()=>setImportMsg(""),4000);return;}
    let count=0;
    for(let i=1;i<lines.length;i++){
      const cols=lines[i].split(sep).map(c=>c.trim().replace(/^"|"$/g,""));
      const name=cols[nameIdx];if(!name)continue;
      addClient({
        id:"imp_"+Date.now()+"_"+Math.random().toString(36).slice(2,8),
        name:name,
        address:addrIdx>=0?cols[addrIdx]||"Sin dirección":"Sin dirección",
        phone:phoneIdx>=0?cols[phoneIdx]||"":"",
        type:typeIdx>=0?cols[typeIdx]||"":"",
        email:emailIdx>=0?cols[emailIdx]||"":"",
        whatsapp:waIdx>=0?cols[waIdx]||"":"",
        rut:rutIdx>=0?cols[rutIdx]||"":"",
        localidad:locIdx>=0?cols[locIdx]||"":"",
        rating:0,
      });
      count++;
    }
    setImportMsg(`✅ ${count} clientes importados`);setTimeout(()=>setImportMsg(""),3000);
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

  const[filterLoc,setFilterLoc]=useState("todas");
  const localidades=[...new Set(clients.map(c=>c.localidad).filter(l=>l&&l.trim()))].sort();
  const list0=filter==="todos"?clients:filter==="enruta"?clients.filter(c=>route.includes(c.id)):filter==="sinruta"?clients.filter(c=>!route.includes(c.id)):clients.filter(c=>c.status===filter);
  const list=filterLoc==="todas"?list0:list0.filter(c=>(c.localidad||"")===filterLoc);
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
    </div>
    {importMsg&&<div style={{padding:"10px 14px",borderRadius:"10px",marginBottom:"10px",fontSize:"14px",fontWeight:700,background:importMsg.startsWith("✅")?"#f0fdf4":"#fef2f2",color:importMsg.startsWith("✅")?"#059669":"#dc2626",border:`2px solid ${importMsg.startsWith("✅")?"#bbf7d0":"#fecaca"}`}}>{importMsg}</div>}
    {showAdd&&<div style={{...S.card,border:"2px solid #10b981",marginBottom:"14px"}}>
      <div style={{fontSize:"15px",fontWeight:800,color:"#059669",marginBottom:"10px"}}>➕ Nuevo Cliente</div>
      <input value={newRut} onChange={e=>setNewRut(e.target.value)} placeholder="RUT (ej: 12.345.678-9)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre del cliente *" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newAddr} onChange={e=>setNewAddr(e.target.value)} placeholder="Dirección (ej: Av. Angelmó 1876)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newLocalidad} onChange={e=>setNewLocalidad(e.target.value)} placeholder="Localidad (ej: Puerto Montt)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newType} onChange={e=>setNewType(e.target.value)} placeholder="Giro (ej: Restaurante, Carnicería, Hotelería)" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="📧 Email (opcional)" type="email" style={{...S.input,marginBottom:"8px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="📞 Teléfono / WhatsApp (ej: +56 9 1234 5678)" style={{...S.input,marginBottom:"10px",fontSize:"15px"}} onFocus={e=>e.target.style.borderColor="#059669"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      <div style={{display:"flex",gap:"8px"}}><button onClick={handleAddManual} style={{...S.btn,flex:1,background:"linear-gradient(135deg,#059669,#10b981)",fontSize:"15px",padding:"12px"}}>✓ Guardar</button><button onClick={()=>setShowAdd(false)} style={{...S.btnSm,flex:0,padding:"12px 18px"}}>Cancelar</button></div>
    </div>}
    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}><Pill l={`Todos(${cnt.todos})`} on={filter==="todos"} fn={()=>setFilter("todos")} c="#64748b"/>{Object.entries(STATUS).map(([k,v])=><Pill key={k} l={`${v.icon}${v.label}(${cnt[k]||0})`} on={filter===k} fn={()=>setFilter(k)} c={v.color}/>)}<Pill l={`🗺️ En ruta(${clients.filter(c=>route.includes(c.id)).length})`} on={filter==="enruta"} fn={()=>setFilter("enruta")} c="#ea580c"/><Pill l={`⭕ Sin ruta(${clients.filter(c=>!route.includes(c.id)).length})`} on={filter==="sinruta"} fn={()=>setFilter("sinruta")} c="#64748b"/></div>
    {localidades.length>1&&<div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"14px"}}><Pill l="📍 Todas" on={filterLoc==="todas"} fn={()=>setFilterLoc("todas")} c="#0ea5e9"/>{localidades.map(loc=><Pill key={loc} l={`📍 ${loc}`} on={filterLoc===loc} fn={()=>setFilterLoc(loc)} c="#0ea5e9"/>)}</div>}
    {list.length===0&&<div style={{textAlign:"center",padding:"44px",color:"#94a3b8"}}><div style={{fontSize:"36px",marginBottom:"8px"}}>📋</div>{clients.length===0?"Agrega clientes con el botón verde ☝️ o busca en 🔍":"Sin resultados"}</div>}
    {list.map((c,i)=>{const cfg=STATUS[c.status];const open=openId===c.id;const inR=route.includes(c.id);return(<div key={c.id} style={{...S.card,padding:0,overflow:"hidden",animation:`fadeIn 0.3s ease ${i*0.03}s both`}}>
      <div onClick={()=>setOpenId(open?null:c.id)} style={{padding:"14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px",flexWrap:"wrap"}}><span style={{fontSize:"15px",fontWeight:800}}>{c.name}</span><span style={{fontSize:"11px",padding:"2px 7px",borderRadius:"8px",background:cfg.bg,color:cfg.color,fontWeight:700}}>{cfg.icon}{cfg.label}</span>{c.paid==="yes"&&<span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:"#d1fae5",color:"#059669",fontWeight:700}}>💰 Pagó</span>}{c.paid==="no"&&<span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:"#fee2e2",color:"#dc2626",fontWeight:700}}>⚠️ Debe</span>}{inR&&<span style={{fontSize:"10px",padding:"2px 5px",borderRadius:"6px",background:"#fff7ed",color:"#ea580c",fontWeight:700}}>🗺️</span>}</div><div style={{fontSize:"12px",color:"#64748b"}}>{c.rut&&`${c.rut} · `}{c.address}{c.localidad&&`, ${c.localidad}`}{c.type&&` · ${c.type}`}</div></div><span style={{color:"#94a3b8",transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span></div>
      {open&&<div style={{padding:"0 14px 14px",borderTop:"2px solid #f1f5f9"}}><div style={{...S.section,marginTop:"10px"}}>Estado</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"10px"}}>{Object.entries(STATUS).map(([k,v])=><button key={k} onClick={()=>setStatus(c.id,k)} style={{padding:"6px 10px",borderRadius:"8px",fontSize:"12px",fontWeight:700,cursor:"pointer",background:c.status===k?v.color:"#f8fafc",color:c.status===k?"#fff":v.color,border:`2px solid ${c.status===k?v.color:"#e2e8f0"}`}}>{v.icon}{v.label}</button>)}</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>{!inR&&<button onClick={()=>toRoute(c.id)} style={{...S.btnSm,color:"#ea580c",borderColor:"#fed7aa",background:"#fff7ed",fontSize:"12px"}}>🗺️ A ruta</button>}<button onClick={()=>togglePaid(c.id)} style={{...S.btnSm,color:c.paid==="yes"?"#dc2626":"#059669",borderColor:c.paid==="yes"?"#fecaca":"#bbf7d0",background:c.paid==="yes"?"#fef2f2":"#f0fdf4",fontSize:"12px"}}>{c.paid==="yes"?"❌ Marcar como debe":"💰 Marcar como pagó"}</button><button onClick={()=>delClient(c.id)} style={{...S.btnSm,color:"#dc2626",borderColor:"#fecaca",background:"#fef2f2",fontSize:"12px"}}>🗑️ Eliminar</button></div>
        {/* CONTACT BUTTONS */}
        {(c.whatsapp||c.phone||c.email)&&<div style={{marginBottom:"10px"}}><div style={S.section}>Contactar</div><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {(c.whatsapp||c.phone)&&<a href={`https://wa.me/${(c.whatsapp||c.phone).replace(/[^0-9+]/g,"").replace("+","")}`} target="_blank" rel="noopener noreferrer" style={{...S.btnSm,color:"#fff",background:"#25d366",borderColor:"#25d366",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>💬 WhatsApp</a>}
          {c.email&&<a href={`mailto:${c.email}`} style={{...S.btnSm,color:"#fff",background:"#2563eb",borderColor:"#2563eb",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>📧 Email</a>}
          {c.phone&&<a href={`tel:${c.phone}`} style={{...S.btnSm,color:"#fff",background:"#7c3aed",borderColor:"#7c3aed",textDecoration:"none",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}>📞 Llamar</a>}
        </div></div>}
        <div style={S.section}>Notas ({(c.notes||[]).length})</div>{(c.notes||[]).map((n,ni)=><div key={ni} style={{padding:"8px 10px",background:"#fffbeb",borderLeft:"3px solid #f59e0b",borderRadius:"0 8px 8px 0",marginBottom:"4px"}}><div style={{fontSize:"13px",lineHeight:1.5}}>{n.text}</div><div style={{fontSize:"10px",color:"#94a3b8",marginTop:"2px"}}>{n.date}</div></div>)}
        <div style={{display:"flex",gap:"6px",marginTop:"5px"}}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Nota..." onKeyDown={e=>{if(e.key==="Enter"&&note.trim()){addNote(c.id,note.trim());setNote("");}}} style={{...S.input,flex:1,fontSize:"14px",padding:"10px 12px"}}/><button onClick={()=>{if(note.trim()){addNote(c.id,note.trim());setNote("");}}} style={{padding:"10px 14px",background:"#ea580c",border:"none",borderRadius:"10px",color:"#fff",fontWeight:800,cursor:"pointer"}}>+</button></div>
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
    <div style={{background:"linear-gradient(135deg,#fff7ed,#fef3c7)",borderRadius:"12px",padding:"14px",border:"2px solid #fed7aa",marginBottom:"10px",display:"flex",justifyContent:"space-around",textAlign:"center"}}><div><div style={{fontSize:"24px",fontWeight:900,color:"#ea580c"}}>{routeClients.length}</div><div style={{fontSize:"11px",color:"#92400e",fontWeight:600}}>Paradas</div></div><div><div style={{fontSize:"24px",fontWeight:900,color:"#d97706"}}>{routeInfo?routeInfo.distance:"—"}</div><div style={{fontSize:"11px",color:"#92400e",fontWeight:600}}>Distancia</div></div><div><div style={{fontSize:"24px",fontWeight:900,color:"#059669"}}>{routeInfo?routeInfo.duration:"—"}</div><div style={{fontSize:"11px",color:"#065f46",fontWeight:600}}>Tiempo</div></div></div>
    {/* OPTIMIZE BUTTON */}
    {routeClients.length>=3&&<button onClick={optimizeRoute} disabled={optimizing} style={{...S.btn,marginBottom:"8px",background:optimizing?"#94a3b8":"linear-gradient(135deg,#7c3aed,#a855f7)",fontSize:"16px",padding:"14px"}}>{optimizing?"⏳ Calculando ruta óptima...":"🧠 Optimizar Ruta (más corta)"}</button>}
    <a href={link} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"14px",background:"#1a73e8",color:"#fff",borderRadius:"12px",fontSize:"17px",fontWeight:800,textDecoration:"none",marginBottom:"12px",boxShadow:"0 3px 12px rgba(26,115,232,0.3)"}}>📍 Navegar en Google Maps</a>
    {routeClients.map((c,idx)=>{const cfg=STATUS[c.status];return(<div key={c.id}>{idx>0&&<div style={{width:"3px",height:"14px",background:"#fed7aa",margin:"0 0 0 24px"}}/>}<div style={{...S.card,display:"flex",gap:"10px",alignItems:"flex-start"}}><div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,#ea580c,#dc2626)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"16px",flexShrink:0}}>{idx+1}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px",flexWrap:"wrap"}}><span style={{fontSize:"15px",fontWeight:800}}>{c.name}</span><span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"6px",background:cfg.bg,color:cfg.color,fontWeight:700}}>{cfg.icon}{cfg.label}</span></div><div style={{fontSize:"12px",color:"#64748b",marginBottom:"6px"}}>{c.address}</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{idx>0&&<button onClick={()=>moveRoute(idx,idx-1)} style={S.btnSm}>↑</button>}{idx<routeClients.length-1&&<button onClick={()=>moveRoute(idx,idx+1)} style={S.btnSm}>↓</button>}<button onClick={()=>setStatus(c.id,"contactado")} style={{...S.btnSm,color:"#d97706",borderColor:"#fde68a",background:"#fffbeb"}}>✉</button><button onClick={()=>offRoute(c.id)} style={{...S.btnSm,color:"#dc2626",borderColor:"#fecaca",background:"#fef2f2"}}>✕</button></div></div></div></div>);})}
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
    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"Pechuga de pollo - $3.200/kg\nLomo liso - $8.900/kg\nCostillar cerdo - $4.500/kg"} rows={10} style={{...S.input,resize:"vertical",minHeight:"180px",lineHeight:1.7,marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    <button onClick={save} style={{...S.btn,background:saved?"#059669":"linear-gradient(135deg,#ea580c,#dc2626)"}}>{saved?"✓ Guardado":"💾 Guardar Precios"}</button>
    {text&&<div style={{marginTop:"14px",padding:"12px",background:"#f0fdf4",borderRadius:"10px",border:"2px solid #bbf7d0"}}><div style={{fontSize:"13px",fontWeight:700,color:"#059669"}}>✓ Lista cargada</div><div style={{fontSize:"12px",color:"#065f46"}}>{text.split("\n").filter(l=>l.trim()).length} productos disponibles para el agente IA</div></div>}
  </div>);
}

// ━━━ AGENT (with 3-day chat history) ━━━━━━━━━━━━━━━━━
function AG({clients,routeClients,priceText,streak,userName,todaysActions,uid}){const fn=userName.split(" ")[0];
  const welcome=streak.count>=5?`🔥 ¡${fn}, llevas ${streak.count} días de racha! Top 10%. Los que mantienen 20+ duplican su cartera.\n\n`:streak.count>=2?`💪 ${fn}, van ${streak.count} días de racha.\n\n`:`¡Hola ${fn}! Hoy empieza tu racha. 🔥\n\n`;
  const stats=`📊 Cartera: ${clients.length} en cartera, ${clients.filter(c=>c.status==="cliente").length} activos, ${clients.filter(c=>c.status==="nuevo").length} sin contactar.\n${todaysActions>0?`✅ Hoy: ${todaysActions} acciones.`:"🎯 Aún no haces contactos hoy."}\n\nTe ayudo con: 🎯Pitch · 💬Objeciones · 💰Cotización · 📝WhatsApp · 📊Cartera\n\n¿Qué necesitas?`;
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
  const QA=[{label:"🎯 Pitch",m:"Prepárame un pitch corto para un cliente nuevo."},{label:"💬 Caro",m:"Me dicen caro. Dame el guión para responder."},{label:"💰 Cotización",m:"Arma cotización con mis precios para un restaurante."},{label:"📝 WhatsApp",m:"Mensaje de seguimiento para un cliente."},{label:"📊 Cartera",m:`Analiza: ${clients.length} en cartera, ${clients.filter(c=>c.status==="cliente").length} activos, ${clients.filter(c=>c.status==="nuevo").length} nuevos. ¿Qué hago?`},{label:"🔥 Motívame",m:"Estoy desmotivado. Necesito un empujón."}];
  const send=async c=>{const text=c||input;if(!text.trim()||busy)return;setInput("");const um={role:"user",content:text,ts:Date.now()};setMsgs(p=>[...p,um]);setBusy(true);
    try{const ctx=`VENDEDOR: ${userName}, racha ${streak.count}d, ${clients.length} en cartera, ${clients.filter(c=>c.status==="cliente").length} activos, ${clients.filter(c=>c.status==="nuevo").length} nuevos, ${routeClients.length} paradas hoy.\n${priceText?`PRECIOS:\n${priceText}`:"(Sin precios)"}`;
      const reply=await callAI(`Coach de ventas de ${fn}. Vendedor estrella chileno — directo, práctico. Chilenismos moderados.
PSICOLOGÍA: 1)VALIDA acciones 2)Racha ${streak.count}d 3)UNA acción concreta 4)Guiones EXACTOS 5)"${clients.filter(c=>c.status==="nuevo").length} sin contactar—otro vendedor puede llegar antes" 6)"Seguimiento en 48h = 3x más ventas"
Si tiene precios, úsalos. Si no, sugiere subirlos en 💰.
Max 200 palabras. Termina con 1 acción. ${ctx}`,[...msgs.filter((_,i)=>i>0),um].map(m=>({role:m.role,content:m.content})),1000);
      setMsgs(p=>[...p,{role:"assistant",content:reply,ts:Date.now()}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"Error. Intenta de nuevo.",ts:Date.now()}]);}setBusy(false);};
  return(<div style={{animation:"fadeIn 0.4s",display:"flex",flexDirection:"column",height:"calc(100vh - 160px)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}><div><h2 style={{fontSize:"20px",fontWeight:900}}>Agente de Ventas</h2><p style={{fontSize:"12px",color:"#64748b"}}>Tu coach personal</p></div><div style={{display:"flex",gap:"6px",alignItems:"center"}}>{msgs.length>1&&<button onClick={clearChat} style={{padding:"4px 8px",background:"#f1f5f9",border:"2px solid #e2e8f0",borderRadius:"6px",color:"#94a3b8",fontSize:"10px",fontWeight:600,cursor:"pointer"}}>🗑️ Limpiar</button>}<div style={{background:streak.count>=5?"linear-gradient(135deg,#ea580c,#dc2626)":"#fff7ed",padding:"6px 12px",borderRadius:"10px",border:streak.count>=5?"none":"2px solid #fed7aa",textAlign:"center"}}><div style={{fontSize:"16px",fontWeight:900,color:streak.count>=5?"#fff":"#ea580c"}}>🔥{streak.count}</div><div style={{fontSize:"9px",fontWeight:700,color:streak.count>=5?"rgba(255,255,255,0.8)":"#92400e"}}>RACHA</div></div></div></div>
    {msgs.length<=1&&<div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"10px"}}>{QA.map(q=><button key={q.label} onClick={()=>send(q.m)} style={{padding:"7px 10px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:"8px",color:"#475569",fontSize:"12px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>{q.label}</button>)}</div>}
    <div ref={ref} style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:"8px",paddingBottom:"6px"}}>{msgs.map((m,i)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%"}}><div style={{padding:"12px 14px",borderRadius:"14px",fontSize:"14px",lineHeight:1.7,whiteSpace:"pre-wrap",...(m.role==="user"?{background:"linear-gradient(135deg,#ea580c,#dc2626)",color:"#fff",borderBottomRightRadius:"4px"}:{background:"#fff",color:"#1e293b",border:"2px solid #e2e8f0",borderBottomLeftRadius:"4px"})}}>{m.content}</div></div>)}{busy&&<div style={{alignSelf:"flex-start",padding:"12px 14px",borderRadius:"14px",background:"#fff",border:"2px solid #e2e8f0"}}><span style={{color:"#94a3b8"}}>Pensando...</span></div>}</div>
    <div style={{display:"flex",gap:"8px",paddingTop:"8px",borderTop:"2px solid #e2e8f0"}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Pregúntame..." onKeyDown={e=>e.key==="Enter"&&send()} style={{...S.input,flex:1}} onFocus={e=>e.target.style.borderColor="#ea580c"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/><button onClick={()=>send()} disabled={busy} style={{padding:"12px 16px",background:busy?"#94a3b8":"linear-gradient(135deg,#ea580c,#dc2626)",border:"none",borderRadius:"12px",color:"#fff",fontWeight:900,fontSize:"18px",cursor:busy?"not-allowed":"pointer"}}>→</button></div>
  </div>);
}
