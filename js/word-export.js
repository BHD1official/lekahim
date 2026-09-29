/* יצירת קובץ ה-Word: בניית המסמך, שמירה והכפתור "הורד Word" */

function buildDocx(docx, d){
  const {Document,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,ImageRun}=docx;
  const F={ascii:'David',hAnsi:'David',cs:'David',eastAsia:'David'};
  const NB={style:BorderStyle.NONE,size:0,color:'FFFFFF'};
  const NOB={top:NB,bottom:NB,left:NB,right:NB};
  const tr=(t,o={})=>new TextRun({text:t,font:F,size:o.size||24,sizeComplexScript:o.size||24,bold:!!o.bold,boldComplexScript:!!o.bold,rightToLeft:true,break:o.br?1:undefined});
  const rtlP=(runs,o={})=>new Paragraph({bidirectional:true,alignment:o.align,spacing:{after:o.after===undefined?120:o.after,before:o.before||0},children:runs});
  const lines=(t,o={})=>String(t||'').split('\n').map((l,i)=>tr(l,{...o,br:i>0}));
  const pngSize=b=>({w:(b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19],h:(b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23]});
  const b64=s=>{const bin=atob(s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;};
  const img=s=>{const u=b64(s);const {w,h}=pngSize(u);const box=76;const k=box/Math.max(w,h);return new ImageRun({type:'png',data:u,transformation:{width:Math.round(w*k),height:Math.round(h*k)}});};
  const sp=()=>new TextRun({text:'   ',size:24});
  // כל שורה: הטקסט ואם היא מודגשת (תואם לבלוק המקביל בתצוגה המקדימה - css/style.css .pdf-org-block)
  const orgLines=[
    {t:'בית הספר לקצינים',bold:true},
    {t:'ע"ש רא"ל לסקוב',bold:true},
    {t:'גדוד '+d.gdod,bold:true},
    {t:'פלוגת '+d.pluga,bold:true},
    {t:'טלפון המטכ"לי: 03-9876543',bold:false},
    {t:'טלפון האזרחי: 03-1234567',bold:false},
    {t:'מספר הפקס: 03-1928376',bold:false},
    {t:d.hebDate,bold:false},
    {t:d.gregDate,bold:false}
  ];
  // רוחב בלוק פרטי הגדוד: 54 מ"מ (1 מ"מ = 56.7 twips). כדי לשנות - מחליפים את המספר הזה (ב-CSS: .pdf-org-block)
  const ORG_W=Math.round(54*56.7), PAGE_W=10318;
  // פיזור השורות לכל רוחב הבלוק: Google Docs לא מכיר DISTRIBUTE, ולכן כל השורות הן פסקה אחת מיושרת לשני הצדדים (JUSTIFIED)
  // שבה השורות מופרדות ב-Shift+Enter. גם וורד וגם Docs מותחים שורה שנגמרת בירידת שורה רכה. השורה האחרונה בפסקה לא נמתחת, לכן
  // מוסיפים אחריה שורה ריקה זעירה (1pt)
  const orgRuns=[];
  orgLines.forEach((l,i)=>orgRuns.push(tr(l.t,{bold:l.bold,br:i>0})));
  orgRuns.push(new TextRun({break:1,size:2,sizeComplexScript:2,font:F,rightToLeft:true}));
  const orgPara=new Paragraph({bidirectional:true,alignment:AlignmentType.BOTH,spacing:{after:0,before:0},run:{size:2,sizeComplexScript:2},children:orgRuns});
  const NOM={top:0,bottom:0,left:0,right:0};
  const header=new Table({
    width:{size:PAGE_W,type:WidthType.DXA},columnWidths:[ORG_W,PAGE_W-ORG_W],
    borders:{top:NB,bottom:NB,left:NB,right:NB,insideHorizontal:NB,insideVertical:NB},
    rows:[new TableRow({children:[
      new TableCell({width:{size:ORG_W,type:WidthType.DXA},margins:NOM,borders:NOB,children:[orgPara]}),
      new TableCell({width:{size:PAGE_W-ORG_W,type:WidthType.DXA},borders:NOB,children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[img(d.behadLogo),sp(),img(d.gdodLogo)]})]})
    ]})]
  });
  const kids=[
    rtlP([tr('בלמ"ס',{bold:true})],{align:AlignmentType.CENTER,after:120}),
    header,
    rtlP([tr(d.title,{size:28,bold:true})],{align:AlignmentType.CENTER,before:240,after:240}),
    rtlP([tr('הנידון: ',{bold:true}),...lines(d.nidon)],{after:200})
  ];
  [['כללי:',d.klali],['מוקד תחקיר:',d.moked],['תיחום התחקיר:',d.tihum],
   ['מה היה:',d.mahHaya,true],['מה היה צריך להיות:',d.mahHayaTzarich,true],['פערים:',d.pearim,true],['הסיבות לפער:',d.sibotPearim,true],
   ['לקחים:',d.lekachim]].forEach(([h,t,optional])=>{
    if(optional && !String(t||'').trim()) return;   // שדה לא חובה שנשאר ריק - לא נכנס למסמך
    kids.push(rtlP([tr(h,{bold:true})],{after:40}));
    kids.push(rtlP(lines(t),{after:200}));
  });

  const sig=t=>rtlP([tr(t)],{after:60});
  kids.push(new Paragraph({spacing:{before:480},children:[]}));
  kids.push(new Table({
    width:{size:10318,type:WidthType.DXA},columnWidths:[4300,6018],
    borders:{top:NB,bottom:NB,left:NB,right:NB,insideHorizontal:NB,insideVertical:NB},
    rows:[new TableRow({children:[
      new TableCell({width:{size:4300,type:WidthType.DXA},borders:NOB,children:[sig(d.fullName+','),sig(d.rank),sig(d.gdod+' - '+d.tafkid),sig('צוער בבית הספר לקצינים')]}),
      new TableCell({width:{size:6018,type:WidthType.DXA},borders:NOB,children:[new Paragraph({children:[]})]})
    ]})]
  }));
  // שוליים שמאליים מוקטנים (כמו ב-css/style.css #pdfPage) כדי שגוש פרטי הגדוד וגוש החתימה, שיושבים בצמוד לשוליים השמאליים, יזוזו יותר שמאלה
  return new Document({sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:720,bottom:720,left:454,right:794}}},children:kids}]});
}


