"use client";
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminProfiler() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Initializing System...");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    setStatus("MooresData Online - Awaiting Target");
    startVideo();
  }

  function startVideo() {
    // Note: 'facingMode: user' ensures it uses the front camera on mobile
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => setStatus("Camera Access Denied"));
  }

  async function handleScan() {
    if (!videoRef.current) return;
    setStatus("Scanning Face...");
    
    const detection = await faceapi.detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      // Search Supabase for the match using the SQL function you ran earlier
      const { data, error } = await supabase.rpc('match_profiles', {
        query_embedding: Array.from(detection.descriptor),
        match_threshold: 0.5,
        match_count: 1
      });

      if (data && data.length > 0) {
        setProfile(data[0]);
        setStatus("Target Identified");
      } else {
        setStatus("Unknown Entity - Enroll via Database");
      }
    } else {
      setStatus("No Face Detected");
    }
  }

  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono p-4 md:p-10 flex flex-col items-center">
      <header className="w-full max-w-4xl border-b border-blue-900 mb-6 flex justify-between items-center pb-2">
        <h1 className="text-xl md:text-3xl font-bold tracking-tighter">MOORESDATA // PROFILER</h1>
        <div className="text-[10px] md:text-xs text-blue-700 animate-pulse">ENCRYPTION_ACTIVE</div>
      </header>

      {/* Responsive Camera Container */}
      <div className="relative w-full max-w-[640px] aspect-video border-2 border-blue-500 shadow-[0_0_20px_rgba(0,100,255,0.3)] bg-gray-900 overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale contrast-125" />
        <div className="absolute inset-0 pointer-events-none border-[0.5px] border-blue-500/20 opacity-30"></div>
        <div className="absolute top-4 left-4 text-[10px] text-blue-500 bg-black/50 p-1">REC: 00:24:13:00</div>
      </div>

      {/* Profiler Results Card */}
      <div className="w-full max-w-[640px] mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-blue-800 p-4 bg-blue-950/10">
          <h2 className="text-xs text-blue-600 mb-1 font-bold italic">SYSTEM_STATUS</h2>
          <p className="text-white text-sm uppercase">{status}</p>
        </div>

        {profile && (
          <div className="border border-green-800 p-4 bg-green-950/10 animate-in fade-in duration-500">
            <h2 className="text-xs text-green-600 mb-1 font-bold italic">MATCH_FOUND</h2>
            <p className="text-white text-lg font-bold uppercase">{profile.full_name}</p>
            <p className="text-green-400 text-xs mt-1">Status: {profile.budget_status}</p>
          </div>
        )}
      </div>

      <button 
        onClick={handleScan}
        className="mt-8 w-full max-w-[640px] py-4 bg-blue-950 border border-blue-500 hover:bg-blue-800 text-white font-bold uppercase tracking-widest transition-all"
      >
        Execute Recognition Protocol
      </button>
    </div>
  );
}