import React, { useState, useRef, useEffect } from 'react';
import SceneContainer from './components/SceneContainer';
import HandManager from './components/HandManager';
import UIOverlay from './components/UIOverlay';
import { HandData, GestureType, ModelSettings, EnvironmentSettings } from './types';
import { MODEL_URL_ROBOT } from './constants';

const App: React.FC = () => {
  // 3D Model State
  const [currentModelUrl, setCurrentModelUrl] = useState<string>(MODEL_URL_ROBOT);
  
  // Model Visual Settings
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    scale: 1,
    rotation: [0, 0, 0],
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.2,
    envMapIntensity: 1,
  });

  // Environment Settings
  const [envSettings, setEnvSettings] = useState<EnvironmentSettings>({
    preset: 'city',
    blur: 0.8,
    background: true,
  });

  // Hand Tracking State
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  
  // Ref to share high-frequency hand data with 3D scene without re-renders
  const handDataRef = useRef<HandData>({
    isPresent: false,
    gesture: GestureType.NONE,
    position: { x: 0.5, y: 0.5 },
    pinchDistance: 1,
  });

  // State specifically for UI updates (debounced/throttled naturally by React state updates if needed, 
  // but here we might update it less frequently or just use a ticker if perf is an issue. 
  // For this demo, we'll sync it inside the HandManager callback).
  const [uiHandData, setUiHandData] = useState<HandData>(handDataRef.current);

  const handleHandUpdate = (data: HandData) => {
    // Update ref for Three.js loop
    handDataRef.current = data;
    
    // Update state for React UI (Overlay feedback)
    // Optimization: only update UI state if significant change to avoid React thrashing
    // But for simplicity in this demo, we update. 
    // In production, you might throttle this.
    setUiHandData({ ...data }); 
  };

  const handleFileUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCurrentModelUrl(objectUrl);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <SceneContainer 
          modelUrl={currentModelUrl} 
          handDataRef={handDataRef}
          modelSettings={modelSettings}
          envSettings={envSettings}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay 
          handData={uiHandData} 
          modelSettings={modelSettings}
          setModelSettings={setModelSettings}
          envSettings={envSettings}
          setEnvSettings={setEnvSettings}
          onUpload={handleFileUpload}
        />
      </div>

      {/* Hand Manager (Camera & Logic) */}
      <HandManager 
        isEnabled={isCameraEnabled} 
        toggleEnabled={() => setIsCameraEnabled(!isCameraEnabled)} 
        onHandUpdate={handleHandUpdate} 
      />
    </div>
  );
};

export default App;
