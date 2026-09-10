'use client';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group} from 'three';
import type {Game} from '../../lib/game/engine';
import {prismStatus} from './arena-math';
export function Prism3D({game,pulse,reducedMotion}:{game:Game;pulse:boolean;reducedMotion:boolean}){
  const ref=useRef<Group>(null),status=prismStatus(game),color={mint:'#84efd1',coral:'#ff9c91',contested:'#cfadff',unclaimed:'#ffedb9'}[status];
  useFrame(({clock})=>{if(ref.current){ref.current.rotation.y=reducedMotion?0:clock.elapsedTime*.25;ref.current.position.y=.65+(reducedMotion?0:Math.sin(clock.elapsedTime*1.4)*.06);}});
  return <group>
    {[[0,0],[-1,0],[1,0],[0,-1],[0,1]].map(([x,z],i)=><mesh key={i} position={[x,.025,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.34,.43,32]}/><meshBasicMaterial color={color} transparent opacity={.6}/></mesh>)}
    <group ref={ref} position={[0,.65,0]}><mesh scale={[.24,.65,.24]}><octahedronGeometry/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={pulse?1.5:.6} metalness={.35} roughness={.2}/></mesh><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.5,.013,5,40]}/><meshBasicMaterial color={color}/></mesh></group>
  </group>;
}
