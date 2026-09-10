import {W,H,inside,shell,same,objective,type Pos,type Game,type Team,type Order,type Unit} from '../../lib/game/engine.ts';

export const REVEAL_MS=5000;
export type WorldPoint=[number,number,number];
export function cellToWorld(p:Pos,height=0):WorldPoint {return [p.x-(W-1)/2,height,p.y-(H-1)/2];}
export function worldToCell(x:number,z:number):Pos|null {
  if(!Number.isFinite(x)||!Number.isFinite(z)||x < -W/2||x >= W/2||z < -H/2||z >= H/2)return null;
  return {x:Math.floor(x+W/2),y:Math.floor(z+H/2)};
}
// A display route, not an additional movement rule. Only static public cover is consulted.
export function previewPath(from:Pos,to:Pos):Pos[] {
  if(!inside(from)||!inside(to)||shell(to))return [];
  const queue:Pos[][]=[[{x:from.x,y:from.y}]],seen=new Set([`${from.x},${from.y}`]);
  while(queue.length){const path=queue.shift()!,p=path[path.length-1];if(same(p,to))return path;
    for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){const q={x:p.x+dx,y:p.y+dy},key=`${q.x},${q.y}`;
      if(inside(q)&&!shell(q)&&!seen.has(key)){seen.add(key);queue.push([...path,q]);}}
  }return [];
}
export type UnitTransition={before?:Unit;after:Unit;path:Pos[];hit:boolean;knockout:boolean;respawn:boolean;recoil:boolean;action?:Order['action']};
export type Reveal={key:number;startedAt:number;units:UnitTransition[];scoreChanged:boolean};
// Call ONLY with engine.view(...) or the already-filtered room payload. Disappearing
// enemies are deliberately omitted. Newly revealed enemies have no historical path.
export function deriveReveal(previous:Game,next:Game,team:Team,ownOrders:Order[],startedAt:number):Reveal {
  return {key:next.round,startedAt,scoreChanged:previous.score.some((s,i)=>s!==next.score[i]),units:next.units.map(after=>{
    const before=previous.units.find(u=>u.id===after.id);
    const knownBefore=before?.hp?before:undefined;
    const order=after.team===team?ownOrders.find(o=>o.id===after.id):undefined;
    const path=knownBefore&&after.hp?previewPath(knownBefore,after):[{x:after.x,y:after.y}];
    return {before:knownBefore,after,path,hit:!!knownBefore&&after.hp<knownBefore.hp,
      knockout:!!knownBefore&&!after.hp,respawn:!!before&&!before.hp&&!!after.hp,
      recoil:!!order&&!!knownBefore&&same(knownBefore,after)&&!same(order.to,after),action:order?.action};
  })};
}
export function pathPosition(path:Pos[],progress:number):WorldPoint {
  if(!path.length)return [0,0,0];const n=Math.max(0,Math.min(1,progress))*(path.length-1),i=Math.floor(n),a=cellToWorld(path[i]),b=cellToWorld(path[Math.min(i+1,path.length-1)]);
  return [a[0]+(b[0]-a[0])*(n-i),0,a[2]+(b[2]-a[2])*(n-i)];
}
export function prismStatus(game:Game):'unclaimed'|'mint'|'coral'|'contested' {
  const mint=game.units.some(u=>u.hp>0&&u.team===0&&objective(u)),coral=game.units.some(u=>u.hp>0&&u.team===1&&objective(u));
  return mint&&coral?'contested':mint?'mint':coral?'coral':'unclaimed';
}
