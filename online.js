// Capa de red: Supabase Realtime Broadcast (sin tablas, sin servidor propio)
const Online={
  init(){ if(typeof supabase==='undefined'||SUPA_URL.startsWith('PEGA'))return false;
    this.sb=this.sb||supabase.createClient(SUPA_URL,SUPA_KEY);return true},
  open(code,onMsg,onReady){ this.close();
    this.ch=this.sb.channel('bullseye-'+code);
    this.ch.on('broadcast',{event:'m'},p=>onMsg(p.payload)).subscribe(s=>{if(s==='SUBSCRIBED')onReady()})},
  send(t,d){ if(this.ch)this.ch.send({type:'broadcast',event:'m',payload:{t,d}})},
  close(delay){ const ch=this.ch;if(!ch)return;this.ch=null;const f=()=>this.sb.removeChannel(ch);delay?setTimeout(f,delay):f()}
};