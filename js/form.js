/* הטופס והתצוגה המקדימה: בחירת גדוד, מילוי המסמך, מעבר בין מסכים */

function esc(s){
  const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML;
}
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }


/* ---------- מבנה הדו"ח: שדות בטופס ופריסה שטוחה למסמך ---------- */
// מספור לפי עומק: רמה 0 = א. ב. ג. | רמה 1 = 1. 2. 3. | רמה 2 = א. ב. ג.
function marker(level,i){ return (level===1 ? String(i+1) : (HEB_LETTERS[i]||'')) + '.'; }

function renderReportFields(){
  const root = document.getElementById('reportFields');
  root.innerHTML = '';
  let n = 0;
  (function walk(nodes, level, parent){
    nodes.forEach((node,i)=>{
      node.key = 'rep' + (n++);
      const label = marker(level,i) + ' ' + node.title;
      const box = document.createElement('div');
      box.className = 'rep-field rep-l' + level;
      if(node.children){
        const h = document.createElement('div');
        h.className = 'rep-head'; h.textContent = label + ':';
        box.appendChild(h); parent.appendChild(box);
        walk(node.children, level+1, parent);
        return;
      }
      const lab = document.createElement('label'); lab.htmlFor = node.key;
      lab.textContent = label + (node.optional ? ' (לא חובה)' : '');
      box.appendChild(lab);
      if(node.hint){ const h=document.createElement('div'); h.className='rep-hint'; h.textContent=node.hint; box.appendChild(h); }
      const ta = document.createElement('textarea'); ta.id = node.key; ta.required = !node.optional;
      box.appendChild(ta); parent.appendChild(box);
    });
  })(REPORT, 0, root);
}

// רשימה שטוחה של שורות המסמך: {level, label, head, text}. סעיף רשות שנשאר ריק לא נכנס.
function collectReport(){
  const out = [];
  (function walk(nodes, level){
    nodes.forEach((node,i)=>{
      const label = marker(level,i) + ' ' + node.title;
      if(node.children){ out.push({level, label: label+':', head:true, text:''}); walk(node.children, level+1); return; }
      const text = document.getElementById(node.key).value.trim();
      if(node.optional && !text) return;
      out.push({level, label: label + (level===0 ? ':' : ' -'), head:false, text});
    });
  })(REPORT, 0);
  return out;
}

/* ---------- בחירת גדוד ולוגו ---------- */
// מגמת "מפקדה": אין גדוד ופלוגה - לא בטופס, לא במסמך ולא בלוגו
function isHq(){ return document.getElementById('megama').value === 'מפקדה'; }

function populateGdod(){
  const megama = document.getElementById('megama').value;
  const gdodSel = document.getElementById('gdod');
  const plugaInp = document.getElementById('pluga');
  const row = document.getElementById('gdodPlugaRow');
  gdodSel.innerHTML = '';
  if(megama === 'מפקדה'){
    row.style.display = 'none';
    gdodSel.required = false; plugaInp.required = false;
    gdodSel.value = ''; plugaInp.value = '';
    updateBattalionLogo();
    return;
  }
  row.style.display = '';
  gdodSel.required = true; plugaInp.required = true;
  const opts = MEGAMOT[megama] || [];
  if(opts.length===0){
    // עוד לא נבחרה מגמה - השדה ריק ונעול, עד שתיבחר מגמה
    const placeholder=document.createElement('option');
    placeholder.value=''; placeholder.textContent='בחירה'; placeholder.disabled=true; placeholder.selected=true; placeholder.hidden=true;
    gdodSel.appendChild(placeholder);
    gdodSel.disabled = true;
    updateBattalionLogo();
    return;
  }
  opts.forEach(g=>{
    const o=document.createElement('option');
    o.value=g; o.textContent='גדוד '+g;
    gdodSel.appendChild(o);
  });
  gdodSel.disabled = opts.length<=1;
  updateBattalionLogo();
}

// מעדכן את לוגו הגדוד בטופס ובמסמך (היו שתי גרסאות של הפונקציה, אוחדו לאחת)
function updateBattalionLogo(){
  const gdod = document.getElementById('gdod').value;
  const box = document.querySelector('.logo-preview');
  const logo2 = document.getElementById('battalionLogoImg2');
  if(!LOGO_FILES[gdod]){ box.hidden = true; logo2.style.display = 'none'; return; }   // עוד לא נבחר גדוד / מפקדה - מסתירים
  logo2.style.display = '';
  const src = LOGO_DIR + LOGO_FILES[gdod];
  document.getElementById('battalionLogoImg').src = src;
  document.getElementById('battalionLogoImg2').src = src;
  box.hidden = false;                                    // נבחר גדוד - מציגים
}

/* ---------- מילוי המסמך מהנתונים בטופס ---------- */
function buildDoc(){
  const v = id => document.getElementById(id).value;
  const now = new Date();
  const hq = isHq();
  document.getElementById('docGdod').textContent = v('gdod');
  document.getElementById('docPluga').textContent = v('pluga');
  document.getElementById('docGdodLine').style.display = hq ? 'none' : '';
  document.getElementById('docPlugaLine').style.display = hq ? 'none' : '';
  document.getElementById('docHebDate').textContent = getHebrewDateString(now);
  document.getElementById('docGregDate').textContent = getGregorianDateString(now);
  document.getElementById('docNidon').innerHTML = nl2br(v('nidon'));
  document.getElementById('docBody').innerHTML = collectReport().map(r =>
    '<div class="rep-line rep-l'+r.level+'"><b>'+esc(r.label)+'</b>'+(r.head?'':' '+nl2br(r.text))+'</div>').join('');
  document.getElementById('docFullName').textContent = v('fullName');
  document.getElementById('docRank').textContent = v('rank');
  document.getElementById('docGdodTafkid').textContent = hq ? v('tafkid') : v('gdod') + ' - ' + v('tafkid');
  updateBattalionLogo();
}


/* ---------- תצוגה מקדימה ---------- */
function fitPreview(){
  const sec=document.getElementById('previewSection');
  const frame=document.getElementById('previewFrame');
  if(sec.style.display==='none') return;
  const w=sec.clientWidth-32;
  frame.style.zoom=Math.min(1,w/794);
}
function showPreview(){
  const form=document.getElementById('mainForm');
  if(!form.reportValidity()) return;
  buildDoc();
  document.getElementById('formWrap').style.display='none';
  document.getElementById('previewSection').style.display='block';
  fitPreview(); window.scrollTo(0,0);
}
function backToEdit(){
  document.getElementById('previewSection').style.display='none';
  document.getElementById('formWrap').style.display='block';
  window.scrollTo(0,0);
}

/* ---------- אתחול ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('behadLogoImg').src = LOGO_DIR + LOGO_FILES['בהד'];
  document.getElementById('topLogo').src = LOGO_DIR + LOGO_FILES['בהד'];
  document.getElementById('megama').addEventListener('change',populateGdod);
  document.getElementById('gdod').addEventListener('change',updateBattalionLogo);
  document.getElementById('generateBtn').addEventListener('click',showPreview);
  document.getElementById('wordBtn').addEventListener('click',downloadWord);
  document.getElementById('pdfBtn').addEventListener('click',downloadPdf);
  document.getElementById('backBtn').addEventListener('click',backToEdit);
  window.addEventListener('resize',fitPreview);
  renderReportFields();
  populateGdod();
});
