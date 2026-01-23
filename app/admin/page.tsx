/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Ensure these match your Vercel Env Variables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminProfiler() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Initializing System...");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadModelsAndStart() {
      try {
        // Load models from your public/models folder
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        
        setStatus("System Online. Awaiting Scan...");
        startVideo();
      } catch (err) {
        setStatus("Error Loading Models");
        console.error(err);
      }
    }
    loadModelsAndStart();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setStatus("Camera Access Denied"));
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setStatus("Scanning...");

    const detection = await faceapi.detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const descriptor = Array.from(detection.descriptor);
      
      // Query Supabase for a match
      const { data, error } = await supabase.rpc('match_face', {
        query_embedding: descriptor,
        match_threshold: 0.5,
        match_count: 1
      });

      if (data && data.length > 0) {
        setProfile(data[0]);
        setStatus("Identity Confirmed");
      } else {
        setStatus("Unknown Entity Detected");
      }
    } else {
      setStatus("No Face Detected");
    }
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4 font-mono">
      <div className="border-2 border-cyan-900 p-4 rounded-lg bg-gray-900 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
        <h1 className="text-2xl mb-4 border-b border-cyan-900 pb-2">CTOS PROFILER // ADMIN_ACCESS</h1>
        
        <div className="relative mb-4 overflow-hidden rounded border border-cyan-500">
          <video ref={videoRef} autoPlay muted className="w-full h-auto" />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[20px] border-transparent shadow-[inset_0_0_60px_rgba(0,255,255,0.3)]"></div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm uppercase tracking-widest">System_Status: <span className="text-white">{status}</span></p>
          {profile && (
            <div className="p-3 border border-cyan-500 bg-cyan-950/30 animate-pulse">
              <p>NAME: {profile.full_name}</p>
              <p>OCCUPATION: {profile.occupation}</p>
              <p>STATUS: {profile.budget_status}</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleScan}
          className="w-full py-3 bg-cyan-700 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest transition-colors"
        >
          Initiate Scan
        </button>
      </div>
    </div>
  );
}