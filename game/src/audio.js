// Entirely synthetic sound; missing or suspended audio is harmless.
export function createAudio() {
  let ctx=null,lastAlarm=0;
  function unlock(){try{ctx ||= new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});}catch{}}
  function tone(freq,time=.1,type='sine',volume=.04,delay=0,end=freq){try{if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+time);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+time);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+time+.02);}catch{}}
  const arp=(notes,vol=.05)=>notes.forEach((n,i)=>tone(n,.28,'sine',vol,i*.09));
  function event(name,s){if(name==='step')tone(s.player.sneak?95:130,.035,'triangle',.015);if(name==='loot')arp([440,554,659,880].map(n=>n*(1+s.pieces*.09)));if(name==='coin')arp([1800,2400,1600],.025);if(name==='detect')tone(450+s.alarm*8,.055,'triangle',.025);if(name==='zap')tone(950,.25,'sawtooth',.025,0,65);if(name==='laser'||name==='fail')tone(190,.4,'sawtooth',.04,0,60);if(name==='clear')arp([330,440,554,660,880]);if(name==='win')arp([262,330,392,523,659,784,1046]);}
  function update(s){if(ctx&&s.screen==='play'&&s.tripped&&ctx.currentTime-lastAlarm>.7){lastAlarm=ctx.currentTime;tone(420,.3,'sawtooth',.025,0,650);tone(650,.3,'sawtooth',.025,.34,420);}}
  return {unlock,event,update};
}