async function saveBlob(blob,filename){
  const downloads=window.claude?await window.claude.use('downloads'):null;
  if(downloads){
    try{ await downloads.save({filename,data:blob}); }
    catch(err){ if(!(err&&err.code==='declined')){ console.error(err); alert('שמירת הקובץ נכשלה. נסו שוב.'); } }
  }else{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
}
async function downloadWord(){
  const btn=document.getElementById('wordBtn');
  btn.disabled=true; btn.textContent='יוצר Word...';
  try{
    const v=id=>document.getElementById(id).value;
    const t=id=>document.getElementById(id).textContent;
    const d={behadLogo:LOGOS['בהד'],gdodLogo:LOGOS[v('gdod')],title:v('title'),nidon:v('nidon'),klali:v('klali'),moked:v('mokedTahkir'),tihum:v('tihum'),lekachim:v('lekachim'),mahHaya:v('mahHaya'),mahHayaTzarich:v('mahHayaTzarich'),pearim:v('pearim'),sibotPearim:v('sibotPearim'),gdod:v('gdod'),pluga:v('pluga'),hebDate:t('docHebDate'),gregDate:t('docGregDate'),fullName:v('fullName'),rank:v('rank'),tafkid:v('tafkid')};
    
    const blob=await docx.Packer.toBlob(buildDocx(docx,d));


    await saveBlob(blob,(v('title')||'מסמך')+'.docx');
  }catch(err){ console.error(err); alert('אירעה שגיאה ביצירת קובץ ה-Word. נסו שוב.'); }
  finally{ btn.disabled=false; btn.textContent='הורד Word'; }
}

/* הורדת PDF: פותח את חלון ההדפסה של הדפדפן רק עם דף המסמך (ראו @media print ב-css/style.css).
   בחלון ההדפסה בוחרים יעד "שמירה כ-PDF". הטקסט נשאר טקסט אמיתי (ניתן לסימון) והמראה זהה לתצוגה המקדימה. */
function downloadPdf(){
  const title=document.getElementById('title').value||'מסמך';
  const old=document.title;
  document.title=title; // שם הקובץ המוצע ב"שמירה כ-PDF"
  const restore=()=>{ document.title=old; window.removeEventListener('afterprint',restore); };
  window.addEventListener('afterprint',restore);
  window.print();
}
