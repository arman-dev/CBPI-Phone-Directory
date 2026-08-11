/* ===================================================
   CBPI Phone Directory – Public App Logic
   Loads contacts from window.CONTACTS (defined in data.js)
   =================================================== */

const DEPTS = {
    all:            { bn: "সকল",       icon: "fa-layer-group", color: "#009578" },
    administration: { bn: "প্রশাসন",    icon: "fa-building",    color: "#c2185b" },
    civil:          { bn: "সিভিল",      icon: "fa-road",        color: "#5d4037" },
    computer:       { bn: "কম্পিউটার",  icon: "fa-microchip",   color: "#1565c0" },
    electrical:     { bn: "ইলেকট্রিক্যাল", icon: "fa-bolt",     color: "#f57c00" },
    rac:            { bn: "আরএসি",      icon: "fa-snowflake",   color: "#00838f" },
    food:           { bn: "ফুড",        icon: "fa-utensils",    color: "#ad1457" },
    tourism:        { bn: "ট্যুরিজম",   icon: "fa-plane",       color: "#2e7d32" },
    nontech:        { bn: "নন-টেক",     icon: "fa-book",        color: "#6a1b9a" },
    office:         { bn: "কর্মচারী",   icon: "fa-briefcase",   color: "#455a64" },
    archive:        { bn: "আর্কাইভ",    icon: "fa-box-archive", color: "#616161" }
};
const TAB_ORDER = ["all","administration","civil","computer","electrical","rac","food","tourism","nontech","office","archive"];

/* ---------- Normalise contacts ---------- */
function rankOf(c) {
    if (typeof c.sort_rank === "number") return c.sort_rank;
    const d = ((c.bn_designation||"") + " " + (c.designation||""));
    if (c.category === "administration") {
        if (/অধ্যক্ষ|Principal/.test(d)) return 10;
        if (/উপাধ্যক্ষ|Vice/.test(d)) return 20;
        if (/রেজিস্ট্রার|Registrar/.test(d)) return 30;
        return 25;
    }
    if (/বিভাগীয় প্রধান|চিফ ইনস|Chief Instructor/i.test(d)) return 40;
    if (/ওয়ার্কশপ সুপার|Workshop/i.test(d)) return 45;
    if (/ফিজিক্যাল|Physical/i.test(d)) return 55;
    if (/ল্যাবরেটরি সহকারী|ল্যাব সহকারী|Laboratory|Lab Assistant/i.test(d)) return 65;
    if (/জুনিয়র|Junior/i.test(d)) return 60;
    if (/ক্রাফট|Craft/i.test(d)) return 70;
    if (/ইনস্ট্রাক্টর|Instructor/i.test(d)) return 50;
    if (/প্রধান সহকারী/i.test(d)) return 80;
    if (/হিসাবরক্ষক|Accountant/i.test(d)) return 85;
    if (/স্টোর|Store/i.test(d)) return 90;
    if (/কেয়ার|Care/i.test(d)) return 100;
    if (/ইলেকট্রিশিয়ান|Electrician/i.test(d)) return 110;
    if (/ডাটা|Data/i.test(d)) return 120;
    if (/ক্যাশিয়ার|Cashier/i.test(d)) return 130;
    if (/ক্যাশ সরকার/i.test(d)) return 140;
    if (/নিরাপত্তা|সিকিউরিটি|Security|Guard/i.test(d)) return 150;
    if (/পরিচ্ছন্ন|ক্লিনার|Cleaner|মেশিন/i.test(d)) return 160;
    if (/সুইপার|Sweeper/i.test(d)) return 170;
    return 500;
}
function groupOf(c) {
    if (c.archived) return "archive";
    if (c.category === "administration") return "administration";
    if (c.category === "teacher") return (c.dept_key && DEPTS[c.dept_key] && c.dept_key !== "archive") ? c.dept_key : "other";
    return (c.dept_key && DEPTS[c.dept_key]) ? c.dept_key : "office";
}
function prepare(list) {
    return list.map(c => {
        c = Object.assign({}, c);
        c._rank = rankOf(c);
        c._group = groupOf(c);
        c._id = c.id || ("builtin:" + c.sl);
        return c;
    });
}

/* ---------- DOM ---------- */
const $contacts = document.getElementById("contacts");
const $scrollArea = document.getElementById("scrollArea");
const $search   = document.getElementById("searchInput");
const $clear    = document.getElementById("btnClear");
const $empty    = document.getElementById("empty");
const $tabs     = document.getElementById("tabs");
const $zoomIn   = document.getElementById("zoomIn");
const $zoomOut  = document.getElementById("zoomOut");
const $zoomVal  = document.getElementById("zoomVal");
const $btnTop   = document.getElementById("btnTop");
const $btnShare = document.getElementById("btnShare");
const $btnInstall = document.getElementById("btnInstall");

