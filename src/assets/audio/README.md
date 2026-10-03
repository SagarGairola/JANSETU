# Audio Asset Structure

This directory holds the soundtrack chapters and sound effects for the SG Team Experience:

```
src/assets/audio/
├── opening/      # Chapter 1: Atmospheric mysterious ambient track
├── playful/      # Chapter 2: Initial SG question interactive theme
├── yes/          # Chapter 3: Wholesome conversational theme
├── no/           # Chapter 4: Bouncing energetic prank groove
├── team/         # Chapter 5: Warm casual team theme
├── memory/       # Chapter 6: Kinetic nostalgic memory montage build
├── emotional/    # Chapter 7: Soft, minimal piano / pad sequence
├── ending/       # Chapter 9: Final cinematic submission credits theme
└── sfx/          # Record scratch, pops, whooshes, clicks, and ticks
```

The `AudioManager` natively synthesizes high-fidelity cinematic soundtrack variations across all chapters with zero external dependencies, and supports dropping custom `.mp3` or `.wav` assets into these directories when provided.
