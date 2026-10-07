// Chat de la sala (lobby + partida) sobre el mismo canal de Supabase
let chatLog=[],chatUnread=0,chatOpen=false,chatLast=0,chatToastT;
const chatEsc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chatVis(id){ const on=typeof L!=='undefined'&&L&&id!='menu';
  $('chatbtn').style.display=on?'flex':'none';
  if(!on){chatOpen=false;$('chatp').style.display='none'}}
function chatReset(){chatLog=[];chatUnread=0;chatOpen=false;$('chatp').style.display='none';$('chatlog').innerHTML='';$('chatbadge').style.display='none';$('chattoast').style.display='none'}
function chatToggle(){ chatOpen=!chatOpen;$('chatp').style.display=chatOpen?'flex':'none';
  if(chatOpen){chatUnread=0;$('chatbadge').style.display='none';$('chattoast').style.display='none';chatScroll();$('chatin').focus()}}
function chatScroll(){const l=$('chatlog');l.scrollTop=l.scrollHeight}
function addChat(m){ chatLog.push(m);if(chatLog.length>100)chatLog.shift();
  const line=`<div><b style="color:${COL[m.i]||'#aaa'}">${chatEsc(m.name)}:</b> ${chatEsc(m.text)}</div>`;
  $('chatlog').insertAdjacentHTML('beforeend',line);if($('chatlog').children.length>100)$('chatlog').firstChild.remove();
  if(chatOpen)chatScroll();
  else if(m.id!=myId){chatUnread++;$('chatbadge').textContent=chatUnread>9?'9+':chatUnread;$('chatbadge').style.display='flex';
    const t=$('chattoast');t.innerHTML=line;t.style.display='block';clearTimeout(chatToastT);chatToastT=setTimeout(()=>t.style.display='none',4000)}}
function chatSend(){ const inp=$('chatin'),text=inp.value.trim().slice(0,120);
  if(!text||!L||Date.now()-chatLast<500)return;chatLast=Date.now();
  const seat=L.seats.findIndex(s=>s&&s.id==myId),m={id:myId,name:myName(),text,i:seat};
  inp.value='';addChat(m);Online.send('chat',m)}
$('chatin').addEventListener('keydown',e=>{if(e.key=='Enter')chatSend()});