let contacts = prepare(Array.isArray(window.CONTACTS) ? window.CONTACTS : []);
let currentDept = "all";
let fontSize = parseInt(localStorage.getItem("cbpi_fontsize") || "16");

document.addEventListener("DOMContentLoaded", init);

function init() {
    buildTabs();
    applyFontSize();
    updateCounts();
    render();
    bindEvents();
    registerSW();
}

/* ---------- Tabs ---------- */
function buildTabs() {
    $tabs.innerHTML = "";
    TAB_ORDER.forEach(key => {
        const d = DEPTS[key];
        const btn = document.createElement("button");
        btn.className = "tab" + (key === "all" ? " active" : "");
        btn.dataset.dept = key;
        btn.innerHTML = `<i class="fa-solid ${d.icon}"></i><span>${d.bn}</span>`;
        if (key === "all") {
            const sp = document.createElement("span");
            sp.className = "count"; sp.id = "countAll";
            btn.appendChild(sp);
        }
        $tabs.appendChild(btn);
    });
}
function countFor(dept) {
    if (dept === "all") return contacts.filter(c => c._group !== "archive").length;
    return contacts.filter(c => c._group === dept).length;
}
function updateCounts() {
    const allEl = document.getElementById("countAll");
    if (allEl) allEl.textContent = countFor("all");
    $tabs.querySelectorAll(".tab").forEach(btn => {
        const d = btn.dataset.dept;
        if (d === "all") return;
        const n = countFor(d);
        let badge = btn.querySelector(".count");
        if (n === 0 && d !== "archive") {
            if (badge) badge.remove();
            btn.style.display = "none";
        } else {
            btn.style.display = "";
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "count";
                btn.appendChild(badge);
            }
            badge.textContent = n;
        }
    });
}

/* ---------- Render ---------- */
function render() {
    const term = $search.value.trim().toLowerCase();
    let list = contacts.slice();

    if (currentDept !== "all") {
        list = list.filter(c => c._group === currentDept);
    } else {
        list = list.filter(c => c._group !== "archive");
    }
    if (term) {
        list = list.filter(c => {
            const hay = [c.name,c.bn_name,c.designation,c.bn_designation,c.department,c.mobile,c.phone,c.email]
                .filter(Boolean).join(" ").toLowerCase();
            return hay.includes(term);
        });
    }

    $contacts.innerHTML = "";
    if (list.length === 0) {
        $empty.style.display = "block";
        return;
    }
    $empty.style.display = "none";

    const bnCmp = (window.Intl && Intl.Collator)
        ? new Intl.Collator("bn",{sensitivity:"base",numeric:true})
        : { compare:(a,b)=>a.localeCompare(b) };
    const sorter = (a,b)=>{
        if (a._rank!==b._rank) return a._rank - b._rank;
        return bnCmp.compare(a.bn_name||a.name||"",b.bn_name||b.name||"");
    };

    const groups = {};
    list.forEach(c => { (groups[c._group]=groups[c._group]||[]).push(c); });

    const orderedKeys = Object.keys(groups).sort((a,b)=>{
        const ia = TAB_ORDER.indexOf(a), ib = TAB_ORDER.indexOf(b);
        return (ia===-1?99:ia)-(ib===-1?99:ib);
    });

    let html = "";
    orderedKeys.forEach(gk=>{
        const items = groups[gk].sort(sorter);
        const dept = DEPTS[gk] || {bn:gk,icon:"fa-user",color:"#555"};
        if (currentDept === "all") {
            html += `<div class="cat-heading" style="--dept-color:${dept.color}">
                <span class="cat-icon"><i class="fa-solid ${dept.icon}"></i></span>
                <span>${dept.bn}</span>
                <span class="cat-count">${items.length} জন</span>
            </div>`;
        } else {
            html += `<div class="result-banner" style="--dept-color:${dept.color}">
                <i class="fa-solid ${dept.icon}"></i> ${dept.bn} — ${items.length} জন
            </div>`;
        }
        items.forEach(c=>{ html += contactCard(c); });
    });
    $contacts.innerHTML = html;
}

