import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Droplets, Moon, Footprints, RotateCcw } from "lucide-react";
import MoodIllustration from "../MoodIllustration";
import { askCompanion, companionStatus, ApiError } from "../../services/api";
import { localReply, type HabitTopic } from "../../services/localCompanion";
import { useAuth } from "../../context/AuthContext";

type ChatMessage = {role:"user"|"assistant";content:string};
export default function CompanionChat({ name, onReply, prompt }: { name:string; onReply:()=>void; prompt?:{id:number;text:string} }) {
  const {logout} = useAuth();
  const [mode,setMode] = useState<"local"|"ai">("local");
  const [available,setAvailable] = useState(false);
  const [messages,setMessages] = useState<ChatMessage[]>([]);
  const [draft,setDraft] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [water,setWater] = useState<number|null>(null);
  const [topic,setTopic] = useState<HabitTopic>("day");
  const abort = useRef<AbortController|null>(null);
  const lock = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const sendRef=useRef<(text:string)=>void>(()=>{});
  useEffect(()=>{if(prompt)sendRef.current(prompt.text);},[prompt?.id]);
  useEffect(() => {
    const controller = new AbortController();
    void companionStatus(controller.signal).then(s=>setAvailable(s.available)).catch(e=>{
      if (!controller.signal.aborted && e instanceof ApiError && e.status===401) logout();
    });
    return ()=>{controller.abort();abort.current?.abort();};
  }, [logout]);
  useEffect(()=>{if(log.current) log.current.scrollTop=log.current.scrollHeight;},[messages,busy]);
  useEffect(()=>{
    let day=new Date().toDateString();
    const check=()=>{const next=new Date().toDateString();if(next!==day){day=next;setWater(null);}};
    const timer=setInterval(check,30000);window.addEventListener("focus",check);
    return ()=>{clearInterval(timer);window.removeEventListener("focus",check);};
  },[]);
  async function send(value=draft, retry=false) {
    const text=value.trim();if(!text || lock.current || text.length>1000 || (mode==="ai"&&!available))return;
    lock.current=true;setBusy(true);setError("");setDraft("");
    const conversation=(retry?messages:[...messages,{role:"user" as const,content:text}]).slice(-19);
    setMessages(conversation);
    const controller=new AbortController();abort.current=controller;
    try {
      let reply:string;
      if(mode==="ai") reply=(await askCompanion(conversation,controller.signal)).reply;
      else {
        const response=localReply(text,topic);reply=response.text;setTopic(response.topic);
        if(response.water!==undefined)setWater(response.water);
      }
      if(!controller.signal.aborted){setMessages([...conversation,{role:"assistant",content:reply}]);onReply();}
    }catch(e){if(!controller.signal.aborted){
      if(e instanceof ApiError && e.status===401)logout();
      else setError(e instanceof Error ? e.message : "That reply got lost. Try again.");
    }}finally{lock.current=false;if(!controller.signal.aborted)setBusy(false);}
  }
  sendRef.current=text=>{void send(text);};
  const switchMode=(next:"local"|"ai")=>{setMode(next);setMessages([]);setTopic("day");setError("");};
  return <section className="companion-chat" aria-labelledby="companion-chat-title">
    <div className="companion-chat-heading"><MoodIllustration size={45}/><div><h3 id="companion-chat-title">A little chat with {name}</h3><span>{mode==="local"?"Local companion · guided replies":"AI companion · external provider"}</span></div><MessageCircle size={20}/></div>
    <div className="chat-modes" role="group" aria-label="Chat mode">
      <button type="button" aria-pressed={mode==="local"} disabled={busy} onClick={()=>switchMode("local")}>Local & free</button>
      <button type="button" aria-pressed={mode==="ai"} disabled={busy} onClick={()=>switchMode("ai")}>AI conversation</button>
      <button className="chat-clear" type="button" disabled={busy} onClick={()=>{setMessages([]);setWater(null);setError("");setTopic("day");}} aria-label="Start a fresh chat"><RotateCcw size={14}/></button>
    </div>
    {mode==="ai" && <p className="chat-privacy">{available?"Sending shares the messages in this chat with the configured AI provider. Journal notes are never attached. Provider charges may apply.":"AI isn’t connected yet. Add a provider on the server to enable it; local chat works now."}</p>}
    <div className="chat-log" ref={log} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
      {!messages.length && <div className="chat-bubble assistant"><span>{name}</span>Come sit for a moment. What did today feel like? We can talk about water, winding down, or a little bright spot.</div>}
      {messages.map((message,i)=><div key={i} className={`chat-bubble ${message.role}`}><span>{message.role==="user"?"You":name}</span>{message.content}</div>)}
      {busy && <p className="chat-thinking" role="status">{name} is finding a little thought…</p>}
    </div>
    <div className="chat-prompts">
      {[["Tell me about your day","My day"],["Water check-in","Water"],["Help me wind down for sleep","Sleep"],["A little movement","Movement"],["Give me a little motivation","A little motivation"]].map(([text,label],i)=><button key={label} type="button" disabled={busy || (mode==="ai"&&!available)} onClick={()=>void send(text)}>{i===1?<Droplets size={14}/>:i===2?<Moon size={14}/>:i===3?<Footprints size={14}/>:<MessageCircle size={14}/>} {label}</button>)}
    </div>
    {water!==null && <p className="chat-water"><Droplets size={15}/> Your local check-in: {water} glasses today · no target or score</p>}
    {error && <p className="chat-error" role="alert">{error} <button type="button" onClick={()=>{const last=[...messages].reverse().find(m=>m.role==="user");if(last)void send(last.content,true);}}>Retry</button></p>}
    <form onSubmit={e=>{e.preventDefault();void send();}} className="chat-form"><label className="sr-only" htmlFor="companion-message">Message your companion</label><input id="companion-message" value={draft} maxLength={1000} disabled={busy||(mode==="ai"&&!available)} onChange={e=>setDraft(e.target.value)} placeholder="Tell me a little about your day…"/><button type="submit" disabled={busy||!draft.trim()||(mode==="ai"&&!available)} aria-label="Send message"><Send size={17}/></button></form>
    <p className="chat-note">{mode==="local"?"Guided conversation, not an AI or medical service. ":"Everyday support, not medical advice. "}Chat stays in this session; it clears when you leave. <a href="https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/" target="_blank" rel="noreferrer">Water basics</a> · <a href="https://www.cdc.gov/sleep/about/" target="_blank" rel="noreferrer">Sleep basics</a></p>
  </section>;
}
