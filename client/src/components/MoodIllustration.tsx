import { MOOD_PLANTS, type Mood } from "../../../shared/moods.js";
export default function MoodIllustration({ mood = "calm", size = 42 }: { mood?: Mood; size?: number }) {
  const sleepy = mood === "tired", low = mood === "sad", bright = mood === "happy" || mood === "loved";
  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="mood-illustration">
    <path d="M17 26Q4 10 17 11Q29 13 28 25M38 25Q35 7 48 10Q60 16 45 29" fill={MOOD_PLANTS[mood].accent} stroke="#526646" strokeWidth="1.5" />
    <path d="M11 38Q9 20 31 20Q55 20 54 39Q57 56 34 57Q9 57 11 38Z" fill={MOOD_PLANTS[mood].color} stroke="#526646" strokeWidth="1.5" />
    <ellipse cx="19" cy="42" rx="5" ry="2.8" fill="#d8a2a5" opacity=".65"/><ellipse cx="46" cy="42" rx="5" ry="2.8" fill="#d8a2a5" opacity=".65"/>
    {bright || sleepy ? <g fill="none" stroke="#354c32" strokeWidth="2.5" strokeLinecap="round"><path d={sleepy ? "M21 36l6 1M38 37l6-1" : "M21 37q3-6 6 0M38 37q3-6 6 0"}/></g> : <g fill="#354c32"><ellipse cx="24" cy="36" rx="2.2" ry="3"/><ellipse cx="41" cy="36" rx="2.2" ry="3"/></g>}
    <path d={low ? "M28 46q5-5 10 0" : mood === "stressed" ? "M27 45l4-2 4 2 4-2" : "M28 44q5 7 10 0"} fill="none" stroke="#354c32" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M28 21Q26 8 36 8Q43 10 34 18" fill="#91a77a" stroke="#526646" strokeWidth="1.2"/>
    {mood === "loved" && <path d="M47 6c-4-6-11 0-3 6l3 2 3-2c8-6 1-12-3-6" fill="#d8a2a5"/>}
    {sleepy && <path d="M50 17h7l-7 6h7" stroke="#7b6990" fill="none" strokeWidth="1.5"/>}
  </svg>;
}
