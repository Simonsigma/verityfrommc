import * as THREE from 'three';

const BLOCKS = {
  grass:{name:'Трава',drop:'dirt',hardness:.55,tool:null,color:0xffffff}, dirt:{name:'Земля',hardness:.45,color:0xffffff}, stone:{name:'Камень',drop:'cobblestone',hardness:3,tool:'pickaxe',tier:1}, cobblestone:{name:'Булыжник',hardness:2.5,tool:'pickaxe'}, sand:{name:'Песок',hardness:.45}, log:{name:'Дерево',hardness:2,tool:'axe'}, leaves:{name:'Листва',hardness:.25}, planks:{name:'Доски',hardness:1.5,tool:'axe'}, coal:{name:'Угольная руда',drop:'coal',hardness:3,tool:'pickaxe',tier:1}, iron:{name:'Железная руда',drop:'iron_ore',hardness:3.5,tool:'pickaxe',tier:2}, gold:{name:'Золотая руда',drop:'gold_ore',hardness:3.5,tool:'pickaxe',tier:3}, diamond:{name:'Алмазная руда',drop:'diamond',hardness:4,tool:'pickaxe',tier:3}, water:{name:'Вода',solid:false,hardness:0}
};
const ITEMS = {
  dirt:{name:'Земля',block:'dirt',color:'#79502e'}, grass:{name:'Дёрн',block:'grass',color:'#65a83c'}, stone:{name:'Камень',block:'stone',color:'#858585'}, cobblestone:{name:'Булыжник',block:'cobblestone',color:'#777'}, sand:{name:'Песок',block:'sand',color:'#d8c77d'}, log:{name:'Дерево',block:'log',color:'#80512e'}, leaves:{name:'Листва',block:'leaves',color:'#477b31'}, planks:{name:'Доски',block:'planks',color:'#b1814a'}, coal:{name:'Уголь',color:'#282828'}, iron_ore:{name:'Железная руда',color:'#b18a72'}, gold_ore:{name:'Золотая руда',color:'#e6bd35'}, diamond:{name:'Алмаз',color:'#57d6d4'}, wood_pick:{name:'Деревянная кирка',tool:'pickaxe',tier:1,color:'#9b673b'}, stone_pick:{name:'Каменная кирка',tool:'pickaxe',tier:2,color:'#999'}, iron_pick:{name:'Железная кирка',tool:'pickaxe',tier:3,color:'#c7c7c7'}, stone_axe:{name:'Каменный топор',tool:'axe',tier:2,color:'#999'}, wool:{name:'Шерсть',color:'#eee'}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const key=(x,y,z)=>`${x},${y},${z}`;

function hash(x,z,seed=1){let n=Math.imul(x,374761393)+Math.imul(z,668265263)+Math.imul(seed,1442695041);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function smoothNoise(x,z,seed){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;const u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);const a=hash(ix,iz,seed),b=hash(ix+1,iz,seed),c=hash(ix,iz+1,seed),d=hash(ix+1,iz+1,seed);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,u),THREE.MathUtils.lerp(c,d,u),v);}
function terrain(x,z,seed){return Math.floor(4+smoothNoise(x*.055,z*.055,seed)*5+smoothNoise(x*.018,z*.018,seed+4)*7);}

