import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import InteractiveModel from './InteractiveModel';
import { HandData, ModelSettings, EnvironmentSettings } from '../types';
import { AlertTriangle } from 'lucide-react';

// Workaround for missing R3F JSX types
const R3FAmbientLight = 'ambientLight' as any;
const R3FSpotLight = 'spotLight' as any;

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-red-900/90 rounded-lg border border-red-500 backdrop-blur-md text-white w-64 text-center">
        <AlertTriangle className="w-8 h-8 mb-2 text-red-400" />
        <h3 className="font-bold text-lg mb-1">Failed to Load Model</h3>
        <p className="text-xs text-red-200 opacity-80">The 3D model could not be retrieved. Please check your connection or try uploading a local file.</p>
      </div>
    </Html>
  )
}

interface SceneContainerProps {
  modelUrl: string;
  handDataRef: React.MutableRefObject<HandData>;
  modelSettings: ModelSettings;
  envSettings: EnvironmentSettings;
}

const SceneContainer: React.FC<SceneContainerProps> = ({ 
  modelUrl, 
  handDataRef, 
  modelSettings,
  envSettings 
}) => {
  return (
    <Canvas shadows className="w-full h-full bg-slate-900">
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
      
      {/* Lighting & Environment */}
      <Environment 
        preset={envSettings.preset} 
        background={envSettings.background} 
        blur={envSettings.blur} 
      />
      <R3FAmbientLight intensity={0.5} />
      <R3FSpotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={1} 
        castShadow 
      />

      <ErrorBoundary key={modelUrl} fallback={<ErrorFallback />}>
        <Suspense fallback={<Html center><div className="text-white text-sm font-mono animate-pulse">Loading Model...</div></Html>}>
          <InteractiveModel 
            url={modelUrl} 
            handDataRef={handDataRef} 
            settings={modelSettings}
          />
        </Suspense>
      </ErrorBoundary>
      
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />

      {/* OrbitControls are enabled but can be overridden by hand logic in the model component */}
      <OrbitControls makeDefault enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </Canvas>
  );
};

export default SceneContainer;