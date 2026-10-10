let audio: AudioContext | null = null;
export function companionSound(kind: "tap" | "hello" | "water" | "message" = "tap") {
  try {
    audio ||= new AudioContext();
    void audio.resume().then(() => {
      const notes = kind === "water" ? [660, 880, 740] : kind === "hello" ? [523, 659, 784] : kind === "message" ? [784, 1046] : [660];
      const now = audio!.currentTime;
      notes.forEach((frequency, index) => {
        const oscillator = audio!.createOscillator(), gain = audio!.createGain();
        oscillator.type = "sine"; oscillator.frequency.value = frequency;
        const start = now + index * .09;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.035, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + .23);
        oscillator.connect(gain); gain.connect(audio!.destination);
        oscillator.start(start); oscillator.stop(start + .25);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    }).catch(() => {});
  } catch { /* Audio support is optional; never block an interaction. */ }
}
