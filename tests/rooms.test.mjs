import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createRoomHandlers} from '../lib/game/rooms.ts';
import {defaults} from '../lib/game/engine.ts';
function setup(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_small_sue_storm.sql',import.meta.url),'utf8'));const adapter={
 prepare(sql){
  return {bind(...args){
   return {
    async first(){return db.prepare(sql).get(...args)??null},
    async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}}}
   };
  }};
 }
};const h=createRoomHandlers(()=>adapter);return {db,async post(body,token=''){const r=await h.POST(new Request('https://test/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)}));return {status:r.status,...await r.json()}},async get(code,token){const r=await h.GET(new Request(`https://test/api/rooms?code=${code}`,{headers:{Authorization:`Bearer ${token}`}}));return {status:r.status,...await r.json()}}}}
test('private room lifecycle: create, join, secret lock, simultaneous resolution, resume, forfeit',async()=>{const {post,get,db}=setup();const host=await post({action:'create'});assert.equal(host.status,200);assert.equal(host.code.length,6);assert.equal(host.team,0);assert.equal(host.joined,false);const stored=db.prepare('SELECT * FROM rooms').get();assert.notEqual(stored.host,host.token);const guest=await post({action:'join',code:host.code});assert.equal(guest.team,1);assert.equal(guest.joined,true);assert.equal((await post({action:'join',code:host.code})).status,400);assert.equal((await get(host.code,'bad-token')).status,400);
const first=await post({action:'orders',code:host.code,round:1,orders:defaults(host.game,0)},host.token);assert.equal(first.ready,true);assert.equal(first.game.round,1);const opponent=await get(host.code,guest.token);assert.equal(opponent.opponentReady,true);assert.equal('orders0' in opponent,false);assert.equal('token' in opponent,false);const second=await post({action:'orders',code:host.code,round:1,orders:defaults(guest.game,1)},guest.token);assert.equal(second.game.round,2);assert.equal(second.ready,false);assert.equal(second.opponentReady,false);assert.equal((await get(host.code,host.token)).game.round,2);assert.equal((await post({action:'orders',code:host.code,round:1,orders:defaults(host.game,0)},host.token)).status,400);const ended=await post({action:'forfeit',code:host.code},guest.token);assert.equal(ended.game.winner,0);db.close()});
test('orders cannot be changed once locked and rooms expire',async()=>{const {post,get,db}=setup();const host=await post({action:'create'});await post({action:'join',code:host.code});const orders=defaults(host.game,0);await post({action:'orders',code:host.code,round:1,orders},host.token);orders[0].to={x:2,y:3};await post({action:'orders',code:host.code,round:1,orders},host.token);const stored=db.prepare('SELECT orders0 FROM rooms WHERE code=?').get(host.code);assert.equal(JSON.parse(stored.orders0)[0].to.x,1);db.prepare('UPDATE rooms SET expires=0').run();assert.equal((await get(host.code,host.token)).status,404);db.close()});
test('concurrent player submissions resolve exactly once or report a retry',async()=>{const {post,get,db}=setup();const a=await post({action:'create'}),b=await post({action:'join',code:a.code});const submit=(p)=>post({action:'orders',code:a.code,round:1,orders:defaults(p.game,p.team)},p.token);const results=await Promise.all([submit(a),submit(b)]);for(let i=0;i<2;i++)if(results[i].status!==200)await submit(i===0?a:b);const state=await get(a.code,a.token);assert.equal(state.game.round,2);assert.equal(state.ready,false);db.close()});
