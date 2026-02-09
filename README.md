# Chladniator  
**A Chladni-based Generative Audio–Visual Instrument**

---

## Overview

**Chladniator** is an interactive audio–visual system that explores the relationship between physical vibration patterns, spatial interaction, and generative sound synthesis.  
Inspired by **Chladni figures**, the project maps particle motion and density on a virtual vibrating plate to granular sound generation, allowing users to *play* visual structures as a musical instrument.

Sound is not triggered explicitly; instead, it *emerges* from the interaction between spatial regions, and user input.

---

## Key Features

- **Chladni-based particle simulation**  
  Real-time particle motion driven by a 2D Chladni equation, visualizing vibration modes and nodal structures.

- **Spatial sound assignment (Sound Brush)**  
  Users paint regions on the plate to assign different audio samples to particles.

- **MIDI & keyboard input**  
  MIDI devices or the computer keyboard define active pitches (chromas) that control sound generation zones (octaves are calculated with the Ｙcoordinate of the particle).

- **Granular sound synthesis**  
  Audio samples are played as short grains with pitch shifting, envelopes, panning, and reverb.

- **Interactive parameter control**  
  Circular knobs provide intuitive control over physical and sonic parameters.

- **Recording and export**  
  Real-time audio output can be recorded and exported as WAV files.

- **Preset system (Firebase)**  
  Parameter presets and sample configurations can be saved and recalled through a firebase interaction.

---

```bash
python -m http.server
