import { useCallback, useRef, useState } from "react";
import {
  computeKeepRanges,
  decodeAudioFromFile,
  detectSilence,
  DEFAULT_VIDEO_SETTINGS,
} from "../utils/videoDetection";
import { cutVideoToKeepRanges } from "../utils/videoCutter";

export function useVideoSilenceWorkflow() {
  const [stage, setStage] = useState("upload"); // 'upload' | 'analyzing' | 'review' | 'processing' | 'done'
  const [batchItems, setBatchItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_VIDEO_SETTINGS);
  const [cutMode, setCutMode] = useState("fast");
  const [error, setError] = useState(null);

  // AudioBuffer cache per file name + size
  const audioCacheRef = useRef(new Map());

  const getAudioBuffer = async (file) => {
    const key = `${file.name}-${file.size}`;
    if (audioCacheRef.current.has(key)) {
      return audioCacheRef.current.get(key);
    }
    const buf = await decodeAudioFromFile(file);
    audioCacheRef.current.set(key, buf);
    return buf;
  };

  const analyzeFiles = useCallback(
    async (files, detectionSettings) => {
      setStage("analyzing");
      setError(null);

      const newItems = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const buf = await getAudioBuffer(file);
          const segments = detectSilence(buf, detectionSettings);
          newItems.push({
            id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            file,
            duration: buf.duration,
            segments,
            status: "reviewed",
            progress: null,
            resultBlob: null,
            error: null,
          });
        } catch (e) {
          console.error(`Failed to analyze ${file.name}:`, e);
          newItems.push({
            id: `batch-${Date.now()}-${i}`,
            file,
            duration: 0,
            segments: [],
            status: "error",
            progress: null,
            resultBlob: null,
            error: e?.message || "Audio analysis failed",
          });
        }
      }

      setBatchItems((prev) => [...prev, ...newItems]);
      setStage("review");
    },
    []
  );

  const handleFilesSelected = useCallback(
    async (files) => {
      setBatchItems([]);
      audioCacheRef.current.clear();
      await analyzeFiles(files, settings);
    },
    [analyzeFiles, settings]
  );

  const addMoreFiles = useCallback(
    async (files) => {
      await analyzeFiles(files, settings);
    },
    [analyzeFiles, settings]
  );

  const rerunBatchWithSettings = useCallback(
    async (newSettings) => {
      setSettings(newSettings);
      setStage("analyzing");
      try {
        const updatedItems = [];
        for (const item of batchItems) {
          const buf = await getAudioBuffer(item.file);
          const segments = detectSilence(buf, newSettings);
          updatedItems.push({
            ...item,
            segments,
            duration: buf.duration,
          });
        }
        setBatchItems(updatedItems);
        setStage("review");
      } catch (e) {
        setError("Failed to update detection settings.");
        setStage("review");
      }
    },
    [batchItems]
  );

  const toggleSegment = useCallback((itemId, segmentId) => {
    setBatchItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          segments: item.segments.map((s) =>
            s.id === segmentId ? { ...s, keepForRemoval: !s.keepForRemoval } : s
          ),
        };
      })
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setBatchItems((prev) => {
      const remaining = prev.filter((item) => item.id !== itemId);
      if (remaining.length === 0) {
        setStage("upload");
      }
      return remaining;
    });
  }, []);

  const confirmAndCutBatch = useCallback(async () => {
    if (batchItems.length === 0) return;
    setStage("processing");
    setError(null);

    const updatedBatch = [...batchItems];

    for (let i = 0; i < updatedBatch.length; i++) {
      const item = updatedBatch[i];
      if (item.segments.length === 0) {
        item.status = "done";
        item.resultBlob = item.file;
        setBatchItems([...updatedBatch]);
        continue;
      }

      item.status = "processing";
      setBatchItems([...updatedBatch]);

      try {
        const keepRanges = computeKeepRanges(item.duration, item.segments);
        const blob = await cutVideoToKeepRanges(
          item.file,
          keepRanges,
          cutMode,
          (progress) => {
            item.progress = progress;
            setBatchItems([...updatedBatch]);
          }
        );

        item.status = "done";
        item.resultBlob = blob;
      } catch (e) {
        console.error(`Failed to cut video ${item.file.name}:`, e);
        item.status = "error";
        item.error = e?.message || "Failed to cut video";
      }

      setBatchItems([...updatedBatch]);
    }

    setStage("done");
  }, [batchItems, cutMode]);

  const reset = useCallback(() => {
    setStage("upload");
    setBatchItems([]);
    setError(null);
    setCutMode("fast");
    audioCacheRef.current.clear();
  }, []);

  return {
    stage,
    batchItems,
    settings,
    cutMode,
    error,
    setCutMode,
    handleFilesSelected,
    addMoreFiles,
    rerunBatchWithSettings,
    toggleSegment,
    removeItem,
    confirmAndCutBatch,
    reset,
  };
}
