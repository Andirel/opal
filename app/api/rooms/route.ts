import { env } from 'cloudflare:workers';
import { createRoomHandlers } from '@/lib/game/rooms';
const handlers=createRoomHandlers(()=>{if(!env.DB)throw Error('Private rooms are unavailable. Training is ready.');return env.DB});
export const GET=handlers.GET;
export const POST=handlers.POST;
