import { useEffect, useRef, useState } from "react";
import type { PocketAction, PocketScene, PocketView } from "./pocketScene";
import type { MoodEntry } from "../../services/api";
import { VISIBLE_PLANT_LIMIT } from "../../../../shared/moods.js";
import { Hand, CloudRain, Rotate3D, Volume2, VolumeX, Palette } from "lucide-react";
import MoodIllustration from "../MoodIllustration";
import CompanionChat from "./CompanionChat";
import { companionSound } from "../../services/companionSound";
import { useAuth } from "../../context/AuthContext";
import "../../pocket-garden.css";

const messages: Record<PocketAction, string> = {
  wave: "A little hello, just for you.", water: "A little pretend rain. Your friend loves it.",
  turn: "A different side of your little world.", celebrate: "Something lovely just found a home in your garden.",
};
export default function PocketGarden({ plantedId, care, entries }: { plantedId: string | null; care: number; entries: MoodEntry[] }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<PocketScene | null>(null);
  const [view, setView] = useState<PocketView>("toy");
  const [chatPrompt,setChatPrompt]=useState<{id:number;text:string}>();
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [message, setMessage] = useState("Tap your little friend. There’s no rush.");
  const {user}=useAuth();
  const storageKey=`moodgarden.friend.${user?.id}`;
  const [preferences,setPreferences]=useState<{name:string;tint:"moss"|"rose"|"lavender";accessory:"leaves"|"mushroom"|"flower";sound:boolean}>(()=>{
    try{const p=JSON.parse(localStorage.getItem(storageKey)||"null");if(p && typeof p.name==="string" && ["moss","rose","lavender"].includes(p.tint)&&["leaves","mushroom","flower"].includes(p.accessory))return {...p,name:p.name.slice(0,24),sound:p.sound===true};}catch{}
    return {name:"Fern",tint:"moss",accessory:"leaves",sound:false};
  });
  const prefs=useRef(preferences);prefs.current=preferences;
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(preferences));}catch{} scene.current?.customize(preferences.tint,preferences.accessory);},[preferences,storageKey]);
  const selected = useRef(view); selected.current = view;
  const previous = useRef({ plantedId, care });
  const savedMoods = useRef(entries); savedMoods.current = entries;
  const actionRef = useRef<(action: PocketAction) => void>(() => {});
  const act = (action: PocketAction) => { scene.current?.act(action); setMessage(messages[action]); if(prefs.current.sound)companionSound(action==="water"?"water":action==="wave"?"hello":"tap"); };
  actionRef.current = act;
  useEffect(() => {
    const element = host.current!;
    let cancelled = false;
    const lost = () => { scene.current?.dispose(); scene.current = null; setReady(false); setFallback(true); };
    element.addEventListener("pocket-context-lost", lost);
    // Only load WebGL when this optional section approaches the viewport.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import("./pocketScene").then(({ createPocketScene }) => {
        if (cancelled) return;
        try {
          scene.current = createPocketScene(element, action => actionRef.current(action));
          scene.current.view(selected.current === "toy" ? "friend" : selected.current);
          scene.current.moods(savedMoods.current.slice(0, VISIBLE_PLANT_LIMIT).map(entry => entry.mood));
          scene.current.customize(prefs.current.tint,prefs.current.accessory);
          setReady(true);
        } catch { setFallback(true); }
      }).catch(() => { if (!cancelled) setFallback(true); });
    }, { rootMargin: "180px" });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); element.removeEventListener("pocket-context-lost", lost); scene.current?.dispose(); scene.current = null; };
  }, []);
  useEffect(() => { scene.current?.view(view === "toy" ? "friend" : view); }, [view]);
  useEffect(() => { scene.current?.moods(entries.slice(0, VISIBLE_PLANT_LIMIT).map(entry => entry.mood)); }, [entries]);
  useEffect(() => {
    if ((plantedId && plantedId !== previous.current.plantedId) || care > previous.current.care) act("celebrate");
    previous.current = { plantedId, care };
  }, [plantedId, care]);
  return <section className="pocket-garden" aria-labelledby="pocket-title">
    <div className="pocket-copy">
      <span className="small-label">A TINY WORLD TO PLAY IN</span>
      <h2 id="pocket-title">A little woodland <em>friend named {preferences.name || "Fern"}.</em></h2>
      <p>A hello, a little rain, a new point of view.<br />Small moments, just for the joy of it.</p>
      <div className="pocket-views" role="group" aria-label="Choose a 3D view">
        {([ ["friend", "Little friend"], ["toy", "Pocket toy"], ["garden", "Garden in 3D"] ] as const).map(([key, title]) =>
          <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>{title}</button>)}
      </div>
      <p className="pocket-hint">{view === "toy" ? "Chat lives inside your pocket toy. The pink button checks in on water; yellow brings a little motivation. Drag Fern to turn it around." : view === "garden" ? "Drag to explore your garden. Tap a flower for a little shower." : "Click and drag to turn Fern all the way around. Tap to say hello."}</p>
      {view !== "friend" && <span className="pocket-note">{entries.length ? `${Math.min(entries.length, VISIBLE_PLANT_LIMIT)} saved feelings, blooming in miniature.` : "Your first saved feeling will bloom here."}</span>}
      <details className="friend-customize"><summary><Palette size={15}/> Make it yours</summary><label>Friend’s name<input maxLength={24} value={preferences.name} onChange={e=>setPreferences({...preferences,name:e.target.value})}/></label><label>Pocket toy color<select value={preferences.tint} onChange={e=>setPreferences({...preferences,tint:e.target.value as typeof preferences.tint})}><option value="moss">Moss green</option><option value="rose">Wild rose</option><option value="lavender">Twilight lavender</option></select></label><label>Little accessory<select value={preferences.accessory} onChange={e=>setPreferences({...preferences,accessory:e.target.value as typeof preferences.accessory})}><option value="leaves">Bluebell traveler</option><option value="mushroom">Leaf pin</option><option value="flower">Wildflower pin</option></select></label></details>
      <button className="friend-sound" type="button" aria-pressed={preferences.sound} onClick={()=>{const next=!preferences.sound;setPreferences({...preferences,sound:next});if(next)companionSound("hello");}}>{preferences.sound?<Volume2 size={15}/>:<VolumeX size={15}/>} Soft sounds {preferences.sound?"on":"off"}</button>
    </div>
    <div className={`pocket-play ${view === "toy" ? "toy-console" : ""}`} style={view === "toy" ? {background:`linear-gradient(135deg,#dce5c9,${{moss:"#a0b780",rose:"#ddb5b5",lavender:"#bcb1cf"}[preferences.tint]})`} : undefined}>
      {view === "toy" && <div className="toy-hardware-title"><span>MOODGARDEN POCKET</span><span className="toy-power-light"/> ON</div>}
      <div className={view === "toy" ? "toy-lcd" : ""}>
      <div className="pocket-stage" ref={host} role="img" aria-label={view === "garden" ? "A 3D garden island with flowers and a woodland companion" : "Fern, a bluebell-hatted woodland traveler. Drag to rotate."}>
        {!ready && <div className="pocket-placeholder" aria-hidden="true"><MoodIllustration size={120}/><small>{fallback ? "A little friend, in a simpler view" : "Your little world is waking up…"}</small></div>}
      </div>
      <div hidden={view !== "toy"}><CompanionChat name={preferences.name.trim()||"Fern"} prompt={chatPrompt} onReply={()=>{scene.current?.act("wave");if(prefs.current.sound)companionSound("message");}}/></div>
      </div>
      {view === "toy" && <div className="toy-hardware-controls"><button type="button" className="toy-cross" aria-label="Turn Fern around" onClick={()=>act("turn")}>✚</button><div className="toy-action-buttons"><button type="button" className="toy-round toy-quote" aria-label="Motivation from Fern" onClick={()=>{setChatPrompt({id:Date.now(),text:"Give me a little motivation"});if(prefs.current.sound)companionSound("tap");}}>B</button><button type="button" className="toy-round toy-water" aria-label="Water check-in with Fern" onClick={()=>{setChatPrompt({id:Date.now(),text:"Water check-in"});if(prefs.current.sound)companionSound("water");}}>A</button></div><span className="toy-speaker" aria-hidden="true">▥▥▥</span></div>}
      <div className="pocket-controls" aria-label="Garden friend actions">
        <button type="button" onClick={() => act("wave")}><Hand size={16}/> Say hello</button>
        <button type="button" onClick={() => act("water")}><CloudRain size={16}/> Make rain</button>
        <button type="button" onClick={() => act("turn")}><Rotate3D size={16}/> Turn around</button>
      </div>
      <p className="pocket-message" role="status">{message}</p>
      <span className="pocket-note">Just play. Your saved feelings and ritual rewards stay as they are.</span>
    </div>
  </section>;
}
