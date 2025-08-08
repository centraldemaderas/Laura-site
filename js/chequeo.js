// Chequeo PHQ-9 + GAD-7 — Vanilla JS + envío a Netlify Function (Blobs)
(function(){
  const $ = (sel, ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

  const OPTIONS = [
    { value:0, label:"Nunca" },
    { value:1, label:"Varios días" },
    { value:2, label:"Más de la mitad de los días" },
    { value:3, label:"Casi todos los días" },
  ];

  const PHQ9 = {
    id:"phq9",
    title:"Chequeo de estado de ánimo (PHQ-9)",
    description:"Evalúa síntomas depresivos en las últimas 2 semanas. Resultado orientativo.",
    questions:[
      "Poco interés o placer en hacer cosas.",
      "Sentirse desanimado/a, deprimido/a o sin esperanza.",
      "Dificultad para dormir o dormir demasiado.",
      "Sentirse cansado/a o con poca energía.",
      "Falta de apetito o comer en exceso.",
      "Sentirse mal consigo mismo/a; sentirse un fracaso o que decepcionó a su familia.",
      "Dificultad para concentrarse (leer, TV).",
      "Moverse o hablar muy lento, o lo contrario: inquietud notable.",
      "Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera."
    ],
    ranges:[
      {min:0,max:4,label:"Mínima"},
      {min:5,max:9,label:"Leve"},
      {min:10,max:14,label:"Moderada"},
      {min:15,max:19,label:"Moderadamente Severa"},
      {min:20,max:27,label:"Severa"},
    ],
    recommend(score){
      if(score>=20) return "Sugerimos agendar una cita cuanto antes y evaluar apoyo adicional.";
      if(score>=15) return "Recomendable iniciar proceso terapéutico con seguimiento cercano.";
      if(score>=10) return "Útil comenzar terapia; revisemos hábitos y red de apoyo.";
      if(score>=5)  return "Pueden ayudar estrategias de autoayuda y sesiones breves.";
      return "Mantén hábitos de autocuidado; si notas cambios, considera una consulta.";
    }
  };

  const GAD7 = {
    id:"gad7",
    title:"Chequeo de ansiedad (GAD-7)",
    description:"Evalúa síntomas de ansiedad en las últimas 2 semanas. Resultado orientativo.",
    questions:[
      "Sentirse nervioso/a, ansioso/a o al límite.",
      "No poder dejar de preocuparse o controlar la preocupación.",
      "Preocuparse demasiado por diferentes cosas.",
      "Dificultad para relajarse.",
      "Estar tan inquieto/a que es difícil permanecer quieto/a.",
      "Irritarse o enojarse con facilidad.",
      "Sentir miedo como si algo terrible fuera a pasar."
    ],
    ranges:[
      {min:0,max:4,label:"Mínima"},
      {min:5,max:9,label:"Leve"},
      {min:10,max:14,label:"Moderada"},
      {min:15,max:21,label:"Severa"},
    ],
    recommend(score){
      if(score>=15) return "Sugerimos agendar una cita cuanto antes; trabajaremos técnicas para regular la ansiedad.";
      if(score>=10) return "Recomendable iniciar terapia; combinaremos psicoeducación y práctica guiada.";
      if(score>=5)  return "Ejercicios breves y acompañamiento podrían ayudarte; considera sesiones.";
      return "Sigue cuidando tu bienestar; monitorea cambios y busca apoyo si lo necesitas.";
    }
  };

  // Estado
  let mode = "menu"; let stepIndex = 0; let answers = {}; let scores = {};
  const menu = $("#lgw-menu"), assessment = $("#lgw-assessment"), result = $("#lgw-result");
  const consentEl = $("#lgw-consent"), nameEl=$("#lgw-name"), emailEl=$("#lgw-email");

  $$(".btn[data-start]").forEach(btn=>btn.addEventListener("click",()=>start(btn.dataset.start)));

  function start(selected){ mode=selected; stepIndex=0; answers={}; scores={}; menu.classList.add("hidden"); renderAssessment(currentDef()); }
  function currentDef(){ if(mode==="phq9"||(mode==="both"&&stepIndex===0)) return PHQ9; if(mode==="gad7"||(mode==="both"&&stepIndex===1)) return GAD7; return null; }

  function renderAssessment(def){
    if(!def) return;
    assessment.innerHTML=""; assessment.className="card";

    const h2=document.createElement("h2"); h2.textContent=def.title; assessment.appendChild(h2);
    const p=document.createElement("p"); p.className="small muted"; p.textContent=def.description; assessment.appendChild(p);

    const ol=document.createElement("ol"); ol.className="grid"; assessment.appendChild(ol);
    def.questions.forEach((text,i)=>{
      const fs=document.createElement("fieldset"); fs.className="q";
      const lg=document.createElement("legend"); lg.textContent=(i+1)+". "+text; fs.appendChild(lg);
      const grid=document.createElement("div"); grid.className="grid"; grid.style.gridTemplateColumns="repeat(2,1fr)"; fs.appendChild(grid);
      [0,1,2,3].forEach(v=>{
        const opt=OPTIONS[v], lab=document.createElement("label"); lab.className="opt"; lab.dataset.checked="0";
        const r=document.createElement("input"); r.type="radio"; r.name=`q_${def.id}_${i}`; r.value=String(opt.value);
        r.addEventListener("change",()=>{ lab.dataset.checked="1"; answers[`${def.id}_${i}`]=opt.value; updateProgress(def); });
        const span=document.createElement("span"); span.textContent=opt.label; lab.appendChild(r); lab.appendChild(span); grid.appendChild(lab);
      });
      ol.appendChild(fs);
    });

    const row=document.createElement("div"); row.className="row"; row.style.marginTop="12px"; assessment.appendChild(row);
    const progress=document.createElement("div"); progress.className="small muted"; progress.textContent=`Progreso: 0/${def.questions.length}`; row.appendChild(progress);
    row.appendChild(document.createElement("div")).style.flex="1";
    const btn=document.createElement("button"); btn.className="btn btn-primary"; btn.textContent=(mode==="both"&&stepIndex===0)?"Continuar con el siguiente":"Ver resultados";
    btn.disabled=true; btn.addEventListener("click",()=>submit(def)); row.appendChild(btn);

    const note=document.createElement("p"); note.className="small muted"; note.style.marginTop="8px";
    note.textContent=def.id==="phq9"?"Si marcaste cualquier nivel en la última pregunta (ideas de hacerte daño), busca ayuda inmediata.":"Si te sientes en riesgo o fuera de control, busca apoyo inmediato.";
    assessment.appendChild(note);

    function updateProgress(d){
      const done=Object.keys(answers).filter(k=>k.startsWith(d.id+"_")).length;
      progress.textContent=`Progreso: ${done}/${d.questions.length}`; btn.disabled = done !== d.questions.length;
    }
  }

  async function submit(def){
    let s=0; for(let i=0;i<def.questions.length;i++){ s += Number(answers[`${def.id}_${i}`]||0); }
    scores[def.id]=s;

    if(consentEl.checked){ try{ const key = `lgw_result_${def.id}_${Date.now()}`; localStorage.setItem(key, JSON.stringify({id:def.id, score:s})); }catch{} }

    if(mode==="both" && stepIndex===0){ stepIndex=1; answers={}; renderAssessment(currentDef()); return; }
    renderResult(); await sendToServer();
  }

  function severity(score, ranges){ const r=ranges.find(x=>score>=x.min && score<=x.max); return r?r.label:"N/A"; }

  function renderResult(){
    assessment.classList.add("hidden"); result.className="card"; result.innerHTML = "<h2 style='margin-top:0'>Tus resultados</h2>";
    function block(def){
      const score=scores[def.id], label=severity(score,def.ranges);
      const div=document.createElement("div"); div.className="q";
      div.innerHTML = `<div class="row" style="justify-content:space-between;align-items:center">
        <b>${def.id.toUpperCase()}</b><span style="color:var(--brand-gold);font-weight:700;font-size:18px">${score}</span></div>
        <div class="small" style="margin-top:4px">Severidad: <b>${label}</b></div>
        <p style="margin-top:6px">${def.recommend(score)}</p>`;
      result.appendChild(div);
    }
    if(typeof scores.phq9==="number") block(PHQ9);
    if(typeof scores.gad7==="number") block(GAD7);

    const btns=document.createElement("div"); btns.className="row"; btns.style.marginTop="12px";
    const back=document.createElement("button"); back.className="btn btn-ghost"; back.textContent="Volver al inicio";
    back.onclick=()=>{ mode="menu"; answers={}; scores={}; result.classList.add("hidden"); menu.classList.remove("hidden"); };
    const reservar=document.createElement("a"); reservar.href="/reserva.html"; reservar.className="btn btn-primary"; reservar.textContent="Reservar una sesión";
    const save=document.createElement("button"); save.className="btn btn-ghost"; save.textContent="Descargar .txt";
    save.onclick=()=>{ try{ const payload={ phq9:scores.phq9, gad7:scores.gad7, ts:new Date().toISOString() };
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"text/plain"}); const url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download="resultado-chequeo.txt"; a.click(); URL.revokeObjectURL(url);}catch{} };
    btns.appendChild(back); btns.appendChild(reservar); btns.appendChild(save); result.appendChild(btns);

    const disclaimer=document.createElement("div"); disclaimer.className="small muted"; disclaimer.style.marginTop="8px";
    disclaimer.innerHTML="Este resultado es orientativo y no reemplaza una valoración clínica. Si te sientes en riesgo, busca ayuda inmediata.";
    result.appendChild(disclaimer);
  }

  async function sendToServer(){
    try{
      const payload = {
        name: (nameEl && nameEl.value || "").trim(),
        email: (emailEl && emailEl.value || "").trim(),
        phq9: (typeof scores.phq9==="number") ? scores.phq9 : null,
        gad7: (typeof scores.gad7==="number") ? scores.gad7 : null,
        phq9Severity: (typeof scores.phq9==="number") ? severity(scores.phq9, PHQ9.ranges) : null,
        gad7Severity: (typeof scores.gad7==="number") ? severity(scores.gad7, GAD7.ranges) : null,
        riskFlag: (typeof scores.phq9==="number") ? (Number(answers["phq9_8"]||0) > 0) : false, // P9 > 0
        ua: navigator.userAgent, path: location.pathname, ts: new Date().toISOString()
      };
      await fetch("/.netlify/functions/quiz-create", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
    }catch(e){ console.warn("No se pudo registrar en el servidor (modo offline):", e); }
  }
})();

