
import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface CameraInputProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const CameraInput: React.FC<CameraInputProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
      onCancel();
    }
  }, [onCancel]);

  React.useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        setCapturedImage(base64);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md h-full flex flex-col">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="flex-1 object-cover w-full"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 px-4">
              <button 
                onClick={onCancel}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white"
              >
                <X size={24} />
              </button>
              <button 
                onClick={takePhoto}
                className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900" />
              </button>
              <div className="w-12" /> {/* Spacer */}
            </div>
          </>
        ) : (
          <>
            <img 
              src={`data:image/jpeg;base64,${capturedImage}`} 
              className="flex-1 object-contain w-full bg-black"
              alt="Captured"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 px-4">
              <button 
                onClick={handleRetake}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium"
              >
                <RefreshCw size={20} /> Retake
              </button>
              <button 
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-full text-white font-bold shadow-lg shadow-green-500/30"
              >
                <Check size={20} /> Analyze Food
              </button>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraInput;
