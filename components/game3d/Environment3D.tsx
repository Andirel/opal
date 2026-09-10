'use client';
import {useMemo,useEffect} from 'react';
import {CatmullRomCurve3,Vector3,PlaneGeometry,Color} from 'three';
import {Sparkles} from '@react-three/drei';
import {W,H,SHELLS} from '../../lib/game/engine';
import {cellToWorld} from './arena-math';
import {Shell3D} from './Shell3D';

function Root({index}:{index:number}){
  const curve=useMemo(()=>new CatmullRomCurve3(Array.from({length:9},(_,i)=>{
    const x=-17+i*4.2;return new Vector3(x,-.02,Math.sin(i*.9+index)*2+(index-1.5)*5);
  })),[index]);
  return <mesh><tubeGeometry args={[curve,64,.035,5,false]}/><meshStandardMaterial color="#b1ffe7" emissive="#72dabc" emissiveIntensity={.6} transparent opacity={.6} roughness={.22}/></mesh>;
}
export function Environment3D({reducedMotion}:{reducedMotion:boolean}){
  const floor=useMemo(()=>{
    const geometry=new PlaneGeometry(W,H,60,44);geometry.rotateX(-Math.PI/2);
    const pos=geometry.attributes.position,colors=[];const color=new Color();
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,-.045+.025*Math.sin(x*2.1)*Math.cos(z*1.7));
      color.set('#e4dacb').lerp(new Color('#b5d6cb'),.35+.22*Math.sin(x*.55+z*.8));colors.push(color.r,color.g,color.b);}
    // Geometry is explicitly disposed by the declarative primitive below.
    return {geometry,colors:new Float32Array(colors)};
  },[]);
  useEffect(()=>()=>floor.geometry.dispose(),[floor]);
  return <group>
    <color attach="background" args={['#bfcecf']}/><fog attach="fog" args={['#bfcecf',27,75]}/>
    <ambientLight intensity={1.4} color="#e9e6ff"/><hemisphereLight args={['#fff0e2','#9dabbc',1.8]}/>
    <directionalLight position={[-7,13,5]} intensity={2.4} color="#fff0d9" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.0008}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.48,0]} receiveShadow><planeGeometry args={[180,180]}/><meshStandardMaterial color="#8cbbb9" roughness={.35} metalness={.22}/></mesh>
    <mesh position={[0,-.65,0]} scale={[9.9,.58,7.6]} receiveShadow><sphereGeometry args={[1,64,24]}/><meshStandardMaterial color="#c3b5be" roughness={.85}/></mesh>
    <mesh receiveShadow><primitive object={floor.geometry} attach="geometry" dispose={null}/><bufferAttribute attach="geometry-attributes-color" args={[floor.colors,3]}/><meshStandardMaterial vertexColors roughness={.85}/></mesh>
    {[0,1,2,3].map(i=><Root key={i} index={i}/>)}
    {SHELLS.map((p,i)=><Shell3D key={i} position={cellToWorld(p)} rotation={i*1.3}/>)}
    {Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return <Shell3D key={i} position={[Math.cos(a)*(14+i%3),-.4,Math.sin(a)*(11+i%4)]} scale={1.8+i%3} rotation={a}/>;})}
    {Array.from({length:60},(_,i)=>{const a=i*2.3999,r=1+(i%5)*.18,x=Math.cos(a)*9.2*r,z=Math.sin(a)*7*r;
      return <group key={i} position={[x,-.2,z]} rotation={[0,a,.15]}><mesh scale={[.14,.3+(i%4)*.15,.14]}><octahedronGeometry/><meshStandardMaterial color={['#c4b8dc','#e1c7ad','#a1c8b8'][i%3]} roughness={.75}/></mesh></group>;})}
    {!reducedMotion&&<Sparkles count={32} scale={[24,4,18]} position={[0,1,0]} size={2} speed={.13} opacity={.35} color="#fff5dc"/>}
  </group>;
}
