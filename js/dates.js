/* המרת תאריך לועזי לתאריך עברי, ופורמט התאריכים שמופיעים במסמך */

const GREG_EPOCH = 1721425.5;
function leapGregorian(y){return (y%4===0)&&(!((y%100===0)&&(y%400!==0)));}
function gregorianToJD(y,m,d){
  return (GREG_EPOCH-1)+365*(y-1)+Math.floor((y-1)/4)-Math.floor((y-1)/100)+Math.floor((y-1)/400)+
    Math.floor(((367*m)-362)/12)+((m<=2)?0:(leapGregorian(y)?-1:-2))+d;
}
const HEB_EPOCH = 347995.5;
function mod(a,b){return a-b*Math.floor(a/b);}
function hebLeap(y){return mod(7*y+1,19)<7;}
function hebYearMonths(y){return hebLeap(y)?13:12;}
function hebDelay1(y){
  const months=Math.floor(((235*y)-234)/19);
  const parts=12084+(13753*months);
  let days=(months*29)+Math.floor(parts/25920);
  if(mod(3*(days+1),7)<3)days++;
  return days;
}
function hebDelay2(y){
  const last=hebDelay1(y-1), present=hebDelay1(y), next=hebDelay1(y+1);
  if((next-present)===356)return 2;
  if((present-last)===382)return 1;
  return 0;
}
function hebYearDays(y){return hebToJD(y+1,7,1)-hebToJD(y,7,1);}
function longHeshvan(y){return mod(hebYearDays(y),10)===5;}
function shortKislev(y){return mod(hebYearDays(y),10)===3;}
function hebMonthDays(y,m){
  if([2,4,6,10,13].includes(m))return 29;
  if(m===12&&!hebLeap(y))return 29;
  if(m===8&&!longHeshvan(y))return 29;
  if(m===9&&shortKislev(y))return 29;
  return 30;
}
function hebToJD(y,m,d){
  const months=hebYearMonths(y);
  let jd=HEB_EPOCH+hebDelay1(y)+hebDelay2(y)+d+1;
  if(m<7){
    for(let mon=7;mon<=months;mon++)jd+=hebMonthDays(y,mon);
    for(let mon=1;mon<m;mon++)jd+=hebMonthDays(y,mon);
  }else{
    for(let mon=7;mon<m;mon++)jd+=hebMonthDays(y,mon);
  }
  return jd;
}
function jdToHeb(jd){
  jd=Math.floor(jd)+0.5;
  let count=Math.floor(((jd-HEB_EPOCH)*98496.0)/35975351.0);
  let i=count;
  while(jd>=hebToJD(i,7,1))i++;
  const year=i-1;
  const firstMonth=(jd<hebToJD(year,1,1))?7:1;
  let month=firstMonth;
  while(jd>hebToJD(year,month,hebMonthDays(year,month)))month++;
  const day=(jd-hebToJD(year,month,1))+1;
  return [year,month,day];
}
const HEB_MONTH_NAMES={1:'ניסן',2:'אייר',3:'סיון',4:'תמוז',5:'אב',6:'אלול',7:'תשרי',8:'חשון',9:'כסלו',10:'טבת',11:'שבט',12:'אדר',13:'אדר ב'};
function hebMonthName(y,m){ if(m===12&&hebLeap(y)) return 'אדר א'; return HEB_MONTH_NAMES[m]; }
function hebrewLetters(num){
  const map=[[400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']];
  let n=num, letters=[];
  while(n>0){
    if(n===15){letters.push('ט','ו');n=0;}
    else if(n===16){letters.push('ט','ז');n=0;}
    else{ for(const [v,l] of map){ if(v<=n){letters.push(l);n-=v;break;} } }
  }
  return letters;
}
function formatHebNum(num){
  const letters=hebrewLetters(num);
  if(letters.length===0) return '';
  if(letters.length===1) return letters[0]+'\u05f3';
  return letters.slice(0,-1).join('')+'\u05f4'+letters[letters.length-1];
}
function getHebrewDateString(date){
  const jd=gregorianToJD(date.getFullYear(),date.getMonth()+1,date.getDate());
  const [hy,hm,hd]=jdToHeb(jd);
  const dayStr=formatHebNum(Math.round(hd));
  const yearStr=formatHebNum(hy%1000);
  return `${dayStr} ב${hebMonthName(hy,hm)} ה${yearStr}`;
}
const GREG_MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
function getGregorianDateString(date){
  return `${date.getDate()} ב${GREG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/* ---------- battalion logic ---------- */
