'use client';
import {useRef} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Billboard} from '@react-three/drei';
import {Group,Mesh} from 'three';
import {STATS,type Unit,type Order} from '../../lib/game/engine';
import {cellToWorld,pathPosition,REVEAL_MS,type UnitTransition} from './arena-math';

function Body({unit,skin}:{unit:Unit;skin:number}) {
 const team=unit.team===0?'#87e6c6':'#f19a91',shell=['#aeeedc','#635076','#e4d5b6'][skin]??'#aeeedc';
 return <group>
  <mesh scale={unit.kind==='Veyl'?[.29,.22,.45]:unit.kind==='Rookit'?[.36,.3,.36]:[.19,.14,.45]} castShadow><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color={unit.kind==='Rookit'?shell:team} roughness={.36} metalness={.18}/></mesh>
  {unit.kind==='Veyl'&&<><mesh position={[0,.12,.32]} scale={[.22,.2,.24]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#e1d8e8"/></mesh>{[-1,1].flatMap(s=>[0,1].map(i=><mesh key={`${s}-${i}`} position={[s*(.14+i*.08),.33,.28-i*.2]} rotation={[.25,0,s*-.25]} scale={[.08,.28,.08]} castShadow><coneGeometry args={[1,1,4]}/><meshStandardMaterial color={i?team:'#615779'}/></mesh>))}<mesh position={[0,.04,-.55]} rotation={[-.7,0,0]} scale={[.11,.12,.35]}><octahedronGeometry/><meshStandardMaterial color="#686482"/></mesh></>}
  {unit.kind==='Rookit'&&<><mesh position={[0,.23,-.04]} scale={[.37,.4,.35]} castShadow><sphereGeometry args={[1,24,16]}/><meshPhysicalMaterial color={shell} roughness={.26} metalness={.3} iridescence={.7} clearcoat={.7}/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[0,.22,-.04]} rotation={[0,i*Math.PI/5,0]} scale={[.38,.42,.36]}><torusGeometry args={[1,.027,5,24,Math.PI]}/><meshStandardMaterial color={skin===1?'#c4a9e8':'#fff0d4'} metalness={.4} roughness={.3}/></mesh>)}<mesh position={[0,.03,.34]} scale={[.23,.14,.15]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#55486c"/></mesh></>}
  {unit.kind==='Klyra'&&<>{[-1,1].map(s=><mesh key={s} position={[s*.3,0,-.02]} rotation={[0,s*-.35,s*-.15]} scale={[.5,.055,.32]} castShadow><octahedronGeometry/><meshStandardMaterial color={team} emissive={team} emissiveIntensity={.25} transparent opacity={.9} metalness={.25} roughness={.3}/></mesh>)}{[-1,0,1].map(s=><mesh key={s} position={[s*.13,-.08,-.53]} rotation={[-.3,s*.3,0]}><cylinderGeometry args={[.014,.006,.6,5]}/><meshStandardMaterial color="#c5fff0" emissive="#89dabf" emissiveIntensity={.7}/></mesh>)}<mesh position={[0,.2,.19]} scale={[.12,.23,.08]}><octahedronGeometry/><meshStandardMaterial color="#e7d7f5"/></mesh></>}
  {unit.kind!=='Klyra'&&[-1,1].flatMap(s=>[-1,1].map(t=><mesh key={`${s}-${t}`} position={[s*.24,-.19,t*.25]} scale={[.09,.12,.17]} castShadow><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color="#5d5371"/></mesh>))}
  {[-1,1].map(s=><mesh key={s} position={[s*.105,unit.kind==='Veyl'?.2:.08,.43]}><sphereGeometry args={[.038,8,8]}/><meshBasicMaterial color="#fff8ce"/></mesh>)}
 </group>;
}
export function Creature3D({unit,selected,targeted,skin,order,transition,startedAt,reducedMotion,onSelect}:{unit:Unit;selected:boolean;targeted:boolean;skin:number;order?:Order;transition?:UnitTransition;startedAt?:number;reducedMotion:boolean;onSelect:(e:ThreeEvent<PointerEvent>)=>void}){
 const root=useRef<Group>(null),body=useRef<Group>(null),shield=useRef<Mesh>(null),impact=useRef<Mesh>(null);
 const color=unit.team===0?'#8ef4d0':'#ff9c8f';
 useFrame(({clock})=>{
  if(!root.current||!body.current)return;
  const t=startedAt===undefined?1:Math.min(1,(performance.now()-startedAt)/REVEAL_MS),moving=!!transition&&t<.48,attack=!!transition&&t>.5&&t<.68;
  const p=transition?pathPosition(transition.path,Math.min(1,t/.48)):cellToWorld(unit);
  root.current.position.set(p[0],0,p[2]);
  const entering=transition?.respawn?Math.min(1,t*3):1,leaving=transition?.knockout?1-Math.max(0,(t-.72)/.2):1;
  root.current.scale.setScalar(Math.max(0,Math.min(entering,leaving)));
  root.current.visible=!!unit.hp||!!transition?.knockout&&t<.92;
  const idle=reducedMotion?0:Math.sin(clock.elapsedTime*(unit.kind==='Klyra'?2:2.8)+Number(unit.id.slice(-1)))*.025;
  body.current.position.y=(unit.kind==='Klyra'?.65:.36)+idle+(moving&&!reducedMotion?Math.abs(Math.sin(t*65))*.07:0);
  const recoil=transition?.recoil&&t<.48?Math.sin(t/.48*Math.PI)*-.18:0;
  body.current.position.z=recoil+(attack&&transition?.action==='strike'?Math.sin((t-.5)/.18*Math.PI)*.24:0);
  body.current.rotation.z=transition?.hit&&t>.62&&t<.78?Math.sin(t*100)*.18:0;
  if(shield.current)shield.current.visible=order?.action==='guard'||transition?.action==='guard';
  if(impact.current){impact.current.visible=!!transition?.hit&&t>.63&&t<.83;impact.current.scale.setScalar(1+(t-.63)*4);}
 });
 return <group ref={root} position={cellToWorld(unit)}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.04,0]}><ringGeometry args={[selected?.44:.34,selected?.49:.37,32]}/><meshBasicMaterial color={selected?'#fffde3':color} transparent opacity={.9}/></mesh>
  {targeted&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.045,0]}><ringGeometry args={[.52,.58,4]}/><meshBasicMaterial color="#ff807e"/></mesh>}
  <group ref={body} rotation={[0,unit.team===0?Math.PI/2:-Math.PI/2,0]}><Body unit={unit} skin={skin}/></group>
  <mesh ref={shield} position={[0,.43,0]} scale={[.54,.55,.54]}><sphereGeometry args={[1,16,12]}/><meshBasicMaterial color={color} transparent opacity={.1} wireframe depthWrite={false}/></mesh>
  <mesh ref={impact} position={[0,.4,0]}><icosahedronGeometry args={[.48,0]}/><meshBasicMaterial color="#fff3d1" transparent opacity={.55} wireframe/></mesh>
  <Billboard position={[0,1.15,0]}><mesh><planeGeometry args={[.66,.07]}/><meshBasicMaterial color="#403c56"/></mesh><mesh position={[-.3*(1-unit.hp/STATS[unit.kind].hp),0,.002]}><planeGeometry args={[.6*Math.max(.001,unit.hp/STATS[unit.kind].hp),.045]}/><meshBasicMaterial color={color}/></mesh>{unit.team===1&&<mesh position={[.41,0,0]} rotation={[0,0,Math.PI/4]}><planeGeometry args={[.065,.065]}/><meshBasicMaterial color={color}/></mesh>}</Billboard>
  <mesh position={[0,.5,0]} onPointerUp={onSelect}><boxGeometry args={[.95,1.3,.95]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 </group>;
}
