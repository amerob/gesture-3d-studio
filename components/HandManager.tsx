import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { HandData, GestureType } from '../types';
import { HAND_LANDMARKER_TASK } from '../constants';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface HandManagerProps {
  onHandUpdate: (data: HandData) => void;
  isEnabled: boolean;
  toggleEnabled: () => void;
}

const HandManager: React.FC<HandManagerProps> = ({ onHandUpdate, isEnabled, toggleEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let mounted = true;

    const setupMediaPipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!mounted) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HAND_LANDMARKER_TASK,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (mounted) {
          handLandmarkerRef.current = landmarker;
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load AI model.");
        setLoading(false);
      }
    };

    if (isEnabled && !handLandmarkerRef.current) {
      setupMediaPipe();
    }

    return () => {
      mounted = false;
      // Cleanup is tricky with MP, usually we just stop the loop.
    };
  }, [isEnabled]);

  // Start Webcam
  useEffect(() => {
    const startCamera = async () => {
      if (isEnabled && videoRef.current && !loading && handLandmarkerRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predict);
          }
        } catch (err) {
          console.error("Camera error:", err);
          setError("Camera access denied.");
        }
      } else {
        // Stop streams if disabled
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    };

    startCamera();

    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, loading]);

  // Prediction Loop
  const predict = async () => {
    if (!videoRef.current || !handLandmarkerRef.current || !canvasRef.current) return;

    // Ensure video is playing
    if (videoRef.current.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(predict);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    const result = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

    // Default "empty" data
    const handData: HandData = {
      isPresent: false,
      gesture: GestureType.NONE,
      position: { x: 0.5, y: 0.5 },
      pinchDistance: 1,
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];
      handData.isPresent = true;

      // Draw landmarks
      const drawingUtils = new DrawingUtils(ctx);
      drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 3
      });
      drawingUtils.drawLandmarks(landmarks, { 
        color: "#FF0000", 
        lineWidth: 1,
        radius: 3 
      });

      // Analyze Gesture
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      
      const thumbIp = landmarks[3]; // Thumb knuckle
      const indexPip = landmarks[6]; // Index knuckle
      
      // Calculate Pinch (Thumb Tip to Index Tip)
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dz = thumbTip.z - indexTip.z;
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      handData.pinchDistance = distance;

      // Calculate Center Position (Average of Index and Thumb)
      handData.position = {
        x: (thumbTip.x + indexTip.x) / 2,
        y: (thumbTip.y + indexTip.y) / 2
      };

      // Detect Fist: Check if finger tips are lower (higher y value) than their PIP joints
      // Note: Landmarks Y coordinate increases downwards.
      // A simple fist check: are tips below (in screen space, higher Y) the knuckles?
      // Actually better check is distance to wrist (0).
      const wrist = landmarks[0];
      
      const isFist = [indexTip, middleTip, ringTip, pinkyTip].every(tip => {
        // Calculate dist to wrist
        const dToWrist = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
        return dToWrist < 0.15; // Tunable threshold
      });

      if (isFist) {
        handData.gesture = GestureType.FIST;
      } else if (distance < 0.08) {
        handData.gesture = GestureType.PINCH;
      } else {
        handData.gesture = GestureType.IDLE;
      }
    }

    onHandUpdate(handData);
    requestRef.current = requestAnimationFrame(predict);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Toggle Button */}
      <button 
        onClick={toggleEnabled}
        className={`p-3 rounded-full shadow-lg transition-colors duration-200 ${isEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}`}
        title={isEnabled ? "Disable Camera" : "Enable Camera"}
      >
        {isEnabled ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-gray-300" />}
      </button>

      {/* Video Preview Panel */}
      {isEnabled && (
        <div className="glass-panel p-2 rounded-xl overflow-hidden relative shadow-2xl transition-all duration-300 w-48 h-36">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="ml-2 text-xs text-indigo-200">Loading AI...</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-80 z-10 p-2 text-center">
              <span className="text-xs text-red-200">{error}</span>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" // Mirror video
            autoPlay 
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" // Mirror canvas to match video
          />
          
          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 px-2 py-0.5 rounded text-[10px] text-white">
            Hand Tracker
          </div>
        </div>
      )}
    </div>
  );
};

export default HandManager;