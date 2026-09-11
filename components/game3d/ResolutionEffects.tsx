'use client';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {Group} from 'three';
import {cellToWorld,REVEAL_MS,type Reveal} from './arena-math';
export function ResolutionEffects({reveal}:{reveal:Reveal}){
 const ref=useRef<Group>(null);
 useFrame(()=>{if(ref.current){const t=(performance.now()-reveal.startedAt)/REVEAL_MS;ref.current.visible=t>.57&&t<.73;}});
 return <group ref={ref} visible={false}>{reveal.strikes.map((strike,i)=><group key={i}>
  <Line points={[cellToWorld(strike.from,.55),cellToWorld(strike.to,.55)]} color={strike.team===0?'#adffe6':'#ffc5a9'} lineWidth={3}/>
  {strike.guarded&&<mesh position={cellToWorld(strike.to,.5)}><icosahedronGeometry args={[.65,1]}/><meshBasicMaterial color="#e0deff" transparent opacity={.22} wireframe/></mesh>}
 </group>)}</group>;
}
