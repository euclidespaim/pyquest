/**
 * Efeitos sonoros retro nativos para o PyQuest 2.0 usando a Web Audio API.
 * @param {string} type - Tipo de som: 'success', 'error', 'click'
 */
export function playSound(type) {
  // Auto-start background music on first user interaction if enabled
  if (localStorage.getItem("pyquest_bg_music") === "true") {
    startBackgroundMusic();
  }

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "success") {
      // Elegant arpeggio: C5 -> E5 -> G5 -> C6
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "error") {
      // Deep warning buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "click") {
      // Soft button click sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.log("Web Audio blocked or not supported yet: ", e);
  }
}

// Retro RPG Chiptune Synthesizer
let bgMusicCtx = null;
let bgMusicInterval = null;
let bgMusicPlaying = false;

export function startBackgroundMusic() {
  if (bgMusicPlaying) return;
  try {
    bgMusicCtx = new (window.AudioContext || window.webkitAudioContext)();
    bgMusicPlaying = true;

    // Classic medieval minor arpeggio chord progression loop (A minor, D minor, G major, C major)
    const melody = [
      440, 480, 523, 587, 659, 587, 523, 480, // Am
      294, 330, 349, 392, 440, 392, 349, 330, // Dm
      392, 440, 494, 523, 587, 523, 494, 440, // G
      262, 294, 330, 349, 392, 349, 330, 294  // C
    ];
    let step = 0;

    bgMusicInterval = setInterval(() => {
      if (!bgMusicPlaying) return;
      if (bgMusicCtx.state === "suspended") {
        bgMusicCtx.resume();
      }
      playMelodyNote(melody[step], 0.22);
      step = (step + 1) % melody.length;
    }, 200); // 120 bpm (8th notes)
  } catch (e) {
    console.log("Failed to start background music: ", e);
  }
}

function playMelodyNote(frequency, duration) {
  if (!bgMusicCtx || bgMusicCtx.state === "closed") return;
  try {
    const osc = bgMusicCtx.createOscillator();
    const gain = bgMusicCtx.createGain();
    osc.connect(gain);
    gain.connect(bgMusicCtx.destination);

    // Soft triangle wave for a cozy retro RPG mood
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, bgMusicCtx.currentTime);

    // Keep it extremely quiet as background music
    gain.gain.setValueAtTime(0.015, bgMusicCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, bgMusicCtx.currentTime + duration);

    osc.start();
    osc.stop(bgMusicCtx.currentTime + duration);
  } catch (e) {
    // Ignore closed context warnings
  }
}

export function stopBackgroundMusic() {
  bgMusicPlaying = false;
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  if (bgMusicCtx) {
    try {
      bgMusicCtx.close();
    } catch (e) {}
    bgMusicCtx = null;
  }
}

export function isBackgroundMusicPlaying() {
  return bgMusicPlaying;
}
