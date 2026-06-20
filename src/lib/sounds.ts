let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

function getCorrectAudio(): HTMLAudioElement {
  if (!correctAudio) {
    correctAudio = new Audio('/sounds/correct.wav');
    correctAudio.volume = 0.8;
  }
  return correctAudio;
}

function getWrongAudio(): HTMLAudioElement {
  if (!wrongAudio) {
    wrongAudio = new Audio('/sounds/wrong.wav');
    wrongAudio.volume = 0.8;
  }
  return wrongAudio;
}

export function playCorrectSound(): void {
  try {
    const audio = getCorrectAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}

export function playWrongSound(): void {
  try {
    const audio = getWrongAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}
