import { FIELD } from './config.js';
export function createInput(canvas,onGesture=()=>{}) {
  const keys=new Set(),actions=[];let coin=null,disable=false;
  addEventListener('keydown',e=>{onGesture();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!keys.has(e.code)){if(['Enter','Space'].includes(e.code))actions.push('confirm');if(e.code==='KeyP')actions.push('pause');if(e.code==='KeyR')actions.push('restart');if(e.code==='KeyE')disable=true;}keys.add(e.code);});
  addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
  canvas.addEventListener('pointerdown',e=>{onGesture();const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/FIELD.width,r.height/FIELD.height);coin={x:(e.clientX-r.left-(r.width-FIELD.width*scale)/2)/scale,y:(e.clientY-r.top-(r.height-FIELD.height*scale)/2)/scale};actions.push('click');});
  return {takeActions(){return actions.splice(0);},sample(){const v={x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),sneak:keys.has('ShiftLeft')||keys.has('ShiftRight'),crack:keys.has('Space'),disable,coin};disable=false;coin=null;return v;},clear(){coin=null;disable=false;}};
}
