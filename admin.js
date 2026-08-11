/* =================== CBPI Admin Panel Logic =================== */

const LS_KEY = "cbpi_admin_v1";

const DEPT_BN = {
    administration:"প্রশাসন", civil:"সিভিল", computer:"কম্পিউটার",
    electrical:"ইলেকট্রিক্যাল", rac:"আরএসি", food:"ফুড", tourism:"ট্যুরিজম",
    nontech:"নন-টেক", office:"কর্মচারী", archive:"আর্কাইভ"
};

/* ---- Load built-in + local overrides ---- */
function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch(e){ return {}; }
}
function saveState(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }
let state = loadState();
let added = Array.isArray(state.added) ? state.added : [];
let edits = state.edits || {}; // id -> patch object
let archived = new Set(state.archived || []);
let nextId = state.nextId || 10000;

/* ---- Merge & prepare ---- */
function contactId(c){ return c.id || ("builtin:"+c.sl); }
function merged() {
    const all = (window.CONTACTS||[]).slice();
    added.forEach(c=>all.push(c));
    return all.map(c=>{
        c = Object.assign({}, c);
        const id = contactId(c);
        if (edits[id]) Object.assign(c, edits[id]);
        if (archived.has(id)) c.archived = true;
        c._id = id;
        c._isLocal = !!(c.id && c.id.startsWith("local:"));
        return c;
    });
}
function persist() {
    saveState({added, edits, archived:Array.from(archived), nextId});
}
function recompute() {
    renderStats(); renderManage();
}

/* ---- Image compression ---- */
function compressImage(file, maxSize=220, quality=0.82){
    return new Promise(res=>{
        const r=new FileReader();
        r.onload=e=>{
            const img=new Image();
            img.onload=()=>{
                let w=img.width,h=img.height;
                if(w>h){ if(w>maxSize){h*=maxSize/w;w=maxSize;} }
                else { if(h>maxSize){w*=maxSize/h;h=maxSize;} }
                const c=document.createElement("canvas");c.width=w;c.height=h;
                c.getContext("2d").drawImage(img,0,0,w,h);
                res(c.toDataURL("image/jpeg",quality));
            };
            img.onerror=()=>res("");
            img.src=e.target.result;
        };
        r.onerror=()=>res("");
        r.readAsDataURL(file);
    });
}

/* ---- Tabs ---- */
document.querySelectorAll(".admin-tabs button").forEach(b=>{
    b.addEventListener("click",()=>switchTab(b.dataset.tab));
});
function switchTab(t){
    document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===t));
    document.querySelectorAll(".pane").forEach(p=>p.style.display=(p.dataset.pane===t?"block":"none"));
    if(t==="manage") renderManage();
    if(t==="download") renderDlStats();
    if(t==="dashboard") renderStats();
}

/* ---- Stats ---- */
function renderStats() {
    const list = merged();
    const active = list.filter(c=>!c.archived).length;
    const arch = list.filter(c=>c.archived).length;
    const local = added.length;
    document.getElementById("stats").innerHTML = `
        <div class="stat"><b>${list.length}</b><span>মোট কন্টাক্ট</span></div>
        <div class="stat"><b>${active}</b><span>সক্রিয়</span></div>
        <div class="stat"><b>${arch}</b><span>আর্কাইভ</span></div>
    `;
}

