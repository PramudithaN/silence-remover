import React from 'react';
import { Box, Typography, Alert, Stack, CircularProgress } from '@mui/material';
import { useVideoSilenceWorkflow } from '../../hooks/useVideoSilenceWorkflow';
import VideoUploaderCard from './VideoUploaderCard';
import VideoBatchReview from './VideoBatchReview';
import VideoProcessingCard from './VideoProcessingCard';
import VideoResultDownloadCard from './VideoResultDownloadCard';

export default function VideoSilenceRemover() {
  const {
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
  } = useVideoSilenceWorkflow();

  const currentlyProcessingItem = batchItems.find(
    (item) => item.status === 'processing'
  );

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      {stage === 'upload' && (
        <VideoUploaderCard onFilesSelected={handleFilesSelected} />
      )}

      {stage === 'analyzing' && (
        <Box
          sx={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 2,
            p: 8,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={44} />
          <Typography variant="h6" fontWeight={600}>
            Analyzing audio waveforms for silent parts…
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Decoding audio tracks client-side with Web Audio API.
          </Typography>
        </Box>
      )}

      {stage === 'review' && batchItems.length > 0 && (
        <VideoBatchReview
          batchItems={batchItems}
          settings={settings}
          cutMode={cutMode}
          onCutModeChange={setCutMode}
          onToggleSegment={toggleSegment}
          onSettingsChange={rerunBatchWithSettings}
          onRemoveItem={removeItem}
          onAddMoreFiles={addMoreFiles}
          onConfirmBatch={confirmAndCutBatch}
          onCancel={reset}
        />
      )}

      {stage === 'processing' && (
        <VideoProcessingCard
          batchItems={batchItems}
          currentlyProcessingItem={currentlyProcessingItem}
        />
      )}

      {stage === 'done' && batchItems.length > 0 && (
        <VideoResultDownloadCard batchItems={batchItems} onReset={reset} />
      )}
    </Stack>
  );
}