function contactCard(c) {
    const name  = c.bn_name || c.name || "নাম নেই";
    const en    = c.name || "";
    const desig = c.bn_designation || c.designation || "";
    const phone = c.mobile || c.phone || "";
    const safePhone = sanitizePhone(phone);
    const email = c.email || "";
    const img   = c.image || "";
    const initial = (c.bn_name||c.name||"?").trim().charAt(0);
    const color = avatarColor(name);
    const emailHtml = email
        ? `<a href="mailto:${escapeHtml(email)}" onclick="event.stopPropagation()" title="ইমেইল"><i class="fa-solid fa-envelope"></i></a>`
        : "";
    const imgHtml = img
        ? `<img src="${img}" alt="${escapeHtml(name)}" onerror="this.outerHTML='<span style=&quot;font-weight:700&quot;>${initial}</span>';">`
        : `<span style="font-weight:700">${initial}</span>`;
    const showEn = en && en !== c.bn_name;
    const archCls = c._group === "archive" ? " archived" : "";

    return `<div class="contact${archCls}">
        <div class="avatar" style="background:${color}18;color:${color}">${imgHtml}</div>
        <div class="info">
            <h3>${escapeHtml(name)}</h3>
            ${showEn?`<p class="en-name">${escapeHtml(en)}</p>`:""}
            ${desig?`<p class="designation">${escapeHtml(desig)}</p>`:""}
            <div class="phone-row">
                <span class="phone-num"><i class="fa-solid fa-phone"></i> ${escapeHtml(phone||"—")}</span>
                <span class="contact-actions">${emailHtml}</span>
            </div>
        </div>
        <a class="call-btn" href="tel:${safePhone}" title="কল করুন">
            <i class="fa-solid fa-phone"></i>
        </a>
    </div>`;
}

function callNumber(phone) {
    if (!phone) { showToast("নম্বর নেই"); return; }
    window.location.href = "tel:" + phone;
}

/* ---------- Helpers ---------- */
function sanitizePhone(p) {
    if (!p) return "";
    let s = String(p).replace(/\D/g,"");
    if (s.startsWith("880")) s = "0" + s.slice(3);
    if (!s.startsWith("0")) s = "0" + s;
    return s;
}
function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}
function avatarColor(name){
    const palette=["#009578","#1565c0","#c2185b","#f57c00","#00838f","#ad1457","#2e7d32","#6a1b9a","#5d4037","#455a64","#e53935","#00acc1"];
    let h=0;
    for (let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
    return palette[h%palette.length];
}

function showToast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id="toast";
        t.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#222;color:#fff;padding:10px 18px;border-radius:22px;font-size:0.85rem;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.25);opacity:0;transition:opacity .25s, transform .25s;font-family:inherit;";
        document.body.appendChild(t);
    }
    t.textContent=msg;
    requestAnimationFrame(()=>{t.style.opacity="1";t.style.transform="translateX(-50%) translateY(0)";});
    setTimeout(()=>{t.style.opacity="0";t.style.transform="translateX(-50%) translateY(20px)";},2200);
}

/* ---------- Events ---------- */
function bindEvents() {
    $search.addEventListener("input", ()=>{
        $clear.style.display = $search.value ? "block":"none";
        render();
    });
    $clear.addEventListener("click",()=>{$search.value="";$clear.style.display="none";render();$search.focus();});
    $tabs.addEventListener("click", e=>{
        const btn = e.target.closest(".tab");
        if (!btn) return;
        $tabs.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
        btn.classList.add("active");
        currentDept = btn.dataset.dept;
        $scrollArea.scrollTo({top:0,behavior:"smooth"});
        render();
    });
    $zoomIn.addEventListener("click",()=>{fontSize=Math.min(28,fontSize+1);applyFontSize();});
    $zoomOut.addEventListener("click",()=>{fontSize=Math.max(12,fontSize-1);applyFontSize();});
    $btnTop.addEventListener("click",()=>{$scrollArea.scrollTo({top:0,behavior:"smooth"});});

    if ($btnShare) $btnShare.addEventListener("click", async ()=>{
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({title:"CBPI Phone Directory",text:"CBPI Phone Directory",url}); } catch(e){}
        } else {
            try { await navigator.clipboard.writeText(url); showToast("লিঙ্ক কপি হয়েছে"); } catch(e){ showToast(url); }
        }
    });
}
function applyFontSize() {
    document.documentElement.style.fontSize = fontSize + "px";
    localStorage.setItem("cbpi_fontsize", fontSize);
    const pct = Math.round(fontSize/16*100);
    if ($zoomVal) $zoomVal.textContent = pct + "%";
}

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt", e=>{
    e.preventDefault(); deferredPrompt=e;
    if ($btnInstall) $btnInstall.style.display="";
});
window.addEventListener("appinstalled",()=>{$btnInstall.style.display="none";deferredPrompt=null;});
if ($btnInstall) $btnInstall.addEventListener("click", async ()=>{
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null; $btnInstall.style.display="none";
});

/* ---------- Service Worker ---------- */
function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return;
    window.addEventListener("load", ()=>{
        navigator.serviceWorker.register("sw.js").catch(err=>console.warn("SW fail",err));
    });
}

window.callNumber = callNumber;
window.showToast = showToast;
