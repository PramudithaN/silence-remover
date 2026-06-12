# Silence Remover 🎧

![Javascript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)

A professional, high-performance web application designed to automatically strip silence from audio files. Built with a **privacy-first** approach, it processes everything locally in your browser using the Web Audio API—your audio never leaves your device.

---

## 📸 Preview

![Hero](public/Images/silece-remover.jpeg)

---

## ✨ Features

- **🛡️ 100% Client-Side:** No servers, no uploads. Total privacy for your audio data.
- **⚡ Bulk Processing:** Process multiple files simultaneously with ease.
- **🎨 Glassmorphism UI:** A modern, ambient dark-themed interface built with Material UI.
- **📊 Live Visualization:** View original and processed waveforms in real-time.
- **🛠️ Precision Controls:**
  - **Silence Threshold:** Fine-tune the dB level to define what counts as "silence".
  - **Min Silence Duration:** Filter out short pauses (ms) to keep natural flow.
  - **Padding Around Speech:** Add a buffer (ms) to ensure words aren't clipped.
- **📦 Smart Export:** Download individual files or export the entire batch as a compressed **ZIP**.
- **🌐 Format Support:** Works with **MP3, WAV, M4A, OGG, and FLAC**.

---

## 🚀 Tech Stack

- **React 18**: Component-based architecture for a responsive UI.
- **Vite**: Ultra-fast build tool and development server.
- **Material UI (MUI) 6**: Premium design system with custom "Glass" theme.
- **Web Audio API**: Low-latency, high-precision audio processing in the browser.
- **JSZip**: Efficient client-side ZIP generation for bulk downloads.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PramudithaN/silence-remover.git
   cd silence-remover
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📖 How to Use

1. **Upload:** Drag & drop your audio files into the drop zone or click to browse.
2. **Configure:** Adjust the sliders in the **Settings** card to match your audio's noise floor.
3. **Preview:** (Optional) If processing a single file, you'll see a waveform preview.
4. **Process:** Click **"Remove Silence"** to start the batch processing.
5. **Download:** Grab individual files or use the **"Download as ZIP"** button for bulk exports.

---

## 🙋‍♂️ Connect with Me

- **GitHub**: [github.com/PramudithaN](https://github.com/PramudithaN)
- **LinkedIn**: [linkedin.com/in/pramuditha-nadun-612b1b204](http://www.linkedin.com/in/pramuditha-nadun-612b1b204)
- **Email**: pramudithanadun@gmail.com

---

*Developed with ❤️ by Pramuditha Nadun.*
