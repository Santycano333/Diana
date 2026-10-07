// ===== LÓGICA PURA (reutilizable en servidor para online) =====
let N=11,MID=5,W=10,DUEL=false;const COL=['#6cc04a','#f58a2a','#e0204a','#4f7ff0','#b565f0','#2cc3c3','#ff7ab8','#d0d0d0'];
function setMode(P){DUEL=P==2;N=P<=4?11:17;MID=(N-1)/2;W=P<=4?10:12}
// Meta: en 1vs1 (DUEL) el jugador 0 (abajo) debe llegar a la fila 0 y el 1 (arriba) a la última fila; si no, el centro
const goal=(i,r,c)=>DUEL?r==(i==0?0:N-1):(r==MID&&c==MID);
function starts(P){const m=N-1,c=MID,d=4;
if(P==2)return[[m,c],[0,c]];
if(P==4)return[[m,c],[c,m],[0,c],[c,0]];
if(P==8)return[[m,c],[c+d,c-d],[c,0],[c-d,c-d],[0,c],[c-d,c+d],[c,m],[c+d,c+d]];
return[[m,c],[c,0],[c-d,c-d],[0,c],[c,m],[c+d,c+d]]}
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const newState=P=>({p:starts(P).map(([r,c])=>({r,c})),w:[],left:Array(P).fill(W),t:0,win:-1});
function edges(w){const H=new Set,V=new Set;for(const x of w){if(x.o=='h'){H.add(x.r+','+x.c);H.add(x.r+','+(x.c+1))}else{V.add(x.r+','+x.c);V.add((x.r+1)+','+x.c)}}return{H,V}}
function blk(E,r,c,dr,dc){return dr==1?E.H.has(r+','+c):dr==-1?E.H.has((r-1)+','+c):dc==1?E.V.has(r+','+c):E.V.has(r+','+(c-1))}
const inb=(r,c)=>r>=0&&c>=0&&r<N&&c<N;
function dist(E,r,c,i){const q=[[r,c,0]],s=new Set([r+','+c]);while(q.length){const[a,b,d]=q.shift();if(goal(i,a,b))return d;for(const[dr,dc]of DIRS){const x=a+dr,y=b+dc;if(inb(x,y)&&!blk(E,a,b,dr,dc)&&!s.has(x+','+y)){s.add(x+','+y);q.push([x,y,d+1])}}}return 1e9}
function moves(S,i,E=edges(S.w)){const{r,c}=S.p[i],o=[],occ=(x,y)=>S.p.some(q=>q.r==x&&q.c==y);
for(const[dr,dc]of DIRS){if(blk(E,r,c,dr,dc))continue;let x=r+dr,y=c+dc;if(!inb(x,y))continue;
if(!occ(x,y))o.push({r:x,c:y});else if(inb(x+dr,y+dc)&&!blk(E,x,y,dr,dc)&&!occ(x+dr,y+dc))o.push({r:x+dr,c:y+dc})}return o}
function wallOk(S,o,r,c){if(r<0||c<0||r>N-2||c>N-2)return false;
if(S.w.some(x=>x.r==r&&x.c==c&&x.o!=o))return false;
if(S.w.some(x=>x.o==o&&x.r==r&&Math.abs(x.c-c)<2&&o=='h'))return false;
if(S.w.some(x=>x.o==o&&x.c==c&&Math.abs(x.r-r)<2&&o=='v'))return false;
const E=edges([...S.w,{o,r,c}]);return S.p.every((q,i)=>dist(E,q.r,q.c,i)<1e9)}
function apply(S,i,a){if(S.t!=i||S.win>=0)return false;
if(a.type=='move'){if(!moves(S,i).some(m=>m.r==a.r&&m.c==a.c))return false;S.p[i]={r:a.r,c:a.c};if(goal(i,a.r,a.c)){S.win=i;return true}}
else{if(S.left[i]<1||!wallOk(S,a.o,a.r,a.c))return false;S.w.push({o:a.o,r:a.r,c:a.c,p:i});S.left[i]--}
S.t=(i+1)%S.p.length;return true}
function ai(S,i){const E=edges(S.w),me=S.p[i],md=dist(E,me.r,me.c,i);
let best=null,bd=1e9;for(const m of moves(S,i,E)){const d=dist(E,m.r,m.c,i)+Math.random()*.5;if(d<bd){bd=d;best=m}}
const opp=S.p.map((_,j)=>j).filter(j=>j!=i).map(j=>({j,d:dist(E,S.p[j].r,S.p[j].c,j)})).sort((a,b)=>a.d-b.d)[0];
if(S.left[i]>0&&opp.d<=md-(S.p.length>4?1:-1)){const L=S.p[opp.j];let g=0,bw=null;
for(const o of['h','v'])for(let r=Math.max(0,L.r-4);r<=Math.min(N-2,L.r+3);r++)for(let c=Math.max(0,L.c-4);c<=Math.min(N-2,L.c+3);c++){
if(!wallOk(S,o,r,c))continue;const E2=edges([...S.w,{o,r,c}]);
const gain=dist(E2,L.r,L.c,opp.j)-opp.d-(dist(E2,me.r,me.c,i)-md)*1.5;if(gain>g){g=gain;bw={type:'wall',o,r,c}}}
if(bw&&g>=2)return bw}
return best?{type:'move',...best}:null}