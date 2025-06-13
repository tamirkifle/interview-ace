import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Square, Play, AlertCircle, Clock, Video, RotateCcw } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  questionText?: string;
  storyTitle?: string;
}

export const VideoRecorder = ({ 
  onRecordingComplete, 
  questionText, 
  storyTitle 
}: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Clean up resources
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
  }, [recordedUrl]);

  // Request camera permission and start preview
  const requestCamera = async () => {
    setIsLoadingCamera(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application. Please close other apps and try again.');
      } else {
        setError('Unable to access camera. Please check your permissions and try again.');
      }
    } finally {
      setIsLoadingCamera(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        onRecordingComplete?.(blob, duration);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Recording start error:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Reset everything
  const reset = () => {
    setIsPreviewMode(false);
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setDuration(0);
    setError(null);
    
    // Restart camera if we had permission
    if (hasPermission) {
      requestCamera();
    }
  };

  // View recorded video
  const viewRecording = () => {
    setIsPreviewMode(true);
  
    // Stop preview stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  
    // 🔥 Remove preview srcObject so it doesn’t interfere with playback
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

useEffect(() => {
    if (hasPermission && streamRef.current && videoRef.current) {
      console.log('[Preview] Attaching stream to videoRef');
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(err => {
          console.warn('[Preview] Failed to play video preview:', err);
        });
      };
    }
  }, [hasPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Permission not requested yet
  if (hasPermission === null) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Video className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Practice Recording</h3>
          <span className="text-sm text-gray-500 ml-2">(Optional)</span>
        </div>
        
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Record yourself answering this question to review your performance.
          </p>
          
          {questionText && (
            <div className="bg-white rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-gray-700 font-medium mb-2">Question:</p>
              <p className="text-sm text-gray-600">{questionText}</p>
              {storyTitle && (
                <p className="text-xs text-blue-600 mt-2">Using story: {storyTitle}</p>
              )}
            </div>
          )}
          
          <button
            onClick={requestCamera}
            disabled={isLoadingCamera}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isLoadingCamera ? 'Accessing Camera...' : 'Start Camera'}
          </button>
        </div>
      </div>
    );
  }

  // Permission denied or error
  if (hasPermission === false || error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-900">Camera Access Required</h3>
        </div>
        
        <p className="text-red-700 mb-4">{error}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={requestCamera}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show recorded video playback
  if (isPreviewMode && recordedUrl) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Play className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Recording Complete</h3>
            <span className="text-sm text-gray-500 ml-2">({formatDuration(duration)})</span>
          </div>
          
          <button
            onClick={reset}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Record Again
          </button>
        </div>
        
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={playbackRef}
            src={recordedUrl}
            controls
            className="w-full max-h-96 object-contain"
            preload="metadata"
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Review your recording above. You can record again if needed.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Record Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera preview and recording interface
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Video className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Practice Recording</h3>
          {isRecording && (
            <div className="flex items-center ml-4 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium">REC</span>
            </div>
          )}
        </div>
        
        {isRecording && (
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm font-mono">{formatDuration(duration)}</span>
          </div>
        )}
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-h-96 object-contain"
        />
        
        {/* Recording overlay */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            ● RECORDING
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <>
            <button
              onClick={startRecording}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Recording
            </button>
            
            {recordedBlob && (
              <button
                onClick={viewRecording}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                View Recording
              </button>
            )}
          </>
        ) : (
          <button
            onClick={stopRecording}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </button>
        )}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          💡 Recording is optional. Take your time to practice your answer before recording.
        </p>
      </div>
    </div>
  );
};