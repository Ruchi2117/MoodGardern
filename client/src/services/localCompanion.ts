export type HabitTopic = "day" | "water" | "sleep" | "movement";
export function localReply(text: string, topic: HabitTopic): { text: string; topic: HabitTopic; water?: number } {
  const s = text.toLowerCase().trim();
  if (/suicid|kill myself|hurt myself|end my life/.test(s)) return {topic:"day",text:"I’m glad you told me. Please reach out to someone you trust and a local crisis service now. If you’re in immediate danger, call your local emergency number. I’m a little habit companion and can’t provide crisis care."};
  if (/medic|diagnos|symptom|chest pain|prescri|dose|kidney/.test(s)) return {topic:"day",text:"That’s a question for a qualified health professional, especially if symptoms are new or worrying. I can help with everyday routines, but can’t diagnose or recommend treatment. Would you like to talk about your day instead?"};
  if (/motivat|quote|encourag|inspir/.test(s)) return {topic:"day",text:"A little reminder: ‘You don’t have to bloom all at once.’ One small step is enough for now. What’s one kind, doable thing you could do for yourself today?"};
  if (/water|hydr|drink|glass|cup|bottle/.test(s) || (topic === "water" && /^\d+\s*(glasses|cups)?$/.test(s))) {
    const count = s.match(/\b(\d{1,2})\s*(?:glasses|cups)\b/) || s.match(/^(\d{1,2})$/);
    if (count) return {topic:"water",water:Number(count[1]),text:`Noted: ${count[1]} glasses today. This is your own log, not a hydration score. Needs and glass sizes vary. Want to keep a glass nearby for your next break, or tell me about your day?`};
    return {topic:"water",text:"A tiny water check-in? How many glasses have you had today? You can say ‘3 glasses’. No universal target here—your needs vary, and any clinician’s fluid guidance comes first."};
  }
  if (/sleep|bed|tired|rest/.test(s)) return {topic:"sleep",text:"Let’s give your evening a softer landing. A consistent bedtime and a quiet wind-down can help build a routine. What usually keeps you awake—screens, a busy mind, or an unpredictable schedule?"};
  if (topic === "sleep" && /screen|phone|scroll/.test(s)) return {topic:"day",text:"Maybe make your phone’s bedtime a little earlier than yours. Pick a quiet alternative you enjoy: a few pages, soft music, or putting tomorrow’s things by the door. Which feels easiest tonight?"};
  if (/walk|move|exercise|stretch/.test(s)) return {topic:"movement",text:"A little movement can be a gentle invitation, not another task to win. If comfortable for you, what sounds nicer: a short walk, stretching at your desk, or stepping outside for a moment?"};
  if (/sad|lonely|stress|overwhelm|bad day/.test(s)) return {topic:"day",text:"That sounds like a heavy day. You don’t have to turn it into a lesson right now. Want to tell me what happened, or choose one small comforting thing for this evening?"};
  if (/thank/.test(s)) return {topic:"day",text:"You’re welcome. Small care still counts. Shall we check in on water, your evening routine, or something good from today?"};
  if (/^(hi|hey|hello|hii)[!.\s]*$/.test(s)) return {topic:"day",text:"Hello, I’ve saved you a quiet corner. How has your day been—busy, slow, or somewhere in between?"};
  if (/how are you|how's your day|tell me about your day/.test(s)) return {topic:"day",text:"I’ve been keeping the little flowers company. Now it’s your turn: what did you get up to today, and was there a moment you’d like to keep?"};
  if (/good|happy|lovely|nice|great/.test(s)) return {topic:"day",text:"A little bright spot worth keeping. What made it feel good—a person, something you did, or a moment you noticed?"};
  if (/work|study|exam|school|college/.test(s)) return {topic:"day",text:"Sounds like a day with a lot on your plate. What part felt most satisfying, and what could wait until tomorrow? A little pause is allowed, too."};
  if (/movie|music|read|cook|friend|game|hobby|draw/.test(s)) return {topic:"day",text:"Thanks for bringing a little piece of your day here. What stayed with you most about it? We can linger on that, or make a small plan for tomorrow."};
  return {topic:"day",text:topic === "day" ? "I can follow simple habit and day check-ins, rather than every kind of conversation. What stood out today? Or we can explore water, sleep, or a little movement together." : "We can keep it small. Tell me a little more about your day, or pick a habit below to start a fresh check-in."};
}
