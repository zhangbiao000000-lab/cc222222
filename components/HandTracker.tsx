import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { TreeState } from '../types';

interface HandTrackerProps {
  onStateChange: (state: TreeState) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const lastState = useRef<TreeState>('FORMED');
  
  // Stabilization buffer
  const stateBuffer = useRef<number[]>([]); 

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        startWebcam();
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
        setLoading(false);
      }
    };

    const startWebcam = async () => {
      if (videoRef.current && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
          setLoading(false);
        } catch (err) {
          console.error("Webcam not supported:", err);
          setLoading(false);
        }
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure canvas size matches video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const startTimeMs = performance.now();
      const results = handLandmarker.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw debug overlay
      if (results.landmarks) {
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#D4AF37", // Gold
            lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, {
            color: "#00FF00",
            lineWidth: 1,
            radius: 3
          });

          // Logic: Calculate openness
          // Index 0 is wrist. 4 is thumb tip, 8 index tip, 12 middle, 16 ring, 20 pinky
          const wrist = landmarks[0];
          const tips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
          
          // Calculate average distance of tips from wrist
          let avgDist = 0;
          tips.forEach(tip => {
            const d = Math.sqrt(
              Math.pow(tip.x - wrist.x, 2) + 
              Math.pow(tip.y - wrist.y, 2)
            );
            avgDist += d;
          });
          avgDist /= 5;

          // Heuristic threshold for "Open Hand" vs "Fist"
          // Typically closed fist has avgDist < 0.2 (normalized coords), open > 0.3
          const isOpen = avgDist > 0.25;

          // Buffer logic to prevent flickering
          stateBuffer.current.push(isOpen ? 1 : 0);
          if (stateBuffer.current.length > 10) stateBuffer.current.shift();

          const sum = stateBuffer.current.reduce((a, b) => a + b, 0);
          const smoothedIsOpen = sum > 5; // Majority vote

          const newState: TreeState = smoothedIsOpen ? 'CHAOS' : 'FORMED';
          
          if (newState !== lastState.current) {
             lastState.current = newState;
             onStateChange(newState);
          }
        }
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setupMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [onStateChange]);

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col items-center border-2 border-[#D4AF37] rounded-lg overflow-hidden bg-black/80 shadow-[0_0_15px_#D4AF37]">
      {loading && <div className="text-[#D4AF37] text-xs p-2 font-mono">Loading Vision...</div>}
      <div className="relative w-32 h-24">
        <video 
          ref={videoRef} 
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted 
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" 
        />
      </div>
      <div className="w-full bg-[#D4AF37] text-black text-[10px] text-center font-bold py-1 uppercase tracking-widest font-serif">
        Gesture Control
      </div>
    </div>
  );
};

export default HandTracker;
