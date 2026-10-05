/* הטופס והתצוגה המקדימה: בחירת גדוד, מילוי המסמך, מעבר בין מסכים */

function esc(s){
  const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML;
}
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }


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
  document.getElementById('docTitle').textContent = v('title') || 'ללא כותרת';
  const hq = isHq();
  document.getElementById('docGdod').textContent = v('gdod');
  document.getElementById('docPluga').textContent = v('pluga');
  document.getElementById('docGdodLine').style.display = hq ? 'none' : '';
  document.getElementById('docPlugaLine').style.display = hq ? 'none' : '';
  document.getElementById('docHebDate').textContent = getHebrewDateString(now);
  document.getElementById('docGregDate').textContent = getGregorianDateString(now);
  document.getElementById('docNidon').innerHTML = nl2br(v('nidon'));
  document.getElementById('docKlali').innerHTML = nl2br(v('klali'));
  document.getElementById('docMokedTahkir').innerHTML = nl2br(v('mokedTahkir'));
  document.getElementById('docTihum').innerHTML = nl2br(v('tihum'));

    [['MahHaya','mahHaya'],['MahHayaTzarich','mahHayaTzarich'],['Pearim','pearim'],['SibotPearim','sibotPearim']].forEach(([docId,fieldId])=>{
    const val = v(fieldId);
    document.getElementById('doc'+docId).innerHTML = nl2br(val);
    document.getElementById('sec'+docId).style.display = val.trim() ? '' : 'none';
  });
  
  document.getElementById('docLekachim').innerHTML = nl2br(v('lekachim'));
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
  populateGdod();
});
