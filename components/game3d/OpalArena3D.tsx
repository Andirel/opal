'use client';
import {useLayoutEffect,useRef,type ComponentRef} from 'react';
import {Canvas,useThree,useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls,Line} from '@react-three/drei';
import {MOUSE,TOUCH} from 'three';
import type {Game,Team,Order,Pos} from '../../lib/game/engine';
import {Environment3D} from './Environment3D';
import {Creature3D} from './Creature3D';
import {Prism3D} from './Prism3D';
import {ResolutionEffects} from './ResolutionEffects';
import {cellToWorld,worldToCell,previewPath,type Reveal} from './arena-math';

export type ArenaProps={game:Game;team:Team;selected:string;orders:Order[];destinations:Pos[];mode:'move'|'strike';canEdit:boolean;skin:number;reveal:Reveal|null;reducedMotion:boolean;reset:number;onTile:(p:Pos)=>void;onFailure:()=>void};
function TacticalCamera({team,reset}:{team:Team;reset:number}){
 const ref=useRef<ComponentRef<typeof OrbitControls>>(null),{get,size}=useThree();
 const angle=team===0?-.4:Math.PI-.4;
 useLayoutEffect(()=>{
  const camera=get().camera;
  camera.position.set(Math.sin(angle)*19,22,Math.cos(angle)*19);camera.lookAt(0,0,0);
  if('zoom' in camera){camera.zoom=Math.min(size.width/22,size.height/18);camera.updateProjectionMatrix();}
  if(ref.current){ref.current.target.set(0,0,0);ref.current.update();}
 },[get,size.width,size.height,angle,reset]);
 useFrame(()=>{if(ref.current){const target=ref.current.target;target.x=Math.max(-2,Math.min(2,target.x));target.z=Math.max(-2,Math.min(2,target.z));target.y=0;}});
 const fit=Math.min(size.width/22,size.height/18);
 return <OrbitControls ref={ref} makeDefault enableDamping dampingFactor={.12} minZoom={fit*.85} maxZoom={fit*2.3} minPolarAngle={.45} maxPolarAngle={.9} minAzimuthAngle={angle-.25} maxAzimuthAngle={angle+.25} screenSpacePanning={false} mouseButtons={{LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} touches={{ONE:TOUCH.ROTATE,TWO:TOUCH.DOLLY_PAN}}/>;
}
function Scene(props:ArenaProps){
 const {game,team,selected,orders,destinations,mode,canEdit,skin,reveal,reducedMotion,onTile}=props;
 const start=useRef<[number,number]|null>(null);
 const selectedUnit=game.units.find(u=>u.id===selected),order=orders.find(o=>o.id===selected);
 const path=selectedUnit&&order&&canEdit?previewPath(selectedUnit,order.to).map(p=>cellToWorld(p,.065)):[];
 function choose(e:ThreeEvent<PointerEvent>,p?:Pos){
  e.stopPropagation();if(!canEdit||!start.current||Math.hypot(e.clientX-start.current[0],e.clientY-start.current[1])>9)return;
  const cell=p??worldToCell(e.point.x,e.point.z);if(cell)onTile(cell);
 }
 return <group onPointerDown={e=>{start.current=[e.clientX,e.clientY];}}>
  <Environment3D reducedMotion={reducedMotion}/><TacticalCamera team={team} reset={props.reset}/>
  <Prism3D game={game} pulse={!!reveal?.scoreChanged} reducedMotion={reducedMotion}/>
  {reveal&&!reducedMotion&&<ResolutionEffects reveal={reveal}/>}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]} onPointerUp={e=>choose(e)}><planeGeometry args={[15,11]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
  {canEdit&&mode==='move'&&destinations.map(p=><mesh key={`${p.x}-${p.y}`} position={cellToWorld(p,.04)} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.12,.17,20]}/><meshBasicMaterial color="#fbfff2" transparent opacity={.8}/></mesh>)}
  {path.length>1&&<Line points={path} color="#fff8d6" lineWidth={2} dashed dashSize={.14} gapSize={.09}/>}
  {order&&canEdit&&<group position={cellToWorld(order.to)}><mesh position={[0,.18,0]}><cylinderGeometry args={[.03,.03,.35,8]}/><meshBasicMaterial color="#fff8c4"/></mesh><mesh position={[0,.39,0]} scale={.13}><octahedronGeometry/><meshBasicMaterial color="#fff8c4"/></mesh></group>}
  {game.units.filter(u=>u.hp>0||reveal?.units.find(t=>t.after.id===u.id)?.knockout).map(u=><Creature3D key={u.id} unit={u} selected={u.id===selected&&canEdit} targeted={canEdit&&mode==='strike'&&u.team!==team} skin={u.team===team?skin:0} order={u.team===team&&!reveal?orders.find(o=>o.id===u.id):undefined} transition={reveal?.units.find(t=>t.after.id===u.id)} startedAt={reveal?.startedAt} reducedMotion={reducedMotion} onSelect={e=>choose(e,u)}/>)}
 </group>;
}
export default function OpalArena3D(props:ArenaProps){
 return <Canvas orthographic shadows dpr={[1,1.5]} camera={{position:[-8,22,18],near:.1,far:130,zoom:30}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{
   gl.domElement.addEventListener('webglcontextlost',props.onFailure,{once:true});
 }} fallback={<p>WebGL is unavailable. Switch to the accessible tactical view below.</p>}><Scene {...props}/></Canvas>;
}
