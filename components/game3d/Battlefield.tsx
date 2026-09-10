'use client';
import {Component,Suspense,lazy,useEffect,useState,type ReactNode} from 'react';
import type {ArenaProps} from './OpalArena3D';
import './game3d.css';
const Arena=lazy(()=>import('./OpalArena3D'));
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export function Battlefield({children,...props}:Omit<ArenaProps,'reset'|'onFailure'>&{children:ReactNode}){
 const [support,setSupport]=useState<'checking'|'supported'|'unavailable'>('checking'),[flat,setFlat]=useState(false),[failed,setFailed]=useState(false),[reset,setReset]=useState(0);
 // Probe the external GPU once after mount, before Fiber's async renderer initialization.
 // Its initialization rejection is not caught by a React render error boundary.
 useEffect(()=>{
  const canvas=document.createElement('canvas');let available=false;
  try{const gl=canvas.getContext('webgl2');available=!!gl;gl?.getExtension('WEBGL_lose_context')?.loseContext();}catch{}
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setSupport(available?'supported':'unavailable');
 },[]);
 const fallback=<div className="webgl-fallback" role="status">3D is unavailable on this device. Open the tactical view to keep playing.<button onClick={()=>setFlat(true)}>Open tactical view</button></div>;
 return <>
  <div className="view-controls"><span>OPAL COAST <i>/ LIVE 3D</i></span><button onClick={()=>setReset(n=>n+1)} disabled={flat}>Reset tactical view</button><button aria-pressed={flat} onClick={()=>setFlat(v=>!v)}>{flat?'Return to 3D':'2D / keyboard view'}</button></div>
  {!flat&&<div className="arena-3d" aria-label="Interactive 3D Opal Coast. Tap a creature, then a lit destination. Keyboard controls are available in the tactical view.">
   {failed||support==='unavailable'?fallback:<SceneBoundary fallback={fallback}>{support==='supported'?<Suspense fallback={<p className="scene-loading">Opening the coast…</p>}><Arena {...props} reset={reset} onFailure={()=>setFailed(true)}/></Suspense>:<p className="scene-loading">Opening the coast…</p>}</SceneBoundary>}
   <div className="scene-label"><span>THE SHELLWILDS</span><small>{props.reveal?'SIMULTANEOUS REVEAL':props.canEdit?'SELECT · PLAN · OUTTHINK':'ORDERS SEALED'}</small></div>
  </div>}
  {flat&&<div className="tactical-companion">{children}</div>}
  <p className="camera-hint">{flat?'Tab through cells, Enter to select. Coordinates match the 3D arena.':'Tap to plan · Drag to orbit · Wheel / pinch to zoom · Right-drag / two fingers to pan'}</p>
 </>;
}
