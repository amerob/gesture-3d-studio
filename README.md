# Gesture3D Studio

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)
![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**Gesture3D Studio** is an interactive web experiment that merges Computer Vision with 3D rendering. It allows users to manipulate 3D GLB/GLTF models in real-time using natural hand gestures captured via a webcam, entirely in the browser.

Built with **React**, **Three.js (Fiber)**, and Google's **MediaPipe**.

![Demo Screenshot](https://via.placeholder.com/800x450?text=Gesture3D+Studio+Demo)

## ✨ Features

- **👋 Hand Gesture Control**: Control 3D models without touching the keyboard or mouse.
  - **Pinch (Index + Thumb)**: Rotate the model in 3D space.
  - **Fist (Clenched Hand)**: Scale the model size (Move hand Up/Down).
- **🤖 AI-Powered**: Uses MediaPipe Tasks Vision for high-performance, real-time hand tracking.
- **🎨 Scene Customization**:
  - Adjust material properties (Color, Roughness, Metalness).
  - Switch between high-dynamic-range (HDR) lighting environments (City, Sunset, Studio, etc.).
- **📂 Drag & Drop Upload**: Upload your own `.glb` or `.gltf` files to view them immediately.
- **⚡ High Performance**: Optimized render loop separates Computer Vision logic from the 3D render cycle to maintain 60FPS.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **3D Engine**: Three.js, React Three Fiber (R3F), Drei
*   **Computer Vision**: @mediapipe/tasks-vision
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

*   A modern web browser (Chrome, Edge, Firefox) with WebGL and Camera support.
*   Node.js (Recommended for local development server).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/amerob/gesture3d-studio.git
    cd gesture3d-studio
    ```

2.  **Run a local server**
    Since this project uses ES Modules and requires Camera permissions, it must be served over `localhost` or HTTPS.

    If you have Python installed:
    ```bash
    python3 -m http.server 8000
    ```
    
    Or using Node's `http-server`:
    ```bash
    npx http-server .
    ```

3.  **Open in Browser**
    Navigate to `http://localhost:8000` (or the port shown in your terminal).

## 🎮 How to Use

1.  **Enable Camera**: Click the Camera icon in the bottom right corner to start tracking.
2.  **Allow Permissions**: Grant the browser access to your webcam.
3.  **Gestures**:

| Gesture | Action | Description |
| :--- | :--- | :--- |
| **Pinch** 👌 | **Rotate** | Touch your **Index Finger** to your **Thumb**. Move your hand to rotate the object. |
| **Fist** ✊ | **Scale** | Close all fingers into a **Fist**. Move your hand **Up** to shrink or **Down** to enlarge. |
| **Open Palm** ✋ | **Idle** | The cursor tracks your hand, but no action is applied to the model. |

## 📂 Project Structure

```
.
├── components/
│   ├── HandManager.tsx       # MediaPipe setup and prediction loop
│   ├── InteractiveModel.tsx  # 3D Model logic and gesture transformation
│   ├── SceneContainer.tsx    # R3F Canvas, Lights, and Environment
│   └── UIOverlay.tsx         # Tailwind UI for settings and feedback
├── constants.ts              # Configuration and default model URLs
├── types.ts                  # TypeScript interfaces for Gestures and Settings
├── App.tsx                   # Main application entry
├── index.html                # Entry HTML (Import maps setup)
└── metadata.json             # App metadata
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

*   [Three.js](https://threejs.org/) for the amazing 3D library.
*   [Google MediaPipe](https://developers.google.com/mediapipe) for the robust hand tracking solution.
*   [Khronos Group](https://github.com/KhronosGroup/glTF-Sample-Models) for the sample models.
