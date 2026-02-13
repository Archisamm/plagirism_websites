document.addEventListener("DOMContentLoaded", () => {

const file = document.getElementById("fileInput");
const text = document.getElementById("textInput");
const upload = document.getElementById("uploadBtn");
const analyze = document.getElementById("analyzeTextBtn");
const status = document.getElementById("status");

const ring = document.querySelector(".ring-progress");
const score = document.getElementById("scoreValue");
const verdict = document.getElementById("verdictText");

const pie = document.getElementById("pieChart");
const ctx = pie.getContext("2d");

const breakdown = [
 document.getElementById("b1"),
 document.getElementById("b2"),
 document.getElementById("b3"),
 document.getElementById("b4")
];

const loader = document.getElementById("aiLoader");

let pulseTimer=null;

// ---------------- AI START ----------------

function start(btn){
 btn.disabled=true;
 btn.innerHTML="🤖 AI Analyzing...";
 ring.classList.add("spin");
 verdict.classList.add("pulse");
 loader.classList.remove("hidden");

 breakdown.forEach(b=>{
   b.classList.remove("done");
   b.classList.add("active");
 });

 pulseTimer=setInterval(()=>{
   breakdown.forEach(b=>b.classList.toggle("active"));
 },400);
}

function stop(btn,label){
 btn.disabled=false;
 btn.innerHTML=label;
 ring.classList.remove("spin");
 verdict.classList.remove("pulse");
 loader.classList.add("hidden");
 clearInterval(pulseTimer);
}

// ---------------- SCORE RING ----------------

function circle(v){
 let c=2*Math.PI*60;
 ring.style.strokeDasharray=c;
 ring.style.strokeDashoffset=c-(v/100)*c;
 score.textContent=v;
}

// ---------------- PIE ----------------

function pieDraw(b){

 b=b||{};
 let parts=[
  Number(b.identical||0),
  Number(b.minor_changes||0),
  Number(b.paraphrased||0),
  Number(b.unique||0)
 ];

 let total=parts.reduce((a,x)=>a+x,0);
 if(!total){ parts=[0,0,0,100]; total=100; }

 const colors=["#ef4444","#f59e0b","#3b82f6","#22c55e"];

 ctx.clearRect(0,0,250,250);

 let angle=0;

 parts.forEach((v,i)=>{
  if(!v) return;
  let slice=(v/total)*Math.PI*2;

  ctx.beginPath();
  ctx.moveTo(125,125);
  ctx.arc(125,125,100,angle,angle+slice);
  ctx.fillStyle=colors[i];
  ctx.fill();

  angle+=slice;
 });
}

// ---------------- HIGHLIGHT TEXT ----------------

function highlight(){
 text.innerHTML=text.value.replace(/(.{50})/g,"<mark>$1</mark>");
}

// ---------------- SERVER ----------------

async function send(url,fd){
 let r=await fetch(url,{method:"POST",body:fd});
 let d=await r.json();
 if(d.error) throw new Error(d.error);
 return d;
}

// ---------------- FILE ----------------

upload.onclick=async()=>{
 if(!file.files.length) return status.textContent="❌ Select file";

 try{
  start(upload);
  status.textContent="AI scanning document...";

  let fd=new FormData();
  fd.append("file",file.files[0]);

  let d=await send("/api/upload/",fd);

  circle(Math.round(d.plagiarism_percentage||0));
  verdict.textContent=d.verdict||"";
  pieDraw(d.breakdown);

  breakdown.forEach(b=>b.classList.add("done"));
  status.textContent="✅ Completed";

 }catch(e){
  status.textContent="❌ "+e.message;
 }finally{
  stop(upload,"Analyze Uploaded File");
 }
};

// ---------------- TEXT ----------------

analyze.onclick=async()=>{
 if(text.value.length<50) return status.textContent="❌ Paste more text";

 try{
  start(analyze);
  status.textContent="AI scanning text...";

  let fd=new FormData();
  fd.append("text",text.value);

  let d=await send("/api/analyze-text/",fd);

  circle(Math.round(d.plagiarism_percentage||0));
  verdict.textContent=d.verdict||"";
  pieDraw(d.breakdown);
  highlight();

  breakdown.forEach(b=>b.classList.add("done"));
  status.textContent="✅ Completed";

 }catch(e){
  status.textContent="❌ "+e.message;
 }finally{
  stop(analyze,"Analyze Text");
 }
};

});