class TextureFactory {
  static make(type){
    const c=document.createElement('canvas');c.width=c.height=16;const ctx=c.getContext('2d');
    const palettes={grass:['#579b35','#65a83d','#4b8c2e'],dirt:['#79502e','#875a34','#684126'],stone:['#777','#888','#666','#999'],log:['#704323','#81512b','#60391f'],leaves:['#315f29','#3f7930','#508c38'],sand:['#d7c47a','#e4d28a','#cbb66c'],planks:['#a97945','#bb8a50','#95673b'],cobblestone:['#666','#777','#858585','#555'],coal:['#777','#242424','#333'],iron:['#777','#b58b73','#986d59'],gold:['#777','#e6c34d','#c99c26'],diamond:['#777','#5ee0d5','#39b8b4'],water:['#397fc0','#4e9bd8','#286eb0']};
    const p=palettes[type]||palettes.stone;ctx.fillStyle=p[0];ctx.fillRect(0,0,16,16);
    if(type==='grassSide'){ctx.fillStyle='#579b35';ctx.fillRect(0,0,16,3);ctx.fillStyle='#65a83d';for(let x=0;x<16;x+=3)ctx.fillRect(x,2,1,2);ctx.fillStyle='#79502e';ctx.fillRect(0,4,16,12);for(let i=0;i<28;i++){ctx.fillStyle=['#875a34','#684126','#79502e'][i%3];ctx.fillRect((i*7)%16,4+(i*11)%12,1,1);}}
    if(type==='logTop'){ctx.fillStyle='#81512b';ctx.fillRect(0,0,16,16);ctx.strokeStyle='#54341f';ctx.lineWidth=1;ctx.strokeRect(2,2,12,12);ctx.strokeRect(5,5,6,6);ctx.fillStyle='#9a693b';ctx.fillRect(7,7,2,2);}
    if(type==='grass'){ctx.fillStyle=p[1];for(let x=0;x<16;x++)ctx.fillRect(x,0,1,2);ctx.fillStyle=p[2];for(let i=0;i<30;i++)ctx.fillRect((i*7)%16,(i*11)%16,1,1);}
    else if(type==='log'){for(let x=1;x<16;x+=4){ctx.fillStyle=p[x%3];ctx.fillRect(x,0,1,16);}}
    else if(type==='leaves'){for(let i=0;i<85;i++){ctx.fillStyle=p[i%p.length];ctx.fillRect((i*13)%16,(i*7)%16,1+(i%5===0),1);}}
    else {for(let i=0;i<48;i++){ctx.fillStyle=p[(i*7)%p.length];ctx.fillRect((i*5+3)%16,(i*11+1)%16,1+(i%9===0),1+(i%13===0));}}
    if(['coal','iron','gold','diamond'].includes(type)){ctx.fillStyle=p[1];for(let i=0;i<12;i++){let x=(i*7+2)%15,y=(i*11+3)%15;ctx.fillRect(x,y,2,2);}}
    const tex=new THREE.CanvasTexture(c);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestMipmapNearestFilter;tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
}

class World {
  constructor(scene,seed=7421){this.scene=scene;this.seed=seed;this.blocks=new Map();this.chunks=new Map();this.materials={};this.meshes=[];this.makeMaterials();}
  makeMaterials(){for(const t of ['grass','dirt','stone','log','leaves','sand','planks','cobblestone','coal','iron','gold','diamond','water']){this.materials[t]=new THREE.MeshLambertMaterial({map:TextureFactory.make(t),transparent:t==='leaves'||t==='water',opacity:t==='water'?.68:1,alphaTest:t==='leaves'?.35:0,side:THREE.FrontSide});}
    const topTex=TextureFactory.make('logTop');this.materials.logTop=new THREE.MeshLambertMaterial({map:topTex});this.materials.grassSide=new THREE.MeshLambertMaterial({map:TextureFactory.make('grassSide')});this.materials.grassFaces=[this.materials.grassSide,this.materials.grassSide,this.materials.grass,this.materials.dirt,this.materials.grassSide,this.materials.grassSide];this.materials.logFaces=[this.materials.log,this.materials.log,this.materials.logTop,this.materials.logTop,this.materials.log,this.materials.log];}
  get(x,y,z){return this.blocks.get(key(x,y,z))||null;}
  set(x,y,z,type){const k=key(x,y,z);if(type)this.blocks.set(k,type);else this.blocks.delete(k);this.rebuildChunk(Math.floor(x/16),Math.floor(z/16));}
  generateChunk(cx,cz){const ck=`${cx},${cz}`;if(this.chunks.has(ck)&&this.chunks.get(ck)!==false)return;this.chunks.set(ck,true);
    for(let lx=0;lx<16;lx++)for(let lz=0;lz<16;lz++){const x=cx*16+lx,z=cz*16+lz,h=terrain(x,z,this.seed);const beach=h<=5;
      for(let y=0;y<=h;y++){let type=y===h?(beach?'sand':'grass'):(y>h-3?(beach?'sand':'dirt'):'stone');if(y<h-3&&y<8){const r=hash(x+y*13,z-y*7,this.seed);if(r>.994)type='diamond';else if(r>.984)type='gold';else if(r>.963)type='iron';else if(r>.925)type='coal';}this.blocks.set(key(x,y,z),type);}
      if(h<5)for(let wy=h+1;wy<=5;wy++)this.blocks.set(key(x,wy,z),'water');
      if(!beach&&h>5&&hash(x,z,this.seed+90)>.982)this.makeTree(x,h+1,z);
    }
    this.rebuildChunk(cx,cz);
  }
  makeTree(x,y,z){const height=4+Math.floor(hash(x,z,this.seed+8)*3);for(let i=0;i<height;i++)this.blocks.set(key(x,y+i,z),'log');for(let dy=height-2;dy<=height+1;dy++){const radius=dy===height+1?1:2;for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){if(Math.abs(dx)+Math.abs(dz)>radius*2+1)continue;const k=key(x+dx,y+dy,z+dz);if(!this.blocks.has(k))this.blocks.set(k,'leaves');}}}
  ensureAround(x,z,r=3){const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)this.generateChunk(cx+dx,cz+dz);for(const [ck,ch] of this.chunks){const [qx,qz]=ck.split(',').map(Number);if(Math.max(Math.abs(qx-cx),Math.abs(qz-cz))>r+1&&ch?.group){this.scene.remove(ch.group);ch.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});this.chunks.set(ck,false);}}}
  rebuildChunk(cx,cz){const ck=`${cx},${cz}`;const old=this.chunks.get(ck);if(old?.group){this.scene.remove(old.group);old.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    const group=new THREE.Group();const byType={};const dummy=new THREE.Object3D();
    for(let lx=0;lx<16;lx++)for(let z=0;z<16;z++){const x=cx*16+lx,zz=cz*16+z;for(let y=0;y<40;y++){const type=this.get(x,y,zz);if(!type)continue;if(!byType[type])byType[type]=[];byType[type].push([x,y,zz]);}}
    for(const [type,arr] of Object.entries(byType)){const material=type==='grass'?this.materials.grassFaces:(type==='log'?this.materials.logFaces:this.materials[type]);const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,arr.length);mesh.userData.instances=arr;mesh.userData.blockType=type;mesh.castShadow=type!=='water';mesh.receiveShadow=true;arr.forEach((p,i)=>{dummy.position.set(p[0]+.5,p[1]+.5,p[2]+.5);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;group.add(mesh);}
    this.scene.add(group);this.chunks.set(ck,{group});
  }
  solidAt(x,y,z){const b=this.get(x,y,z);return !!b&&BLOCKS[b]?.solid!==false;}
  collides(min,max){for(let x=Math.floor(min.x);x<=Math.floor(max.x);x++)for(let y=Math.floor(min.y);y<=Math.floor(max.y);y++)for(let z=Math.floor(min.z);z<=Math.floor(max.z);z++)if(this.solidAt(x,y,z))return true;return false;}
  raycast(raycaster){let best=null;for(const ch of this.chunks.values()){if(!ch.group)continue;for(const mesh of ch.group.children){const hits=raycaster.intersectObject(mesh,false);if(hits.length){const h=hits[0];if(!best||h.distance<best.distance){const p=mesh.userData.instances[h.instanceId];best={...h,x:p[0],y:p[1],z:p[2],type:mesh.userData.blockType,normal:h.face.normal.clone()};}}}}return best;}
  save(){return {seed:this.seed,blocks:[...this.blocks.entries()]};}
  load(data){this.seed=data.seed||this.seed;this.blocks=new Map(data.blocks||[]);for(const c of this.chunks.values())if(c.group){this.scene.remove(c.group);c.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}this.chunks.clear();const keys=new Set([...this.blocks.keys()].map(k=>{const [x,,z]=k.split(',').map(Number);return `${Math.floor(x/16)},${Math.floor(z/16)}`;}));for(const ck of keys){const [x,z]=ck.split(',').map(Number);this.chunks.set(ck,true);this.rebuildChunk(x,z);}}
}

class Inventory {
  constructor(){this.slots=Array.from({length:36},()=>null);this.selected=0;this.cursor=null;this.add('stone_axe',1);this.add('dirt',24);this.add('planks',12);}
  add(id,count=1){let left=count;for(let i=0;i<this.slots.length&&left;i++){const s=this.slots[i];if(s&&s.id===id&&s.count<64){const n=Math.min(left,64-s.count);s.count+=n;left-=n;}}for(let i=0;i<this.slots.length&&left;i++)if(!this.slots[i]){const n=Math.min(left,64);this.slots[i]={id,count:n};left-=n;}return left===0;}
  take(id,n=1){for(const s of this.slots)if(s&&s.id===id){const a=Math.min(n,s.count);s.count-=a;n-=a;if(!s.count)this.slots[this.slots.indexOf(s)]=null;if(!n)return true;}return false;}
  held(){return this.slots[this.selected];}
  save(){return {slots:this.slots,selected:this.selected};}
  load(d){if(d?.slots)this.slots=d.slots;this.selected=d?.selected||0;}
}

class Physics {
  constructor(world){this.world=world;}
  bounds(pos,height=1.8,r=.3){return {min:new THREE.Vector3(pos.x-r,pos.y,pos.z-r),max:new THREE.Vector3(pos.x+r,pos.y+height,pos.z+r)};}
  checkCollision(pos,height=1.8){const b=this.bounds(pos,height);return this.world.collides(b.min,b.max);}
  resolveCollision(pos,axis,delta,height=1.8){const next=pos.clone();next[axis]+=delta;if(!this.checkCollision(next,height)){pos[axis]=next[axis];return false;}let lo=0,hi=Math.abs(delta),sign=Math.sign(delta);for(let i=0;i<12;i++){const mid=(lo+hi)/2;next.copy(pos);next[axis]+=sign*mid;if(this.checkCollision(next,height))hi=mid;else lo=mid;}pos[axis]+=sign*Math.max(0,lo-.001);return true;}
  checkGround(pos){const p=pos.clone();p.y-=.055;return this.checkCollision(p);}
  applyGravity(player,dt){player.velocity.y-=22*dt;}
  movePlayer(player,delta){const p=player.position;this.resolveCollision(p,'x',delta.x);this.resolveCollision(p,'z',delta.z);const hitY=this.resolveCollision(p,'y',delta.y);if(hitY){if(delta.y<0)player.onGround=true;player.velocity.y=0;}else player.onGround=this.checkGround(p);}
}

class Mob {
  constructor(game,x,y,z){this.game=game;this.position=new THREE.Vector3(x,y,z);this.velocity=new THREE.Vector3();this.group=new THREE.Group();this.game.scene.add(this.group);this.time=Math.random()*10;this.direction=Math.random()*Math.PI*2;this.turnTimer=2+Math.random()*4;this.health=3;this.dead=false;}
  wander(dt,speed=.65){this.turnTimer-=dt;if(this.turnTimer<=0){this.direction+=(Math.random()-.5)*2.4;this.turnTimer=2+Math.random()*4;}const target=this.position.clone().add(new THREE.Vector3(Math.sin(this.direction),0,Math.cos(this.direction)).multiplyScalar(speed*dt));if(this.game.world.solidAt(Math.floor(target.x),Math.floor(this.position.y),Math.floor(target.z))||!this.game.world.solidAt(Math.floor(target.x),Math.floor(this.position.y)-1,Math.floor(target.z)))this.direction+=Math.PI*(.5+Math.random());else this.position.copy(target);this.group.rotation.y=this.direction;}
  update(dt){this.time+=dt;this.wander(dt);this.group.position.copy(this.position);}
  hit(from){this.health--;this.velocity.copy(this.position).sub(from).setY(.22).normalize().multiplyScalar(4);this.flash=0.22;if(this.health<=0)this.die();}
  die(){this.dead=true;this.game.scene.remove(this.group);}
}
class Sheep extends Mob {
  constructor(game,x,y,z){super(game,x,y,z);this.health=4;this.build();}
  build(){const mat=new THREE.MeshLambertMaterial({color:0xf0eee5});const face=new THREE.MeshLambertMaterial({color:0x343434});const add=(w,h,d,x,y,z,m=mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;this.group.add(o);return o;};add(.85,.65,.55,0,.75,0);add(.48,.48,.48,0,1.05,.43,mat);add(.08,.08,.04,-.13,1.12,.68,face);add(.08,.08,.04,.13,1.12,.68,face);this.legs=[];for(const x of [-.28,.28])for(const z of [-.18,.18])this.legs.push(add(.16,.42,.16,x,.28,z));}
  update(dt){super.update(dt);this.legs.forEach((l,i)=>l.rotation.x=Math.sin(this.time*7+i*Math.PI)*.35);}
  die(){this.game.inventory.add('wool',1+Math.floor(Math.random()*2));super.die();}
}
class Verity extends Mob {
  constructor(game,x,y,z){super(game,x,y,z);this.health=999999;this.mode='wander';this.build();this.helloTimer=2;this.reaction=0;this.hitFlash=0;this.speechTimer=6;}
  build(){const yellow=new THREE.MeshLambertMaterial({color:0xffd928,emissive:0x8b6500,emissiveIntensity:.32});const black=new THREE.MeshBasicMaterial({color:0x090909});const body=new THREE.Mesh(new THREE.SphereGeometry(.49,12,10),yellow);body.scale.set(1,1,1);body.position.y=.68;body.castShadow=true;this.group.add(body);this.body=body;
    const eye=(x)=>{const e=new THREE.Mesh(new THREE.BoxGeometry(.075,.095,.035),black);e.position.set(x,.79,.435);this.group.add(e);};eye(-.16);eye(.16);
    const smile=new THREE.Mesh(new THREE.BoxGeometry(.31,.045,.035),black);smile.position.set(0,.55,.445);this.group.add(smile);
    this.legs=[];for(const x of [-.27,.27])for(const z of [-.24,.24]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.13,.25,.13),yellow);leg.position.set(x,.16,z);leg.castShadow=true;this.group.add(leg);this.legs.push(leg);}
    const glow=new THREE.PointLight(0xffdf36,.38,3);glow.position.y=.7;this.group.add(glow);
    this.label=document.createElement('div');this.label.className='hello';this.label.textContent='HELLO';this.game.helloLayer.appendChild(this.label);
  }
  update(dt){this.time+=dt;this.helloTimer-=dt;this.speechTimer-=dt;this.reaction=Math.max(0,this.reaction-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);
    const player=this.game.player.position;const toPlayer=player.clone().sub(this.position);const dist=toPlayer.length();const looking=this.game.isLookingAt(this.position.clone().add(new THREE.Vector3(0,.7,0)));
    if(looking&&dist<13){this.mode='shy';this.reaction=Math.max(this.reaction,.3);}else if(dist>2.8&&dist<18)this.mode='approach';else this.mode='wander';
    if(this.mode==='approach'){const dir=toPlayer.setY(0).normalize();this.position.addScaledVector(dir,dt*.72);}
    else if(this.mode==='shy'){const dir=toPlayer.setY(0).normalize();this.position.addScaledVector(dir,-dt*.48);}
    else this.wander(dt,.42);
    this.position.y=this.game.world.surfaceY(Math.floor(this.position.x),Math.floor(this.position.z))+0.02;
    this.group.position.copy(this.position);const faceAngle=Math.atan2(player.x-this.position.x,player.z-this.position.z);this.group.rotation.y=THREE.MathUtils.lerp(this.group.rotation.y,faceAngle,dt*2.4);
    this.body.position.y=.68+Math.sin(this.time*2.5)*.035+(this.mode==='shy'?.025:0);this.body.rotation.z=Math.sin(this.time*1.5)*.035;this.legs.forEach((l,i)=>l.rotation.x=Math.sin(this.time*7+i*Math.PI)*.32);
    if(this.hitFlash>0)this.body.material.color.setHex(0xff7777);else this.body.material.color.setHex(0xffd928);
    if(this.helloTimer<=0){this.helloTimer=4+Math.random()*4;if(Math.random()<.75)this.game.audio.hello();}
    if(this.speechTimer<=0){this.speechTimer=10+Math.random()*12;this.game.audio.hello();}
    const screen=this.position.clone().add(new THREE.Vector3(0,1.55,0)).project(this.game.camera);this.label.style.left=`${(screen.x*.5+.5)*innerWidth}px`;this.label.style.top=`${(-screen.y*.5+.5)*innerHeight}px`;this.label.style.display=screen.z<1?'block':'none';
  }
  hit(from){this.hitFlash=.25;this.velocity.copy(this.position).sub(from).setY(.25).normalize().multiplyScalar(3.3);this.position.add(this.velocity.clone().multiplyScalar(.08));this.game.audio.hit();}
  die(){}
}

