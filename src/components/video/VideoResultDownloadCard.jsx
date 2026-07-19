import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Download,
  FolderZip,
  RestartAlt,
  Movie,
} from '@mui/icons-material';
import JSZip from 'jszip';

export default function VideoResultDownloadCard({ batchItems, onReset }) {
  const [zipUrl, setZipUrl] = useState(null);
  const [isZipping, setIsZipping] = useState(false);

  const completedItems = batchItems.filter(
    (item) => item.status === 'done' && item.resultBlob
  );

  useEffect(() => {
    let objectUrl = null;
    let isMounted = true;

    async function generateZip() {
      if (completedItems.length <= 1) return;
      setIsZipping(true);
      try {
        const zip = new JSZip();
        for (const item of completedItems) {
          if (item.resultBlob) {
            const fileName = item.file.name.replace(
              /(\.[^.]+)$/,
              '_trimmed.mp4'
            );
            zip.file(fileName, item.resultBlob);
          }
        }
        const zipContent = await zip.generateAsync({ type: 'blob' });
        if (isMounted) {
          objectUrl = URL.createObjectURL(zipContent);
          setZipUrl(objectUrl);
        }
      } catch (e) {
        console.error('Failed to generate ZIP:', e);
      } finally {
        if (isMounted) setIsZipping(false);
      }
    }

    generateZip();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [batchItems]);

  const downloadSingle = (item) => {
    if (!item.resultBlob) return;
    const url = URL.createObjectURL(item.resultBlob);
    const name = item.file.name.replace(/(\.[^.]+)$/, '_trimmed.mp4');
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      {/* Node Header Completion Box */}
      <Box
        sx={{
          background: '#121620',
          border: '1px solid #10B981',
          borderRadius: '12px',
          p: '28px 24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '8px',
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10B981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
          }}
        >
          <CheckCircle sx={{ fontSize: 28, display: 'block' }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#F1F5F9" sx={{ lineHeight: 1.25 }}>
            Batch Video Output Ready
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontFamily: '"JetBrains Mono", monospace' }}>
            Successfully trimmed <strong>{completedItems.length}</strong> of{' '}
            {batchItems.length} videos.
          </Typography>
        </Box>
      </Box>

      {/* Bulk ZIP Download */}
      {completedItems.length > 1 && (
        <Box
          sx={{
            background: '#121620',
            border: '1px solid #1E2638',
            borderRadius: '12px',
            p: 2.5,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="#F1F5F9">
            Download all trimmed videos in a single ZIP archive
          </Typography>
          {isZipping ? (
            <Button
              variant="outlined"
              size="large"
              disabled
              startIcon={<CircularProgress size={18} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Packaging ZIP Archive…
            </Button>
          ) : zipUrl ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<FolderZip sx={{ fontSize: 18, display: 'block' }} />}
              component="a"
              href={zipUrl}
              download="silence_removed_videos.zip"
              sx={{
                py: 1.2,
                px: 4,
                fontWeight: 700,
                textTransform: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#A855F7',
                color: '#ffffff',
                '&:hover': { background: '#C084FC' },
              }}
            >
              Download All (.zip)
            </Button>
          ) : null}
        </Box>
      )}

      {/* Per File Download List */}
      <Box
        sx={{
          background: '#121620',
          border: '1px solid #1E2638',
          borderRadius: '12px',
          width: '100%',
          overflow: 'hidden',
          textAlign: 'left',
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #1E2638', background: '#0E121B' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#F1F5F9">
            Processed Video Streams
          </Typography>
        </Box>

        <Stack divide={<Box sx={{ borderBottom: '1px solid #1A2130' }} />}>
          {batchItems.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.4,
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden', minWidth: 0 }}>
                <Movie sx={{ fontSize: 18, color: '#475569', flexShrink: 0, display: 'block' }} />
                <Typography variant="body2" fontWeight={600} noWrap color="#F1F5F9" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem' }}>
                  #{idx + 1} {item.file.name}
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                {item.status === 'done' && item.resultBlob ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download sx={{ fontSize: 15, display: 'block' }} />}
                    onClick={() => downloadSingle(item)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textTransform: 'none',
                      borderColor: '#10B981',
                      color: '#10B981',
                      background: 'rgba(16,185,129,0.06)',
                      fontWeight: 700,
                      py: 0.6,
                      px: 1.8,
                      fontSize: '0.78rem',
                      fontFamily: '"JetBrains Mono", monospace',
                      '&:hover': { background: 'rgba(16,185,129,0.15)', borderColor: '#34D399' },
                    }}
                  >
                    Download MP4
                  </Button>
                ) : item.status === 'error' ? (
                  <Chip label={`Error: ${item.error}`} color="error" size="small" />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Processing…
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Reset Action Button */}
      <Button
        variant="outlined"
        size="large"
        startIcon={<RestartAlt sx={{ fontSize: 18, display: 'block' }} />}
        onClick={onReset}
        sx={{
          py: 1.2,
          px: 4,
          fontWeight: 700,
          textTransform: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: '#1E2638',
          background: '#121620',
          color: 'text.secondary',
          '&:hover': { borderColor: '#94A3B8', background: '#1A2130' },
        }}
      >
        Process New Batch
      </Button>
    </Stack>
  );
}
