import React from 'react';
import { Upload, Info, Settings, Maximize2, Move3d } from 'lucide-react';
import { ModelSettings, EnvironmentSettings, HandData, GestureType } from '../types';

interface UIOverlayProps {
  handData: HandData; // Live data for UI feedback
  modelSettings: ModelSettings;
  setModelSettings: React.Dispatch<React.SetStateAction<ModelSettings>>;
  envSettings: EnvironmentSettings;
  setEnvSettings: React.Dispatch<React.SetStateAction<EnvironmentSettings>>;
  onUpload: (file: File) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  handData,
  modelSettings,
  setModelSettings,
  envSettings,
  setEnvSettings,
  onUpload
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const getGestureLabel = () => {
    if (!handData.isPresent) return { text: "No Hand Detected", color: "text-gray-400", icon: <Move3d className="w-4 h-4"/> };
    switch (handData.gesture) {
      case GestureType.PINCH: return { text: "Rotating", color: "text-green-400", icon: <Maximize2 className="w-4 h-4"/> };
      case GestureType.FIST: return { text: "Scaling", color: "text-blue-400", icon: <Maximize2 className="w-4 h-4"/> };
      case GestureType.IDLE: return { text: "Hand Detected", color: "text-indigo-400", icon: <Move3d className="w-4 h-4"/> };
      default: return { text: "Tracking...", color: "text-white", icon: <Move3d className="w-4 h-4"/> };
    }
  };

  const status = getGestureLabel();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Gesture3D Studio
          </h1>
          <p className="text-sm text-slate-400">Interactive Spatial Viewer</p>
        </div>

        {/* Gesture Status Indicator */}
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${handData.isPresent ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <div className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
            {status.icon}
            {status.text}
          </div>
        </div>
      </div>

      {/* Main Control Area */}
      <div className="flex justify-between items-end pointer-events-auto">
        
        {/* Left Panel: Instructions & Upload */}
        <div className="flex flex-col gap-4 max-w-xs">
           <div className="glass-panel p-4 rounded-xl">
             <div className="flex items-center gap-2 mb-3 text-indigo-300">
               <Info className="w-5 h-5" />
               <h3 className="font-semibold">Controls</h3>
             </div>
             <ul className="text-sm space-y-2 text-slate-300">
               <li className="flex items-center gap-2">
                 <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">PINCH</span>
                 <span>Hold index & thumb to Rotate</span>
               </li>
               <li className="flex items-center gap-2">
                 <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">FIST</span>
                 <span>Make a fist & move up/down to Scale</span>
               </li>
               <li className="flex items-center gap-2">
                 <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">MOUSE</span>
                 <span>Orbit controls enabled</span>
               </li>
             </ul>
           </div>

           <label className="glass-panel p-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors group">
             <div className="flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                 <Upload className="w-5 h-5 text-white" />
               </div>
               <div>
                 <div className="font-medium text-slate-200">Upload Model</div>
                 <div className="text-xs text-slate-400">Supported: .glb, .gltf</div>
               </div>
             </div>
             <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleFileChange} />
           </label>
        </div>

        {/* Right Panel: Customization */}
        <div className="glass-panel p-5 rounded-xl w-72">
          <div className="flex items-center gap-2 mb-4 text-indigo-300">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            {/* Color */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium uppercase">Material Color</label>
              <div className="flex gap-2">
                {['#ffffff', '#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff'].map(c => (
                  <button
                    key={c}
                    onClick={() => setModelSettings(prev => ({ ...prev, color: c }))}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${modelSettings.color === c ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Metalness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <label>Metalness</label>
                <span>{modelSettings.metalness.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={modelSettings.metalness}
                onChange={(e) => setModelSettings(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Roughness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <label>Roughness</label>
                <span>{modelSettings.roughness.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={modelSettings.roughness}
                onChange={(e) => setModelSettings(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Environment */}
            <div className="space-y-1 pt-2 border-t border-slate-700">
              <label className="text-xs text-slate-400 font-medium uppercase">Environment</label>
              <select 
                value={envSettings.preset}
                onChange={(e) => setEnvSettings(prev => ({ ...prev, preset: e.target.value as any }))}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {['city', 'sunset', 'dawn', 'night', 'warehouse', 'studio'].map(opt => (
                   <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            </div>
             <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Show Background</span>
                <button 
                  onClick={() => setEnvSettings(prev => ({ ...prev, background: !prev.background }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${envSettings.background ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${envSettings.background ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
