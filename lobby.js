// Salas: el anfitrión es la autoridad (valida jugadas, corre bots y difunde el estado)
let L=null;
const myId=Math.random().toString(36).slice(2,8),BN=['','Ash','Nova','Pip','Rex','Zed','Kai','Lux'];
const myName=()=>($('nm').value.trim()||'Jugador').slice(0,10);
function needOnline(){ if(!Online.init()){alert('Configura config.js con tus claves de Supabase');return false}return true}
const lob=()=>Online.send('lobby',{P:L.P,seats:L.seats});
function createRoom(){ if(!needOnline())return;
  const code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join(''),P=+$('mode').value;
  L={code,host:true,P,seats:Array(P).fill(null)};L.seats[0]={name:myName(),id:myId};
  Online.open(code,onMsg,()=>{show('lobby');renderLobby()})}
function joinRoom(){ if(!needOnline())return;
  const code=$('code').value.trim().toUpperCase(); if(code.length!=5)return;
  L={code,host:false,P:4,seats:[]};
  Online.open(code,onMsg,()=>{Online.send('join',{id:myId,name:myName()});
    L.t=setTimeout(()=>{alert('Sala no encontrada o llena');leave()},4000)})}
function renderLobby(){ $('lcode').textContent=L.code;
  $('seats').innerHTML=L.seats.map((s,i)=>`<div style="border-color:${COL[i]}">${s?s.name+(s.id==myId?' (tú)':''):'<i style="opacity:.4">bot</i>'}</div>`).join('');
  $('go').style.display=L.host?'':'none'; $('wait').textContent=L.host?'':'Esperando al anfitrión...'}
function startRoom(){ setMode(L.P);
  const seats=L.seats.map((s,i)=>s?{name:s.name,id:s.id}:{name:BN[i]||'Bot',bot:1});
  L.started=true; G={seats,me:0,online:true,host:true};
  const s=newState(L.P); Online.send('start',{seats,S:s}); begin(s)}
function onMsg({t,d}){
  if(L.host){
    if(t=='join'&&!L.started){ let i=L.seats.findIndex(s=>s&&s.id==d.id); if(i<0)i=L.seats.findIndex(s=>!s);
      if(i>=0){L.seats[i]={id:d.id,name:d.name};lob();renderLobby()}}
    if(t=='leave'){const gi=G?G.seats.findIndex(s=>s.id==d.id):-1;L.seats=L.seats.map(s=>s&&s.id==d.id?null:s);
      if(!L.started){lob();renderLobby()}
      else if(gi>=0){G.seats[gi]={name:G.seats[gi].name,bot:1};Online.send('seats',{seats:G.seats});render();if(S&&S.win<0&&S.t==gi)tick()}}
    if(t=='act'&&S&&G&&apply(S,d.seat,d.a)){Online.send('state',S);render();tick()}
  }else{
    if(t=='lobby'){clearTimeout(L.t);
      if(!d.seats.some(s=>s&&s.id==myId)){alert('Sala llena');return leave()}
      L.P=d.P;L.seats=d.seats;show('lobby');renderLobby()}
    if(t=='start'){setMode(d.seats.length);G={seats:d.seats,me:d.seats.findIndex(s=>s.id==myId),online:true,host:false};begin(d.S)}
    if(t=='state'&&G){S=d;render()}
    if(t=='seats'&&G){G.seats=d.seats;render()}
    if(t=='close'){L.closed=1;alert('El anfitrión cerró la sala');leave()}
  }}
function backToRoom(){ if(!L)return leave();
  L.started=false;G=null;S=null;drag=null;$('ov').style.display='none';show('lobby');renderLobby();if(L.host)lob()}
function leave(){ if(L){clearTimeout(L.t);if(L.host)Online.send('close',{});else if(!L.closed)Online.send('leave',{id:myId});Online.close(300)}
  L=null;G=null;S=null;drag=null;$('ov').style.display='none';show('menu')}