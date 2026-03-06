import React, { useState, useRef, useEffect, useCallback } from 'react';
import SceneContainer from './components/SceneContainer';
import HandManager from './components/HandManager';
import UIOverlay from './components/UIOverlay';
import { HandData, GestureType, ModelSettings, EnvironmentSettings } from './types';
import { MODEL_URL_ROBOT } from './constants';

const App: React.FC = () => {
  const [currentModelUrl, setCurrentModelUrl] = useState<string>(MODEL_URL_ROBOT);
  
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    scale: 1,
    rotation: [0, 0, 0],
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.2,
    envMapIntensity: 1,
  });

  const [envSettings, setEnvSettings] = useState<EnvironmentSettings>({
    preset: 'city',
    blur: 0.8,
    background: true,
  });


  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  
  const handDataRef = useRef<HandData>({
    isPresent: false,
    gesture: GestureType.NONE,
    position: { x: 0.5, y: 0.5 },
    pinchDistance: 1,
  });

  const [uiHandData, setUiHandData] = useState<HandData>(handDataRef.current);  

  const [error, setError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 50; // ms

  useEffect(() => {
    return () => {
      if (currentModelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentModelUrl);
      }
    };
  }, [currentModelUrl]);

  const handleHandUpdate = useCallback(( HandData) => {
    handDataRef.current = data;
    
    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      return;
    }

    setUiHandData(prev => {
      const positionDiff = 
        Math.abs(prev.position.x - data.position.x) + 
        Math.abs(prev.position.y - data.position.y);
      
      if (
        positionDiff < 0.01 &&
        prev.gesture === data.gesture &&
        prev.isPresent === data.isPresent
      ) {
        return prev;
      }
      
      lastUpdateRef.current = now;
      return { ...data };
    });
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const validExtensions = ['.glb', '.gltf'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      setError('Please upload a valid GLB/GLTF file');
      return;
    }
    
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      if (currentModelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentModelUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setCurrentModelUrl(objectUrl);
    } catch (err) {
      setError('Failed to load model. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentModelUrl]);

  const toggleCamera = useCallback(() => {
    setIsCameraEnabled(prev => !prev);
  }, []);

  const updateModelSettings = useCallback((updates: Partial<ModelSettings>) => {
    setModelSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEnvSettings = useCallback((updates: Partial<EnvironmentSettings>) => {
    setEnvSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div 
      className="relative w-full h-screen bg-slate-900 overflow-hidden"
      role="application"
      aria-label="3D Hand Tracking Scene"
    >
      {/* Error Toast */}
      {error && (
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 
                     bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          role="alert"
        >
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 hover:bg-red-600 rounded"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 z-40 flex items-center justify-center 
                     bg-slate-900/90"
          role="status"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          <p className="text-white ml-4">Loading Model...</p>
        </div>
      )}

      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <SceneContainer 
          modelUrl={currentModelUrl} 
          handDataRef={handDataRef}
          modelSettings={modelSettings}
          envSettings={envSettings}
          onError={setError}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay 
          handData={uiHandData} 
          modelSettings={modelSettings}
          updateModelSettings={updateModelSettings}
          envSettings={envSettings}
          updateEnvSettings={updateEnvSettings}
          onUpload={handleFileUpload}
          onError={setError}
        />
      </div>

      {/* Hand Manager (Camera & Logic) */}
      <HandManager 
        isEnabled={isCameraEnabled} 
        toggleEnabled={toggleCamera}
        onHandUpdate={handleHandUpdate} 
        onError={setError}
      />
    </div>
  );
};

export default App;