class AudioManager {
  constructor(){this.ctx=null;}
  ensure(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();}
  tone(freq,duration=.12,type='square',volume=.035,slide=0){this.ensure();const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.ctx.currentTime);if(slide)o.frequency.linearRampToValueAtTime(freq+slide,this.ctx.currentTime+duration);g.gain.setValueAtTime(volume,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+duration);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+duration);}
  hello(){this.tone(520,.09,'sine',.025,80);setTimeout(()=>this.tone(660,.13,'sine',.022,-90),100);}
  hit(){this.tone(130,.08,'square',.04,-45);}
  break(){this.tone(170,.05,'square',.025,-40);}
}

class Game {
  constructor(root,{onExit}){this.root=root;this.onExit=onExit;this.settings={sensitivity:1.2,renderDistance:2};this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x8fc5ee);this.scene.fog=new THREE.Fog(0x8fc5ee,28,90);this.camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,130);this.renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;root.prepend(this.renderer.domElement);this.clock=new THREE.Clock();this.audio=new AudioManager();this.helloLayer=document.querySelector('#hello-layer');this.inventory=new Inventory();this.world=new World(this.scene);this.physics=new Physics(this.world);this.player={position:new THREE.Vector3(0,14,0),velocity:new THREE.Vector3(),onGround:false,yaw:0,pitch:0};this.mobs=[];this.particles=[];this.keys={};this.pointerLocked=false;this.running=false;this.paused=false;this.mineTime=0;this.target=null;this.breaking=false;this.lastSave=0;this.setupScene();this.setupEvents();this.setupUI();this.viewModel=new THREE.Group();this.camera.add(this.viewModel);this.viewModel.position.set(.48,-.48,-.85);this.viewModel.rotation.set(-.25,.35,.15);this.viewModelMeshes=[];this.updateViewModel();}
  setupScene(){const hemi=new THREE.HemisphereLight(0xd9efff,0x66734a,1.05);this.scene.add(hemi);const sun=new THREE.DirectionalLight(0xfff1d4,1.25);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;this.scene.add(sun);this.sun=sun;
    const sky=new THREE.Mesh(new THREE.SphereGeometry(110,16,12),new THREE.MeshBasicMaterial({color:0x8fc5ee,side:THREE.BackSide}));this.scene.add(sky);const sunBall=new THREE.Mesh(new THREE.BoxGeometry(7,7,1),new THREE.MeshBasicMaterial({color:0xfff4c1}));sunBall.position.set(-45,42,-65);this.scene.add(sunBall);
    this.clouds=new THREE.Group();const cm=new THREE.MeshLambertMaterial({color:0xffffff});for(let i=0;i<12;i++){const cloud=new THREE.Group();for(let j=0;j<4;j++){const b=new THREE.Mesh(new THREE.BoxGeometry(5,1,3),cm);b.position.set(j*3,Math.random()*.3,Math.random()*2);cloud.add(b);}cloud.position.set((Math.random()-.5)*100,32+Math.random()*7,(Math.random()-.5)*100);this.clouds.add(cloud);}this.scene.add(this.clouds);
  }
  setupEvents(){this.onResize=()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);};addEventListener('resize',this.onResize);
    addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code.startsWith('Digit')){const n=Number(e.code.slice(5))-1;if(n>=0&&n<9){this.inventory.selected=n;this.renderHotbar();}}if(e.code==='KeyE'&&this.running)this.toggleInventory();if(e.code==='Escape'&&this.running){if(this.inventoryOpen)this.toggleInventory(false);else this.togglePause();}});
    addEventListener('keyup',e=>this.keys[e.code]=false);
    this.renderer.domElement.addEventListener('wheel',e=>{if(!this.running)return;this.inventory.selected=(this.inventory.selected+(e.deltaY>0?1:8))%9;this.renderHotbar();},{passive:true});
    this.renderer.domElement.addEventListener('click',()=>{if(this.running&&!this.paused&&!this.inventoryOpen&&innerWidth>700)this.renderer.domElement.requestPointerLock();});
    document.addEventListener('pointerlockchange',()=>{this.pointerLocked=document.pointerLockElement===this.renderer.domElement;});
    document.addEventListener('mousemove',e=>{if(!this.pointerLocked||!this.running||this.paused)return;this.player.yaw-=e.movementX*.002*this.settings.sensitivity;this.player.pitch=clamp(this.player.pitch-e.movementY*.002*this.settings.sensitivity,-1.52,1.52);});
    this.renderer.domElement.addEventListener('mousedown',e=>{if(e.button===0){this.leftDown=true;this.audio.ensure();this.swing=0.22;}if(e.button===2){e.preventDefault();this.placeBlock();}});addEventListener('mouseup',e=>{if(e.button===0)this.leftDown=false;});this.renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
    document.querySelector('#resume').onclick=()=>this.togglePause(false);document.querySelector('#save-exit').onclick=()=>{this.save();this.stop();this.onExit();};
    this.setupTouch();this.onResize();
  }
  setupTouch(){const joy=document.querySelector('#joystick'),nub=joy.firstElementChild;let active=false,start={x:0,y:0};joy.addEventListener('pointerdown',e=>{active=true;start={x:e.clientX,y:e.clientY};joy.setPointerCapture(e.pointerId);});joy.addEventListener('pointermove',e=>{if(!active)return;const dx=clamp(e.clientX-start.x,-32,32),dy=clamp(e.clientY-start.y,-32,32);nub.style.transform=`translate(${dx}px,${dy}px)`;this.touchMove={x:dx/32,y:dy/32};});const end=()=>{active=false;nub.style.transform='';this.touchMove={x:0,y:0};};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
    let look=null;this.renderer.domElement.addEventListener('touchstart',e=>{if(e.touches.length===1&&e.touches[0].clientX>innerWidth*.38)look={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});this.renderer.domElement.addEventListener('touchmove',e=>{if(!look)return;const t=[...e.touches].find(t=>t.clientX>innerWidth*.38);if(!t)return;this.player.yaw-=(t.clientX-look.x)*.006;this.player.pitch=clamp(this.player.pitch-(t.clientY-look.y)*.006,-1.5,1.5);look={x:t.clientX,y:t.clientY};},{passive:true});this.renderer.domElement.addEventListener('touchend',()=>look=null);
    document.querySelectorAll('[data-action]').forEach(b=>{const a=b.dataset.action;b.addEventListener('pointerdown',e=>{e.preventDefault();if(a==='jump')this.keys.Space=true;if(a==='mine'){this.leftDown=true;this.audio.ensure();}if(a==='place')this.placeBlock();});b.addEventListener('pointerup',()=>{if(a==='jump')this.keys.Space=false;if(a==='mine')this.leftDown=false;});b.addEventListener('pointercancel',()=>{if(a==='jump')this.keys.Space=false;if(a==='mine')this.leftDown=false;});});}
  setupUI(){this.hotbar=document.querySelector('#hotbar');this.invPanel=document.querySelector('#inventory');this.invGrid=document.querySelector('#inventory-grid');this.pausePanel=document.querySelector('#pause');this.renderHotbar();}
  start(load){
    if(this.running)return;
    this.running=true;this.paused=false;this.inventoryOpen=false;
    this.pausePanel.classList.add('hidden');this.invPanel.classList.add('hidden');
    // Не генерируем стартовый мир дважды: сначала выбираем/создаём мир, затем один раз строим чанки.
    if(load){
      const raw=localStorage.getItem('verity-world');
      if(raw){
        this.load();
        this.world.ensureAround(this.player.position.x,this.player.position.z,this.settings.renderDistance);
      }else{
        this.createNewWorld();
      }
    }else this.createNewWorld();
    if(!this.mobs.length)this.spawnMobs();
    this.clock.getDelta();this.onResize();this.animate();
  }
  createNewWorld(){
    for(const ch of this.world.chunks.values())if(ch?.group)this.scene.remove(ch.group);
    for(const m of this.mobs){this.scene.remove(m.group);if(m.label)m.label.remove();}
    this.mobs=[];
    this.world=new World(this.scene,Math.floor(Math.random()*999999));
    this.physics=new Physics(this.world);
    this.world.ensureAround(0,0,this.settings.renderDistance);
    this.player.position.set(.5,this.world.surfaceY(0,0)+.05,.5);
    this.player.velocity.set(0,0,0);this.player.onGround=false;
    this.player.yaw=0;this.player.pitch=0;
    this.inventory=new Inventory();this.renderHotbar();
    this.spawnMobs();
  }
  spawnMobs(){const v=new Verity(this,7,this.world.surfaceY(7,5)+.02,5);this.mobs.push(v);for(let i=0;i<7;i++){const x=Math.floor(Math.random()*24-12),z=Math.floor(Math.random()*24-12);this.mobs.push(new Sheep(this,x,this.world.surfaceY(x,z)+.02,z));}}
  animate(){if(!this.running)return;requestAnimationFrame(()=>this.animate());const dt=Math.min(this.clock.getDelta(),.05);if(!this.paused&&!this.inventoryOpen){this.update(dt);}this.renderer.render(this.scene,this.camera);}
  update(dt){this.world.ensureAround(this.player.position.x,this.player.position.z,this.settings.renderDistance);this.movePlayer(dt);this.updateCamera();for(const m of [...this.mobs]){m.update(dt);if(m.dead){this.mobs.splice(this.mobs.indexOf(m),1);if(m.label)m.label.remove();}}this.updateMining(dt);this.updateParticles(dt);this.clouds.position.x+=dt*.35;this.renderTarget();}
  movePlayer(dt){const p=this.player;const forward=new THREE.Vector3(-Math.sin(p.yaw),0,-Math.cos(p.yaw));const right=new THREE.Vector3(Math.cos(p.yaw),0,-Math.sin(p.yaw));let x=0,z=0;if(this.keys.KeyW)z++;if(this.keys.KeyS)z--;if(this.keys.KeyA)x--;if(this.keys.KeyD)x++;if(this.touchMove){x+=this.touchMove.x;z-=this.touchMove.y;}const move=right.multiplyScalar(x).add(forward.multiplyScalar(z));if(move.lengthSq()>1)move.normalize();const speed=this.keys.ShiftLeft?.3:4.5;const delta=move.multiplyScalar(speed*dt);p.velocity.x=delta.x;p.velocity.z=delta.z;if((this.keys.Space||this.jumpQueued)&&p.onGround){p.velocity.y=8.2;p.onGround=false;}this.jumpQueued=false;this.physics.applyGravity(p,dt);this.physics.movePlayer(p,new THREE.Vector3(p.velocity.x,p.velocity.y*dt,p.velocity.z));if(p.position.y< -20){p.position.set(.5,terrain(0,0,this.world.seed)+3,.5);p.velocity.set(0,0,0);}}
  updateCamera(){this.camera.position.copy(this.player.position).add(new THREE.Vector3(0,1.62,0));this.camera.rotation.order='YXZ';this.camera.rotation.y=this.player.yaw;this.camera.rotation.x=this.player.pitch;if(this.swing>0){this.swing=Math.max(0,this.swing-.016);this.viewModel.rotation.x=-.25+Math.sin((.22-this.swing)/.22*Math.PI)*.8;}else this.viewModel.rotation.x=-.25;this.viewModel.position.x=.48+Math.sin(performance.now()*.006)*.012;}
  isLookingAt(pos){const dir=new THREE.Vector3();this.camera.getWorldDirection(dir);const to=pos.clone().sub(this.camera.position);return dir.dot(to.normalize())>.985;}
  ray(){this.camera.updateMatrixWorld();const r=new THREE.Raycaster();r.setFromCamera(new THREE.Vector2(0,0),this.camera);r.far=5.5;return r;}
  renderTarget(){const hit=this.world.raycast(this.ray());this.target=hit;document.querySelector('#target-name').textContent=hit?BLOCKS[hit.type]?.name||hit.type:'';}
  updateMining(dt){if(!this.leftDown)return;const hit=this.world.raycast(this.ray());if(!hit){this.mineTime=0;return;}const mob=this.mobs.find(m=>m.position.distanceTo(this.camera.position)<2.2&&this.isLookingAt(m.position.clone().add(new THREE.Vector3(0,.6,0))));if(mob){if(!this.mobHitCooldown){mob.hit(this.player.position);this.mobHitCooldown=.35;}this.mobHitCooldown=Math.max(0,(this.mobHitCooldown||0)-dt);return;}
    const block=BLOCKS[hit.type];if(!block||block.solid===false)return;const held=this.inventory.held(),tool=held&&ITEMS[held.id];if(block.tool&&(!tool||tool.tool!==block.tool||((block.tier||1)>(tool.tier||0)))){this.mineTime=0;return;}const speed=tool?.tool===block.tool?1.8:1;this.mineTime+=dt*speed/block.hardness;if(this.mineTime>=1){const drop=block.drop||hit.type;if(drop!=='water')this.inventory.add(drop,1);this.world.set(hit.x,hit.y,hit.z,null);this.spawnParticles(hit.x+.5,hit.y+.5,hit.z+.5,hit.type);this.audio.break();this.mineTime=0;this.renderHotbar();}
    const bar=document.querySelector('#break-progress');bar.style.display='block';bar.firstElementChild.style.width=`${Math.min(100,this.mineTime*100)}%`;
  }
  placeBlock(){if(!this.running||this.paused||this.inventoryOpen)return;const hit=this.world.raycast(this.ray()),held=this.inventory.held();if(!hit||!held||!ITEMS[held.id]?.block)return;const n=hit.normal;const x=hit.x+Math.round(n.x),y=hit.y+Math.round(n.y),z=hit.z+Math.round(n.z);if(this.world.get(x,y,z))return;const box=this.physics.bounds(this.player.position);if(x>=box.min.x&&x<=box.max.x&&y>=box.min.y&&y<=box.max.y&&z>=box.min.z&&z<=box.max.z)return;if(!this.inventory.take(held.id,1))return;this.world.set(x,y,z,ITEMS[held.id].block);this.renderHotbar();}
  spawnParticles(x,y,z,type){const color=ITEMS[type]?.color||'#aaa';for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.08),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);m.userData.v=new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3);m.userData.life=.45+Math.random()*.25;this.scene.add(m);this.particles.push(m);}}
  updateParticles(dt){for(const p of [...this.particles]){p.userData.life-=dt;p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=8*dt;if(p.userData.life<=0){this.scene.remove(p);p.geometry.dispose();p.material.dispose();this.particles.splice(this.particles.indexOf(p),1);}}}
  renderHotbar(){this.hotbar.innerHTML='';for(let i=0;i<9;i++){const s=this.inventory.slots[i],el=document.createElement('div');el.className='slot'+(i===this.inventory.selected?' selected':'');if(s){const item=ITEMS[s.id];el.innerHTML=`<span class="swatch" style="background:${item?.color||'#aaa'}"></span><small>${s.count}</small>`;}this.hotbar.append(el);}this.renderHeld();}
  renderHeld(){this.updateViewModel();}
  updateViewModel(){if(!this.viewModel)return;for(const m of this.viewModelMeshes){this.viewModel.remove(m);m.geometry.dispose();m.material.dispose();}this.viewModelMeshes=[];const s=this.inventory.held();if(!s)return;const item=ITEMS[s.id],mat=new THREE.MeshLambertMaterial({color:item?.color||'#999'}),wood=new THREE.MeshLambertMaterial({color:0x76502f});const add=(w,h,d,x,y,z,m=mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;this.viewModel.add(o);this.viewModelMeshes.push(o);};if(item?.tool){add(.075,.48,.075,0,-.12,0,wood);add(.34,.1,.09,.08,.08,0,mat);if(item.tool==='axe')add(.18,.22,.1,.19,.02,0,mat);}else add(.27,.27,.27,0,0,0,mat); }
  toggleInventory(force){this.inventoryOpen=force??!this.inventoryOpen;this.invPanel.classList.toggle('hidden',!this.inventoryOpen);if(this.inventoryOpen){document.exitPointerLock?.();this.renderInventory();}else this.renderHotbar();}
  renderInventory(){this.invGrid.innerHTML='';this.inventory.slots.forEach((s,i)=>{const el=document.createElement('div');el.className='inv-slot';if(s){const item=ITEMS[s.id];el.style.background=`linear-gradient(135deg,${item?.color||'#999'},#555)`;el.innerHTML=`<small>${s.count}</small>`;el.title=item?.name||s.id;}el.draggable=!!s;el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',String(i)));el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));const a=this.inventory.slots[from],b=this.inventory.slots[i];if(a&&b&&a.id===b.id&&b.count<64){const n=Math.min(a.count,64-b.count);b.count+=n;a.count-=n;if(!a.count)this.inventory.slots[from]=null;}else{this.inventory.slots[from]=b;this.inventory.slots[i]=a;}this.renderInventory();this.renderHotbar();});el.addEventListener('click',()=>{if(i<9){this.inventory.selected=i;this.renderHotbar();}});this.invGrid.append(el);});}
  togglePause(force){this.paused=force??!this.paused;this.pausePanel.classList.toggle('hidden',!this.paused);if(this.paused){document.exitPointerLock?.();this.save();}}
  save(){const data={world:this.world.save(),player:{position:this.player.position.toArray(),yaw:this.player.yaw,pitch:this.player.pitch},inventory:this.inventory.save()};try{localStorage.setItem('verity-world',JSON.stringify(data));}catch(e){console.warn('Не удалось сохранить мир',e);}}
  load(){try{const d=JSON.parse(localStorage.getItem('verity-world'));if(!d)return;this.world.load(d.world);this.player.position.fromArray(d.player.position);this.player.yaw=d.player.yaw||0;this.player.pitch=d.player.pitch||0;this.inventory.load(d.inventory);this.mobs=[];this.spawnMobs();this.renderHotbar();}catch(e){console.warn('Сохранение повреждено',e);}}
  stop(){this.save();this.running=false;this.paused=true;this.leftDown=false;document.exitPointerLock?.();}
}

// Высота поверхности используется только мобами и точкой появления, физика игрока проверяет каждый блок.
World.prototype.surfaceY=function(x,z){for(let y=38;y>=0;y--)if(this.get(x,y,z)&&this.get(x,y,z)!=='leaves')return y+1;return 1;};
export { Game };
