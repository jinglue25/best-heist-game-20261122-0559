import { LEVELS } from './levels.js';
import { PLAYER, DETECTION, SCORE } from './config.js';
export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export const angleDiff = (a,b) => Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function segmentHit(ax,ay,bx,by,r) {
  let lo=0,hi=1;
  for (const [a,d,min,max] of [[ax,bx-ax,r.x,r.x+r.w],[ay,by-ay,r.y,r.y+r.h]]) {
    if(Math.abs(d)<1e-8) { if(a<min || a>max) return false; }
    else { let t1=(min-a)/d,t2=(max-a)/d; if(t1>t2) [t1,t2]=[t2,t1]; lo=Math.max(lo,t1); hi=Math.min(hi,t2); if(lo>hi) return false; }
  }
  return true;
}
export function sightClear(s,a,b,camera=false) { return !(camera?s.level.walls:[...s.level.walls,...s.level.cover]).some(r=>segmentHit(a.x,a.y,b.x,b.y,r)); }
export function blocked(s,x,y,r=PLAYER.radius) { return [...s.level.walls,...s.level.cover].some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h); }
// A compact navigation grid lets watchmen actually use doorways when converging.
export function findRoute(s,from,target) {
  const cols=48,rows=21,size=24,origin={x:76,y:160};
  const cell=p=>({x:Math.max(0,Math.min(cols-1,Math.round((p.x-origin.x)/size))),y:Math.max(0,Math.min(rows-1,Math.round((p.y-origin.y)/size)))});
  const point=i=>({x:origin.x+(i%cols)*size,y:origin.y+Math.floor(i/cols)*size});
  const a=cell(from),b=cell(target),start=a.y*cols+a.x,end=b.y*cols+b.x;
  const queue=[start],prev=new Map([[start,-1]]);let found=start,best=Infinity;
  for(let head=0;head<queue.length;head++){
    const n=queue[head],p=point(n),d=distance(p,target);if(d<best){found=n;best=d;}if(n===end)break;
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n%cols+dx,y=Math.floor(n/cols)+dy,k=y*cols+x;if(x<0||x>=cols||y<0||y>=rows||prev.has(k))continue;const v=point(k);if(blocked(s,v.x,v.y,13))continue;prev.set(k,n);queue.push(k);}
  }
  const path=[];for(let n=found;n!==start&&n!==-1;n=prev.get(n))path.unshift(point(n));path.push(target);return path;
}
export function createWorld(random=()=>.5) {
  let state;
  function reset() { state={screen:'title',job:0,totalLoot:0,totalTime:0,totalTrips:0,bank:0,score:0,history:[],events:[]}; load(0); state.screen='title'; }
  function load(index) {
    const l=LEVELS[index]; Object.assign(state,{job:index,level:l,screen:'briefing',player:{...l.start,angle:-Math.PI/2,moving:false,sneak:false},guards:l.guards.map(g=>({...g,points:g.points.map(p=>[...p]),point:1,wait:1,meter:0,mode:'patrol',target:null})),cameras:l.cameras.map((c,i)=>({...c,angle:c.base,phase:i*.9,disabled:0,meter:0})),loot:l.loot.map(l=>({...l,taken:false,progress:0})),lasers:l.lasers.map(l=>({...l,active:false,touch:false})),coins:l.coins,decoys:[],time:0,alarm:0,tripped:false,trips:0,lockdown:0,unseen:0,lastSeen:{...l.start},value:0,pieces:0,message:l.briefing,messageTime:8,cracking:null,events:[],foot:0,tick:0,report:null});
  }
  function emit(name) { state.events.push(name); }
  function message(text,time=4) { state.message=text;state.messageTime=time; }
  function trip() { const s=state;if(s.tripped)return;s.tripped=true;s.trips++;s.lockdown=DETECTION.lockdown;s.lastSeen={...s.player};message('LOCKDOWN — Get to the west van. Twenty seconds.',6);emit('alarm'); }
  function finishJob() {
    const s=state,required=Math.ceil(s.loot.length/2),short=s.pieces<required;
    const timeBonus=Math.round(Math.max(0,SCORE.timeBudget-s.time)*SCORE.timePerSecond)*(short?.25:1);
    const ghost=s.trips===0&&!short?SCORE.ghost:0;
    const score=Math.max(0,Math.round((short?s.value*.5:s.value)+timeBonus+ghost-s.trips*SCORE.tripPenalty));
    s.report={value:s.value,pieces:s.pieces,time:s.time,trips:s.trips,timeBonus:Math.round(timeBonus),ghost,score,short};
    s.history.push(s.report);s.totalLoot+=s.value;s.totalTime+=s.time;s.totalTrips+=s.trips;s.bank+=score;s.score=s.bank;s.screen='done';emit('clear');
  }
  function advance() { if(state.screen==='title'){load(0);}else if(state.screen==='briefing')state.screen='play';else if(state.screen==='failed')load(state.job);else if(state.screen==='done'){if(state.job<2)load(state.job+1);else{state.screen='end';emit('win');}}else if(state.screen==='end'){reset();load(0);} }
  function restart() { load(state.job); }
  function move(body,dx,dy) { if(!blocked(state,body.x+dx,body.y))body.x+=dx;if(!blocked(state,body.x,body.y+dy))body.y+=dy; }
  function step(dt,input={}) {
    const s=state;s.events=[];if(s.screen!=='play')return s.events;
    s.time+=dt;s.messageTime-=dt;s.foot-=dt;s.tick-=dt;
    const p=s.player;let dx=input.x||0,dy=input.y||0;const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
    p.sneak=!!input.sneak;p.moving=len>0;
    if(len){p.angle=Math.atan2(dy,dx);move(p,dx*(p.sneak?PLAYER.sneakSpeed:PLAYER.speed)*dt,dy*(p.sneak?PLAYER.sneakSpeed:PLAYER.speed)*dt);if(s.foot<=0){s.foot=p.sneak?.52:.3;emit('step');}}
    if(input.coin&&s.coins>0){const target={x:input.coin.x,y:input.coin.y};const d=distance(p,target);if(d>260){target.x=p.x+(target.x-p.x)*260/d;target.y=p.y+(target.y-p.y)*260/d;}if(!blocked(s,target.x,target.y,3)&&sightClear(s,p,target,true)){s.coins--;s.decoys.push({...target,life:5});emit('coin');for(const g of s.guards)if(distance(g,target)<420&&!s.tripped){g.mode='investigate';g.target={...target};g.wait=0;}message('A little distraction. Keep moving.');}}
    s.decoys=s.decoys.filter(c=>(c.life-=dt)>0);
    if(input.disable){const c=s.cameras.find(c=>distance(p,c.terminal)<48);if(c){c.disabled=10;c.meter=0;emit('zap');message('Camera loop interrupted. Ten seconds.');}else message('Find a brass terminal beside a camera.');}
    for(const c of s.cameras){c.disabled=Math.max(0,c.disabled-dt);c.angle=c.base+Math.sin(s.time*c.speed+c.phase)*c.sweep;}
    for(const g of s.guards){
      if(s.tripped){g.mode='chase';g.target=s.lastSeen;}
      else if(g.mode==='chase'){g.mode='search';g.wait=3;g.target={...s.lastSeen};}
      if(g.wait>0){g.wait-=dt;g.angle+=Math.sin(s.time*2)*dt*.3;if(g.wait<=0&&g.mode!=='patrol'){g.mode='patrol';g.target=null;}}
      else {
        const goal=g.target||{x:g.points[g.point][0],y:g.points[g.point][1]};
        if(distance(g,goal)<10){g.route=null;if(g.mode==='patrol'){g.point=(g.point+1)%g.points.length;g.wait=g.pause;}else{g.wait=3;g.target=null;g.mode='search';}}
        else {
          g.repath=(g.repath||0)-dt;
          const obstructed=[...s.level.walls,...s.level.cover].some(r=>segmentHit(g.x,g.y,goal.x,goal.y,{x:r.x-12,y:r.y-12,w:r.w+24,h:r.h+24}));
          if(obstructed&&(!g.route||g.repath<=0)){g.route=findRoute(s,g,goal);g.repath=.8;}
          if(!obstructed)g.route=null;
          if(g.route)while(g.route.length>1&&distance(g,g.route[0])<8)g.route.shift();
          const t=g.route?.[0]||goal;g.angle=Math.atan2(t.y-g.y,t.x-g.x);
          move(g,Math.cos(g.angle)*g.speed*(s.tripped?1.8:1)*dt,Math.sin(g.angle)*g.speed*(s.tripped?1.8:1)*dt);
        }
      }
    }
    let danger=0,seeing=false;
    for(const o of [...s.guards,...s.cameras]){
      const cam='base'in o,range=cam?DETECTION.cameraRange:DETECTION.guardRange,d=distance(p,o);
      const seen=(!cam||o.disabled<=0)&&d<range*(p.sneak?.82:1)&&Math.abs(angleDiff(Math.atan2(p.y-o.y,p.x-o.x),o.angle))<DETECTION.halfAngle&&sightClear(s,o,p,cam);
      if(seen){seeing=true;const lit=s.level.lamps.some(l=>distance(p,l)<l.r*.62);const rate=DETECTION.rise*(cam?1.6:1)*(1+(1-d/range))*(p.sneak?.5:1)*(p.moving?1.12:.85)*(lit?1.2:1);o.meter=Math.min(1,o.meter+dt*rate/65);danger=Math.max(danger,rate);s.lastSeen={x:p.x,y:p.y};}
      else o.meter=Math.max(0,o.meter-dt*.5);
    }
    if(seeing){s.unseen=0;s.alarm=Math.min(100,s.alarm+danger*dt);if(s.tick<=0){emit('detect');s.tick=.12+(1-s.alarm/100)*.4;}}
    else {s.unseen+=dt;if(s.unseen>1.5)s.alarm=Math.max(0,s.alarm-DETECTION.decay*dt);}
    for(const l of s.lasers){l.active=(s.time+l.phase)%l.period<l.on;const touch=l.active&&Math.abs(p.x-l.x1)<19&&p.y>l.from&&p.y<l.to;if(touch&&!l.touch){s.alarm=Math.min(100,s.alarm+40);s.lastSeen={...p};emit('laser');message('Tripwire crossed. Alarm +40%.');}l.touch=touch;}
    s.cracking=null;const target=s.loot.find(l=>!l.taken&&distance(p,l)<43&&(l.kind!=='vault'||s.pieces===s.loot.length-1));
    if(target){s.cracking=target;if(input.crack){target.progress+=dt;if(target.progress>=target.time){target.taken=true;s.value+=target.value;s.pieces++;emit('loot');message(`${target.name} secured. $${target.value.toLocaleString()}.`);if(target.kind==='vault'){s.alarm=Math.min(100,s.alarm+25);message('The core is yours. Security pulse +25%. Make your exit.',6);}}}}
    for(const l of s.loot)if(l!==target&&!l.taken)l.progress=Math.max(0,l.progress-dt*.4);
    if(s.alarm>=100)trip();
    if(s.tripped){s.lockdown-=dt;if(s.unseen>5&&s.alarm<55){s.tripped=false;message('Lockdown lifted. Patrols are returning.');}else if(s.lockdown<=0||s.guards.some(g=>distance(p,g)<22)){s.screen='failed';message(s.lockdown<=0?'The shutters sealed the exchange.':'A watchman caught Wren.');emit('fail');}}
    s.score=s.bank+s.value;
    const e=s.level.exit;if(s.screen==='play'&&p.x>e.x&&p.x<e.x+e.w&&p.y>e.y&&p.y<e.y+e.h)finishJob();
    return s.events;
  }
  reset();return {get state(){return state;},reset,load,advance,restart,step,finishJob,random};
}
