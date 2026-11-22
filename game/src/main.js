import { STEP, BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';
const params=new URLSearchParams(location.search),seed=Number.parseInt(params.get('seed')||'3107',10)||3107;
const canvas=document.getElementById('game'),status=document.getElementById('status');
const world=createWorld(createRandom(seed)),renderer=createRenderer(canvas),audio=createAudio();
let best=0;try{best=Number(localStorage.getItem(BEST_KEY))||0;}catch{}
const shot=params.get('shot');
if(shot){stageShot(shot,world);renderer.draw(world.state,Math.max(best,world.state.bank));requestAnimationFrame(()=>{renderer.draw(world.state,Math.max(best,world.state.bank));window.__shotReady=true;});}
else{
  const input=createInput(canvas,audio.unlock);let last=performance.now(),acc=0,previous='';
  function events(){for(const e of world.state.events)audio.event(e,world.state);world.state.events=[];}
  function frame(now){requestAnimationFrame(frame);acc+=Math.min(.2,(now-last)/1000);last=now;
    for(const a of input.takeActions()){const screen=world.state.screen;if(a==='restart'&&screen!=='title'&&screen!=='end')world.restart();else if(a==='pause'&&['play','paused'].includes(screen))world.state.screen=screen==='play'?'paused':'play';else if((a==='confirm'||a==='click')&&screen!=='play'){if(screen==='paused')world.state.screen='play';else world.advance();input.clear();events();}}
    if(world.state.screen==='play'){if(acc>=STEP){const controls=input.sample();while(acc>=STEP){world.step(STEP,controls);events();controls.coin=null;controls.disable=false;acc-=STEP;if(world.state.screen!=='play')break;}}}else acc=0;
    if(world.state.screen==='end'&&world.state.bank>best){best=world.state.bank;try{localStorage.setItem(BEST_KEY,String(best));}catch{}}
    if(previous!==world.state.screen){previous=world.state.screen;status.textContent=`${previous}. ${world.state.level.name}. ${world.state.message}`;}
    audio.update(world.state);renderer.draw(world.state,best);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&world.state.screen==='play')world.state.screen='paused';});requestAnimationFrame(frame);
}
