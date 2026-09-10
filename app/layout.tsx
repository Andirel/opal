import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Opal Shift — Creature Tactics',description:'A competitive creature duel on the Opal Coast. Plan your squad, use shell cover, and claim the prism.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