/* ---- Add form ---- */
const fCat=document.getElementById("f_cat"), fDept=document.getElementById("f_dept"), fDesig=document.getElementById("f_desig");
fCat.addEventListener("change",()=>{
    if(fCat.value==="administration"){ fDept.value="administration"; }
    else if(fDept.value==="administration"){ fDept.value="office"; }
});
const fImg=document.getElementById("f_img");
fImg.addEventListener("change",async()=>{
    const prev=document.getElementById("f_preview");
    if(!fImg.files[0]){prev.style.display="none";prev.innerHTML="";return;}
    const data=await compressImage(fImg.files[0]);
    fImg._data=data;
    prev.style.display="flex";
    prev.innerHTML=`<img class="preview-img" src="${data}"><span>ছবি প্রিভিউ — 220px-এ কমানো হয়েছে</span>`;
});
document.getElementById("addForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const bn_name=fd.get("bn_name").trim();
    const name=(fd.get("name")||"").trim();
    const category=fd.get("category");
    const dept_key=fd.get("dept_key");
    const bn_designation=fd.get("bn_designation");
    const mobile=sanitizePhone(fd.get("mobile"));
    const email=(fd.get("email")||"").trim();
    let image="";
    if(fImg.files[0]) image=fImg._data||"";

    const deptLabel = dept_key==="administration"?"প্রশাসন"
        :dept_key==="office"?"অফিস"
        :(DEPT_BN[dept_key]||dept_key)+" টেকনোলজি";

    // Auto-rank via same logic as app (app.js will recompute on load anyway; just for sorting here)
    const id="local:"+(++nextId);
    const c={
        id, sl:nextId, category, bn_name, name,
        bn_designation, designation:"",
        department: deptLabel, dept_key,
        mobile, email, image
    };
    added.push(c);
    persist();
    recompute();
    e.target.reset();
    document.getElementById("f_preview").style.display="none";
    document.getElementById("f_preview").innerHTML="";
    fImg._data="";
    toast("কন্টাক্ট যোগ হয়েছে ✅ — এখন data.js ট্যাব থেকে ডাউনলোড করুন");
    switchTab("manage");
});

/* ---- Manage ---- */
const mSearch=document.getElementById("m_search");
mSearch.addEventListener("input",renderManage);
document.getElementById("m_showActive").addEventListener("change",renderManage);
document.getElementById("m_showArch").addEventListener("change",renderManage);

function renderManage(){
    const tb=document.getElementById("m_tbody");
    if(!tb) return;
    const q=mSearch.value.trim().toLowerCase();
    const showA=document.getElementById("m_showActive").checked;
    const showR=document.getElementById("m_showArch").checked;
    let list=merged();
    list=list.filter(c=>{
        if(c.archived && !showR) return false;
        if(!c.archived && !showA) return false;
        if(!q) return true;
        const hay=[c.name,c.bn_name,c.bn_designation,c.department,c.mobile,c.email].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
    });
    // sort by dept then name
    const order_=["administration","civil","computer","electrical","rac","food","tourism","nontech","office"];
    list.sort((a,b)=>{
        const ag=a.archived?1:0,bg=b.archived?1:0;
        if(ag!==bg)return ag-bg;
        const ai=order_.indexOf(a.dept_key||"office"), bi=order_.indexOf(b.dept_key||"office");
        if(ai!==bi)return (ai===-1?99:ai)-(bi===-1?99:bi);
        return (a.bn_name||"").localeCompare(b.bn_name||"");
    });
    tb.innerHTML=list.map(c=>{
        const nm=c.bn_name||c.name||"?";
        const ini=(nm||"?").charAt(0);
        const color=colorFor(nm);
        const imgHtml=c.image?`<img src="${c.image}" alt="">`:`<span style="font-weight:700">${ini}</span>`;
        const archBtn = c.archived
            ? `<button class="btn btn-sm btn-success" onclick="toggleArch('${c._id}')"><i class="fa-solid fa-rotate-left"></i> ফিরিয়ে আনুন</button>`
            : `<button class="btn btn-sm btn-warn" onclick="toggleArch('${c._id}')"><i class="fa-solid fa-box-archive"></i> আর্কাইভ</button>`;
        const delBtn = c._isLocal
            ? `<button class="btn btn-sm btn-danger" onclick="deleteLocal('${c._id}')"><i class="fa-solid fa-trash"></i></button>`
            : "";
        const editBtn = `<button class="btn btn-sm btn-secondary" onclick="openEdit('${c._id}')"><i class="fa-solid fa-pen"></i></button>`;
        return `<tr class="${c.archived?'archived-row':''}">
            <td style="width:44px"><span class="mini-avatar" style="background:${color}22;color:${color}">${imgHtml}</span></td>
            <td>
                <div class="info">
                    <h4>${escape(nm)}${c._isLocal?' <span class="tag tag-local">নতুন</span>':''} ${c.archived?' <span class="tag tag-archived">আর্কাইভ</span>':''}</h4>
                    <small>${escape(c.bn_designation||"")} · ${escape(DEPT_BN[c.dept_key]||c.dept_key||"")}</small>
                </div>
                <div class="edit-form" id="ef_${cssId(c._id)}"></div>
            </td>
            <td><small>${escape(c.mobile||"—")}</small></td>
            <td style="text-align:right; white-space:nowrap">
                ${editBtn} ${archBtn} ${delBtn}
            </td>
        </tr>`;
    }).join("");
}
function cssId(s){return s.replace(/[^a-zA-Z0-9_-]/g,'_');}

