// ===== UI =====
let S,G,drag=null;let u=100/N;const $=id=>document.getElementById(id);
function rot(){return 0}
function show(id){['menu','lobby','game'].forEach(x=>$(x).style.display=x==id?'flex':'none');if(typeof chatVis=='function')chatVis(id)}
function startLocal(P=4){setMode(P);G={seats:[{name:myName()},{name:'Ash',bot:1},{name:'Nova',bot:1},{name:'Pip',bot:1}].slice(0,P),me:0,online:false,host:true};begin(newState(P))}
function begin(s){S=s;$('ov').style.display='none';show('game');render();tick()}
function submit(a){ if(G.online&&!G.host){Online.send('act',{seat:G.me,a});return}
  if(apply(S,G.me,a)){if(G.online)Online.send('state',S);render();tick()}}
function render(){u=100/N;const bd=$('bd');let h='';
for(let r=0;r<N;r++)for(let c=0;c<N;c++){const g=!DUEL&&r==MID&&c==MID,gr=DUEL&&(r==0||r==N-1),bg=g?'background:#f0d044':gr?`background:${COL[r==0?0:1]}55`:'';h+=`<div class="c" style="left:${c*u+.4}%;top:${r*u+.4}%;width:${u-.8}%;height:${u-.8}%;${bg}"></div>`}
const wallH=(w,ex)=>{const t=1.6,l=w.o=='h'?w.c*u+.6:(w.c+1)*u-t/2,tp=w.o=='h'?(w.r+1)*u-t/2:w.r*u+.6,W=w.o=='h'?2*u-1.2:t,Hh=w.o=='h'?t:2*u-1.2;
return`<div class="w" style="left:${l}%;top:${tp}%;width:${W}%;height:${Hh}%;background:${w.bg||COL[w.p]};color:${w.bg||COL[w.p]};${ex||''}"></div>`};
S.w.forEach(w=>h+=wallH(w));
if(drag&&drag.a)h+=wallH({...drag.a,bg:drag.ok?'#6cc04a':'#e0204a'},'opacity:.6');
S.p.forEach((q,i)=>h+=`<div class="p" style="left:${q.c*u+1.2}%;top:${q.r*u+1.2}%;width:${u-2.4}%;height:${u-2.4}%;background:${COL[i]};${i==G.me?'outline:3px solid #fff;outline-offset:1px':''}"></div>`);
if(S.t==G.me&&S.win<0)moves(S,G.me).forEach(m=>h+=`<div class="d" data-r="${m.r}" data-c="${m.c}" style="left:${m.c*u+u*.3}%;top:${m.r*u+u*.3}%;width:${u*.4}%;height:${u*.4}%;box-shadow:0 0 0 ${u*.3}vmin #0000"></div>`);
bd.innerHTML=h;bd.style.transform=`rotate(${rot()}deg)`;
bd.querySelectorAll('.d').forEach(d=>d.onpointerdown=()=>submit({type:'move',r:+d.dataset.r,c:+d.dataset.c}));
$('cards').innerHTML=Array.from({length:G.seats.length-1},(_,k)=>(G.me+k+1)%G.seats.length).map(i=>`<div class="pc ${S.t==i?'on':''}" style="color:${COL[i]}"><b style="color:#eee">${G.seats[i].name}</b>${Array.from({length:W},(_,k)=>`<i class="${k<S.left[i]?'':'x'}"></i>`).join('')} <span style="color:#eee;font-size:13px">${S.left[i]}</span></div>`).join('');
$('wl').innerHTML=Array.from({length:W},(_,k)=>`<i class="${k<S.left[G.me]?'':'x'}"></i>`).join('');$('wn').textContent=S.left[G.me]+' restantes';
$('st').textContent=S.win>=0?(S.win==G.me?'¡Ganaste!':G.seats[S.win].name+' gana'):S.t==G.me?'Tu turno':'Turno de '+G.seats[S.t].name;
if(S.win>=0){$('ovt').textContent=S.win==G.me?'🎯 ¡Ganaste!':G.seats[S.win].name+' llegó a la meta';$('ovr').style.display=G.online?'':'none';$('ov').style.display='flex'}}
function tick(){if(!G||!G.host||S.win>=0||!G.seats[S.t].bot)return;setTimeout(()=>{if(!G||S.win>=0)return;const a=ai(S,S.t);if(a)apply(S,S.t,a);else S.t=(S.t+1)%S.p.length;if(G.online)Online.send('state',S);render();tick()},700)}
function pos(e,o){const R=$('bd').getBoundingClientRect(),th=-rot()*Math.PI/180,
dx=e.clientX-R.left-R.width/2,dy=e.clientY-R.top-R.height/2-(e.pointerType=='touch'?50:0),
x=((dx*Math.cos(th)-dy*Math.sin(th))+R.width/2)/R.width*N,y=((dx*Math.sin(th)+dy*Math.cos(th))+R.height/2)/R.height*N;
const a=o=='h'?{o,c:Math.round(x-1),r:Math.round(y)-1}:{o,c:Math.round(x)-1,r:Math.round(y-1)};
a.in=x>-.5&&x<N+.5&&y>-.5&&y<N+.5;a.c=Math.max(0,Math.min(N-2,a.c));a.r=Math.max(0,Math.min(N-2,a.r));return a}
['h','v'].forEach(o=>$('b'+o).onpointerdown=e=>{if(!G||S.t!=G.me||S.win>=0||S.left[G.me]<1)return;drag={o};e.target.setPointerCapture?.(e.pointerId);
$('b'+o).onpointermove=ev=>{if(!drag)return;drag.a=pos(ev,o);drag.ok=wallOk(S,o,drag.a.r,drag.a.c);render()};
$('b'+o).onpointerup=ev=>{if(!drag)return;const a=pos(ev,o);drag=null;
if(a.in&&wallOk(S,o,a.r,a.c))submit({type:'wall',o,r:a.r,c:a.c});else render()}});