// Laura Giraldo — PHQ-9 + GAD-7 wizard (vanilla JS)
(function(){
  const $ = (sel, ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

  const OPTIONS = [
    { value:0, label:"Nunca" },
    { value:1, label:"Varios días" },
    { value:2, label:"Más de la mitad de los días" },
    { value:3, label:"Casi todos los días" },
  ];

  const PHQ9 = {
    id:"phq9",
    title:"Chequeo de estado de ánimo (PHQ‑9)",
    description:"Evalúa síntomas depresivos en las últimas 2 semanas. Resultado orientativo.",
    questions:[
      "Poco interés o placer en hacer cosas.",
      "Sentirse desanimado/a, deprimido/a o sin esperanza.",
      "Dificultad para dormir o dormir demasiado.",
      "Sentirse cansado/a o con poca energía.",
      "Falta de apetito o comer en exceso.",
      "Sentirse mal consigo mismo/a; sentirse un fracaso o que decepcionó a su familia.",
      "Dificultad para concentrarse (leer, TV).",
      "Moverse o hablar muy lento, o lo contrario: inquietud notable.",
      "Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera."
    ],
    ranges:[
      {min:0,max:4,label:"Mínima"},
      {min:5,max:9,label:"Leve"},
      {min:10,max:14,label:"Moderada"},
      {min:15,max:19,label:"Moderadamente Severa"},
      {min:20,max:27,label:"Severa"},
    ],
    recommend(score){
      if(score>=20) return "Sugerimos agendar una cita cuanto antes y evaluar apoyo adicional.";
      if(score>=15) return "Recomendable iniciar proceso terapéutico con seguimiento cercano.";
      if(score>=10) return "Útil comenzar terapia; revisemos hábitos y red de apoyo.";
      if(score>=5)  return "Pueden ayudar estrategias de autoayuda y sesiones breves.";
      return "Mantén hábitos de autocuidado; si notas cambios, considera una consulta.";
    }
  };

  const GAD7 = {
    id:"gad7",
    title:"Chequeo de ansiedad (GAD‑7)",
    description:"Evalúa síntomas de ansiedad en las últimas 2 semanas. Resultado orientativo.",
    questions:[
      "Sentirse nervioso/a, ansioso/a o al límite.",
      "No poder dejar de preocuparse o controlar la preocupación.",
      "Preocuparse demasiado por diferentes cosas.",
      "Dificultad para relajarse.",
      "Estar tan inquieto/a que es difícil permanecer quieto/a.",
      "Irritarse o enojarse con facilidad.",
      "Sentir miedo como si algo terrible fuera a pasar."
    ],
    ranges:[
      {min:0,max:4,label:"Mínima"},
      {min:5,max:9,label:"Leve"},
      {min:10,max:14,label:"Moderada"},
      {min:15,max:21,label:"Severa"},
    ],
    recommend(score){
      if(score>=15) return "Sugerimos agendar una cita cuanto antes; trabajaremos técnicas para regular la ansiedad.";
      if(score>=10) return "Recomendable iniciar terapia; combinaremos psicoeducación y práctica guiada.";
      if(score>=5)  return "Las rutinas de autocuidado y ejercicios breves podrían ayudarte; considera sesiones de acompañamiento.";
      return "Sigue cuidando tu bienestar; monitorea cambios y busca apoyo si lo necesitas.";
    }
  };

  // State
  let mode = "menu"; // menu | phq9 | gad7 | both | result
  let stepIndex = 0;
  let answers = {};
  let scores = {};

  const menu = $("#lgw-menu");
  const assessment = $("#lgw-assessment");
  const result = $("#lgw-result");
  const consentEl = $("#lgw-consent");

  $$(".btn[data-start]").forEach(btn=>btn.addEventListener("click",()=>start(btn.dataset.start)));

  function start(selected){
    mode = selected; stepIndex = 0; answers = {}; scores = {};
    menu.classList.add("hidden");
    renderAssessment(currentDef());
  }

  function currentDef(){
    if(mode==="phq9" || (mode==="both" && stepIndex===0)) return PHQ9;
    if(mode==="gad7" || (mode==="both" && stepIndex===1)) return GAD7;
    return null;
  }

  function renderAssessment(def){
    if(!def){return}
    assessment.innerHTML = "";
    assessment.className = "";
    assessment.classList.add("lgw-card","mt-4");

    const h2 = document.createElement("h2"); h2.textContent = def.title; assessment.appendChild(h2);
    const p  = document.createElement("p"); p.className="small lgw-muted"; p.textContent = def.description; assessment.appendChild(p);

    const ol = document.createElement("ol"); ol.className="lgw-grid mt-3"; assessment.appendChild(ol);

    def.questions.forEach((text,i)=>{
      const fs = document.createElement("fieldset"); fs.className="q";
      const lg = document.createElement("legend"); lg.textContent = (i+1)+". "+text; fs.appendChild(lg);

      const grid = document.createElement("div"); grid.className="lgw-grid lgw-grid-2 mt-2"; fs.appendChild(grid);
      OPTIONS.forEach(opt=>{
        const lab = document.createElement("label"); lab.className="opt"; lab.dataset.checked="0";
        const r = document.createElement("input"); r.type="radio"; r.name="q_"+def.id+"_"+i; r.value=String(opt.value);
        r.addEventListener("change",()=>{ lab.dataset.checked="1"; answers[def.id+"_"+i]=opt.value; updateProgress(def); });
        const span = document.createElement("span"); span.textContent = opt.label;
        lab.appendChild(r); lab.appendChild(span); grid.appendChild(lab);
      });
      ol.appendChild(fs);
    });

    const row = document.createElement("div"); row.className="row mt-4"; assessment.appendChild(row);
    const progress = document.createElement("div"); progress.className="small lgw-muted"; progress.textContent="Progreso: 0/"+def.questions.length; row.appendChild(progress);
    row.appendChild(document.createElement("div")).style.flex="1";
    const btn = document.createElement("button"); btn.className="btn btn-primary"; btn.textContent = (mode==="both" && stepIndex===0) ? "Continuar con el siguiente" : "Ver resultados";
    btn.disabled = true;
    btn.addEventListener("click",()=>submit(def));
    row.appendChild(btn);

    const note = document.createElement("p"); note.className="small lgw-muted mt-3";
    note.textContent = def.id==="phq9" ? "Si marcaste cualquier nivel en la última pregunta (ideas de hacerte daño), busca ayuda inmediata." : "Si te sientes en riesgo o fuera de control, busca apoyo inmediato.";
    assessment.appendChild(note);

    function updateProgress(d){
      const done = Object.keys(answers).filter(k=>k.startsWith(d.id+"_")).length;
      progress.textContent = "Progreso: "+done+"/"+d.questions.length;
      btn.disabled = done !== d.questions.length;
    }
  }

  function submit(def){
    // score
    let s = 0; for(let i=0;i<def.questions.length;i++){ s += Number(answers[def.id+"_"+i]||0); }
    scores[def.id] = s;

    // Store (optional, local only)
    if(consentEl.checked){
      try{
        const key = `lgw_result_${def.id}_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify({id:def.id, score:s}));
      }catch{}
    }

    if(mode==="both" && stepIndex===0){
      stepIndex = 1; answers = {}; renderAssessment(currentDef()); return;
    }

    // show result
    renderResult();
  }

  function renderResult(){
    assessment.classList.add("hidden");
    result.className=""; result.classList.add("lgw-card","mt-4");
    result.innerHTML = "<h2 style='margin-top:0'>Tus resultados</h2>";

    function block(def){
      const score = scores[def.id];
      const range = def.ranges.find(r=>score>=r.min && score<=r.max);
      const div = document.createElement("div"); div.className="q";
      div.innerHTML = `<div class="row" style="justify-content:space-between;align-items:center">
        <b>${def.id.toUpperCase()}</b>
        <span style="color:var(--brand-gold);font-weight:700;font-size:18px">${score}</span>
      </div>
      <div class="mt-1 small">Severidad: <b>${range?range.label:"N/A"}</b></div>
      <p class="mt-2">${def.recommend(score)}</p>`;
      result.appendChild(div);
    }

    if(typeof scores.phq9 === "number") block(PHQ9);
    if(typeof scores.gad7 === "number") block(GAD7);

    const btns = document.createElement("div"); btns.className="row mt-4";
    const back = document.createElement("button"); back.className="btn btn-ghost"; back.textContent="Volver al inicio";
    back.onclick = ()=>{ mode="menu"; answers={}; scores={}; result.classList.add("hidden"); menu.classList.remove("hidden"); };
    const reservar = document.createElement("a"); reservar.href="/reserva"; reservar.className="btn btn-primary"; reservar.textContent="Reservar una sesión";
    const save = document.createElement("button"); save.className="btn btn-ghost"; save.textContent="Descargar .txt";
    save.onclick=()=>{
      try{
        const payload = { phq9: scores.phq9, gad7: scores.gad7, ts:new Date().toISOString() };
        const blob = new Blob([JSON.stringify(payload,null,2)], {type:"text/plain"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href=url; a.download="resultado-chequeo.txt"; a.click(); URL.revokeObjectURL(url);
      }catch{}
    };
    btns.appendChild(back); btns.appendChild(reservar); btns.appendChild(save);
    result.appendChild(btns);

    const disclaimer = document.createElement("div"); disclaimer.className="small lgw-muted mt-4";
    disclaimer.innerHTML = "Este resultado es orientativo y no reemplaza una valoración clínica. Si marcaste ideas de dañarte o te sientes en riesgo, busca ayuda inmediata.";
    result.appendChild(disclaimer);
  }

})();