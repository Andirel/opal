import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,view,SHELLS,shell,same} from '../lib/game/engine.ts';
import {cellToWorld,worldToCell,previewPath,deriveReveal,pathPosition,prismStatus} from '../components/game3d/arena-math.ts';

test('all 165 logical cell centers round-trip exactly; half-open edges reject outside pointers',()=>{
  for(let x=0;x<15;x++)for(let y=0;y<11;y++){const [wx,,wz]=cellToWorld({x,y});assert.deepEqual(worldToCell(wx,wz),{x,y});}
  assert.equal(worldToCell(7.5,0),null);assert.equal(worldToCell(-7.51,0),null);assert.equal(worldToCell(0,5.5),null);assert.equal(worldToCell(NaN,0),null);
  assert.deepEqual(worldToCell(-7.5,-5.5),{x:0,y:0});
});
test('display paths never cross shells and use orthogonal steps',()=>{
  const path=previewPath({x:3,y:2},{x:5,y:2});assert.ok(path.length>3);
  path.forEach((p,i)=>{assert.equal(shell(p),false);if(i)assert.equal(Math.abs(p.x-path[i-1].x)+Math.abs(p.y-path[i-1].y),1);});
  for(const p of SHELLS)assert.deepEqual(previewPath({x:1,y:1},p),[]);
  assert.deepEqual(pathPosition(path,1),cellToWorld({x:5,y:2}));
});
test('reveal drops concealed enemies and never reconstructs newly revealed history or rival orders',()=>{
  const a=initial(),b=initial();b.round++;
  Object.assign(b.units[3],{x:4,y:1});
  const reveal=deriveReveal(view(a,0),view(b,0),0,[],0);
  assert.equal(reveal.units.some(u=>u.after.id==='1-0'),false);
  const reverse=deriveReveal(view(b,0),view(a,0),0,[],0).units.find(u=>u.after.id==='1-0');
  assert.equal(reverse.before,undefined);assert.equal(reverse.path.length,1);assert.equal(reverse.action,undefined);
});
test('presentation derives hit, knockout, respawn, own canceled route and score without mutating games',()=>{
  const a=initial(),b=structuredClone(a);b.round++;b.units[0].hp=0;b.units[0].respawn=1;b.score[1]=1;
  const snapshot=JSON.stringify([a,b]);const r=deriveReveal(a,b,0,[{id:'0-1',to:{x:2,y:5},action:'guard'}],42);
  assert.equal(r.units[0].hit,true);assert.equal(r.units[0].knockout,true);assert.equal(r.units[1].recoil,true);assert.equal(r.scoreChanged,true);assert.equal(r.startedAt,42);
  assert.equal(JSON.stringify([a,b]),snapshot);assert.equal(deriveReveal(b,a,0,[],0).units[0].respawn,true);
});
test('prism presentation uses the same five public scoring cells',()=>{
  const g=initial();assert.equal(prismStatus(g),'unclaimed');Object.assign(g.units[0],{x:7,y:4});assert.equal(prismStatus(g),'mint');Object.assign(g.units[3],{x:8,y:5});assert.equal(prismStatus(g),'contested');
  assert.ok(same({x:7,y:4},g.units[0]));
});