function toggleArch(id){
    if(archived.has(id)) archived.delete(id); else archived.add(id);
    persist(); recompute();
    toast(archived.has(id)?"আর্কাইভ করা হয়েছে":"ফিরিয়ে আনা হয়েছে");
}
function deleteLocal(id){
    if(!confirm("স্থায়ীভাবে মুছে ফেলবেন?")) return;
    added=added.filter(c=>contactId(c)!==id);
    delete edits[id];
    archived.delete(id);
    persist(); recompute();
    toast("মুছে ফেলা হয়েছে");
}
function openEdit(id){
    const all=merged();
    const c=all.find(x=>x._id===id);
    if(!c) return;
    const box=document.getElementById("ef_"+cssId(id));
    if(box.classList.contains("open")){box.classList.remove("open");box.innerHTML="";return;}
    // Close other open editors
    document.querySelectorAll(".edit-form.open").forEach(e=>{e.classList.remove("open");e.innerHTML="";});
    box.classList.add("open");
    box.innerHTML=`
      <div class="form-row">
        <label>নাম (বাংলা)<input id="e_bn" value="${attr(c.bn_name||"")}"></label>
        <label>নাম (ইংরেজি)<input id="e_en" value="${attr(c.name||"")}"></label>
      </div>
      <div class="form-row">
        <label>পদবি<input id="e_des" value="${attr(c.bn_designation||"")}"></label>
        <label>মোবাইল<input id="e_mob" value="${attr(c.mobile||"")}"></label>
      </div>
      <div class="form-row">
        <label>ইমেইল<input id="e_email" value="${attr(c.email||"")}"></label>
        <label>বিভাগ
          <select id="e_dept">
            ${Object.keys(DEPT_BN).filter(k=>k!=="archive").map(k=>`<option value="${k}" ${k===c.dept_key?"selected":""}>${DEPT_BN[k]}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="row-actions">
        <button class="btn btn-sm btn-secondary" onclick="closeEdit('${cssId(id)}')">বাতিল</button>
        <button class="btn btn-sm btn-primary" onclick="saveEdit('${id}')"><i class="fa-solid fa-check"></i> সেভ</button>
      </div>
    `;
}
function closeEdit(cid){
    const box=document.getElementById("ef_"+cid);
    if(box){box.classList.remove("open");box.innerHTML="";}
}
function saveEdit(id){
    const box=document.getElementById("ef_"+cssId(id));
    if(!box) return;
    const patch = {
        bn_name: val("e_bn"),
        name: val("e_en"),
        bn_designation: val("e_des"),
        mobile: sanitizePhone(val("e_mob")),
        email: val("e_email"),
        dept_key: document.getElementById("e_dept").value
    };
    if(patch.dept_key==="administration") patch.category="administration";
    else if(edits[id] && edits[id].category && patch.dept_key!=="administration") patch.category = (patch.dept_key==="office"?"staff":"teacher");
    // Save
    if(id.startsWith("local:")){
        const c=added.find(x=>contactId(x)===id);
        if(c) Object.assign(c,patch);
    } else {
        edits[id]=Object.assign(edits[id]||{},patch);
    }
    persist(); recompute();
    toast("সেভ হয়েছে ✅ — data.js ডাউনলোড করতে ভুলবেন না");
}
function val(id){return (document.getElementById(id).value||"").trim();}

/* ---- Download data.js ---- */
function renderDlStats(){
    const list=merged();
    const active=list.filter(c=>!c.archived).length;
    const arch=list.filter(c=>c.archived).length;
    document.getElementById("dl_stats").innerHTML=`
        <div class="stat"><b>${list.length}</b><span>মোট</span></div>
        <div class="stat"><b>${active}</b><span>সক্রিয়</span></div>
        <div class="stat"><b>${arch}</b><span>আর্কাইভ</span></div>
    `;
}
function buildDataJS(){
    // Merge fully into final contact list (built-in + added + edits) with archived flag set
    const list = merged().map(c=>{
        const o={
            sl:c.sl, category:c.category,
            bn_name:c.bn_name, name:c.name||"",
            bn_designation:c.bn_designation||"", designation:c.designation||"",
            department:c.department||"", dept_key:c.dept_key||"office",
            mobile:c.mobile||"", email:c.email||"",
            image:c.image||""
        };
        if(c.archived) o.archived=true;
        return o;
    });
    // Sort by sl to keep things stable but admins/teachers/staff roughly ordered
    const grpOrder={administration:0,civil:1,computer:2,electrical:3,rac:4,food:5,tourism:6,nontech:7,office:8};
    list.sort((a,b)=>{
        // archived last
        const aa=a.archived?1:0,bb=b.archived?1:0;
        if(aa!==bb)return aa-bb;
        const ga=grpOrder[a.dept_key]??99,gb=grpOrder[b.dept_key]??99;
        if(ga!==gb)return ga-gb;
        return (a.sl||0)-(b.sl||0);
    });
    const header=`// CBPI Contact Data
// Generated: ${new Date().toLocaleString("bn-BD")}
// প্রতিটি এন্ট্রিতে: sl, category(teacher|staff|administration), bn_name, name, bn_designation, designation, department, dept_key, mobile, email, image, archived(true/false)
window.CONTACTS = `;
    return header + JSON.stringify(list, null, 2) + ";\n";
}
function downloadData(){
    const txt=buildDataJS();
    const blob=new Blob([txt],{type:"text/javascript;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const d=new Date();
    const stamp=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    a.href=url; a.download=`data.js`;
    a.title=`CBPI data.js (${stamp})`;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},100);
    toast("data.js ডাউনলোড শুরু হয়েছে — পুরনো data.js রিপ্লেস করুন তারপর push.bat চাপুন");
}
function exportJSON(){
    const data={added,edits,archived:Array.from(archived),nextId,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="cbpi-admin-backup.json";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},100);
}
document.getElementById("impFile").addEventListener("change",async e=>{
    const f=e.target.files[0]; if(!f) return;
    try{
        const t=await f.text(); const d=JSON.parse(t);
        if(!confirm("ইমপোর্ট করবেন? বর্তমান স্থানীয় পরিবর্তন মার্জ হবে।")) return;
        if(Array.isArray(d.added)){
            const ids=new Set(added.map(contactId));
            d.added.forEach(c=>{ if(!ids.has(contactId(c))) added.push(c); });
        }
        if(d.edits) Object.assign(edits,d.edits);
        if(Array.isArray(d.archived)) d.archived.forEach(id=>archived.add(id));
        if(d.nextId && d.nextId>nextId) nextId=d.nextId;
        persist(); recompute();
        toast("ইমপোর্ট সফল ✅");
    }catch(err){alert("ফাইলটি সঠিক নয়: "+err.message);}
    e.target.value="";
});
function resetSession(){
    if(!confirm("সব স্থানীয় পরিবর্তন মুছে ফেলবেন? (এটা শুধু আপনার ব্রাউজার থেকে মুছবে — data.js ফাইল বা গিট কিছুই পরিবর্তন করবে না)")) return;
    added=[];edits={};archived=new Set();nextId=10000;
    persist(); recompute();
    toast("রিসেট করা হয়েছে");
}

/* ---- Helpers ---- */
function sanitizePhone(p){
    if(!p)return"";
    let s=String(p).replace(/\D/g,"");
    if(s.startsWith("880"))s="0"+s.slice(3);
    if(!s.startsWith("0"))s="0"+s;
    return s;
}
function escape(s){return String(s||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function attr(s){return escape(s).replace(/"/g,"&quot;");}
function colorFor(name){
    const pal=["#009578","#1565c0","#c2185b","#f57c00","#00838f","#ad1457","#2e7d32","#6a1b9a","#5d4037","#455a64","#e53935","#00acc1"];
    let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
    return pal[h%pal.length];
}
function toast(msg){
    let t=document.getElementById("__toast");
    if(!t){
        t=document.createElement("div");t.id="__toast";
        t.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#222;color:#fff;padding:10px 18px;border-radius:22px;font-size:.85rem;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25);opacity:0;transition:opacity .25s,transform .25;font-family:inherit;max-width:90%;text-align:center;";
        document.body.appendChild(t);
    }
    t.textContent=msg;
    requestAnimationFrame(()=>{t.style.opacity="1";t.style.transform="translateX(-50%) translateY(0)";});
    setTimeout(()=>{t.style.opacity="0";t.style.transform="translateX(-50%) translateY(20px)";},2500);
}

/* ---- Init ---- */
renderStats();
