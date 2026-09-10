'use client';
// Kept inside one logical footprint: decorative ridges never imply extra collision.
export function Shell3D({position,scale=1,rotation=0}:{position:[number,number,number];scale?:number;rotation?:number}) {
  return <group position={position} scale={scale} rotation={[0,rotation,0]}>
    <mesh position={[0,.38,0]} scale={[.43,.55,.43]} castShadow receiveShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#f7e5da" roughness={.3} metalness={.18}/></mesh>
    {Array.from({length:7},(_,i)=><mesh key={i} position={[0,.39,0]} rotation={[0,i*Math.PI/7,0]} scale={[.45,.57,.45]}><torusGeometry args={[1,.027,5,32,Math.PI]}/><meshStandardMaterial color={i%2?'#c9aecb':'#fff4dd'} roughness={.24} metalness={.3}/></mesh>)}
    <mesh position={[.05,.19,.39]} scale={[.25,.2,.07]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#6f647f" roughness={.75}/></mesh>
  </group>;
}
