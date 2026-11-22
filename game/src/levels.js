// Every room is laid out by hand. Rectangles serve both drawing and collision.
const rim = [{x:48,y:132,w:1184,h:16},{x:48,y:640,w:1184,h:16},{x:48,y:132,w:16,h:508},{x:1216,y:132,w:16,h:524}];
const split = [{x:430,y:148,w:18,h:292},{x:430,y:550,w:18,h:90},{x:916,y:148,w:18,h:150},{x:916,y:408,w:18,h:232}];
const desk = (x,y,w=90,h=44) => ({x,y,w,h});
const loot = (x,y,name,value,time=1.7,kind='case') => ({x,y,name,value,time,kind});
const guard = (x,y,points,speed=52,pause=1.4,angle=Math.PI) => ({x,y,points,speed,pause,angle});
const camera = (x,y,base,sweep=.7,speed=.38) => ({x,y,base,sweep,speed,terminal:{x:x-8,y:y+30}});
export const LEVELS = [
  { name:'Gallery Wing', subtitle:'THE QUIET ACQUISITION', briefing:'Four treasures. Two watchmen. Take your time, use the plinths, and leave through the west loading bay.',
    rooms:[{x:64,y:148,w:366,h:492,name:'WEST COLLECTION'},{x:448,y:148,w:468,h:492,name:'THE MAIN GALLERY'},{x:934,y:148,w:282,h:492,name:'PRIVATE EXHIBITION'}],
    walls:[...rim,...split], cover:[desk(235,325,105,58),desk(540,300,95,54),desk(720,460,105,54),desk(1015,460,100,50)],
    lamps:[{x:300,y:215,r:160},{x:670,y:380,r:200},{x:1080,y:260,r:150}],
    guards:[guard(690,430,[[690,430],[690,570],[850,570],[850,220],[660,220]],48,1.8),guard(1080,350,[[1080,350],[1000,350],[1050,570],[1150,240]],46,2)],
    cameras:[camera(800,160,Math.PI/2,.75,.42)], lasers:[],
    loot:[loot(320,490,'Amber reliquary',1200),loot(290,205,'The blue hour',1800,2.3,'painting'),loot(565,225,'Ivory chronometer',1600),loot(1100,220,'Meridian diamond',3200,3)],
    start:{x:230,y:570},exit:{x:75,y:532,w:100,h:78},coins:3 },
  { name:'Counting House', subtitle:'NOT ALL MONEY MAKES NOISE', briefing:'The ledgers hide a strongbox. Time the red doorway, and switch off a camera at its brass terminal.',
    rooms:[{x:64,y:148,w:366,h:492,name:'CLERKS’ HALL'},{x:448,y:148,w:468,h:492,name:'COUNTING FLOOR'},{x:934,y:148,w:282,h:492,name:'RESERVE OFFICE'}],
    walls:[...rim,...split,{x:630,y:148,w:18,h:125},{x:934,y:430,w:170,h:14}],
    cover:[desk(230,310,120,56),desk(520,340,100,50),desk(720,480,120,50),desk(1000,520,90,45)],
    lamps:[{x:280,y:220,r:150},{x:770,y:330,r:180},{x:1090,y:560,r:140}],
    guards:[guard(600,430,[[600,430],[500,560],[860,560],[860,310]],57),guard(1100,310,[[1100,310],[980,350],[1130,590]],56),guard(330,240,[[330,240],[150,240],[150,460],[370,460]],50)],
    cameras:[camera(790,160,1.6),camera(1198,470,Math.PI,.6,.5)],
    lasers:[{x1:430,y1:490,x2:448,y2:490,vertical:true,from:440,to:550,period:5,on:2.8,phase:1}],
    loot:[loot(310,535,'Payroll bonds',1800),loot(190,200,'Bearer certificates',2100),loot(540,220,'Gold reserves',2500),loot(830,260,'Exchange ledger',1800),loot(1110,210,'Director’s strongbox',4800,5,'strongbox')],
    start:{x:230,y:590},exit:{x:75,y:532,w:100,h:78},coins:3 },
  { name:'The Meridian Vault', subtitle:'ONE LAST IMPOSSIBLE THING', briefing:'The vault is the prize. Its release wakes the building. Plan your route back before you turn the final dial.',
    rooms:[{x:64,y:148,w:366,h:492,name:'SECURITY ANNEX'},{x:448,y:148,w:468,h:492,name:'HALL OF RESERVES'},{x:934,y:148,w:282,h:492,name:'MERIDIAN VAULT'}],
    walls:[...rim,...split,{x:650,y:148,w:18,h:150},{x:650,y:410,w:18,h:100}],
    cover:[desk(245,340,100,65),desk(510,450,90,60),desk(740,330,100,60),desk(1030,480,90,52)],
    lamps:[{x:250,y:220,r:145},{x:760,y:540,r:190},{x:1080,y:280,r:165}],
    guards:[guard(560,560,[[560,560],[800,560],[850,440],[700,420]],61),guard(810,240,[[810,240],[710,240],[710,300],[880,300]],58),guard(1100,400,[[1100,400],[1000,350],[1140,240],[1140,570]],60),guard(330,220,[[330,220],[150,220],[150,450],[360,450]],56)],
    cameras:[camera(560,160,1.4),camera(895,540,Math.PI*1.15,.8,.48),camera(1198,200,2.5,.7,.45)],
    lasers:[{vertical:true,x1:430,y1:495,x2:448,y2:495,from:440,to:550,period:5,on:3,phase:0},{vertical:true,x1:916,y1:350,x2:934,y2:350,from:298,to:408,period:4,on:2.4,phase:2}],
    loot:[loot(310,550,'Black opal',2400),loot(210,200,'Sealed warrants',1900),loot(535,250,'Platinum seals',3200),loot(780,210,'Sovereign bonds',3800),loot(1090,575,'Reserve ingots',4500,3),loot(1090,230,'The Meridian core',12000,7,'vault')],
    start:{x:230,y:590},exit:{x:75,y:532,w:100,h:78},coins:4 }
];
