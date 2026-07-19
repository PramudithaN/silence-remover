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
    <Stack spacing={3} alignItems="center" textAlign="center">
      {/* Header Completion Card */}
      <Box
        sx={{
          background: 'rgba(52,211,153,0.06)',
          border: '1px solid rgba(52,211,153,0.25)',
          borderRadius: 3,
          p: '32px 24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D399',
            boxShadow: '0 0 16px rgba(52,211,153,0.2)',
          }}
        >
          <CheckCircle sx={{ fontSize: 32, display: 'block' }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.25 }}>
            Video Batch Processing Complete!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Successfully trimmed <strong>{completedItems.length}</strong> of{' '}
            {batchItems.length} videos.
          </Typography>
        </Box>
      </Box>

      {/* Bulk ZIP Download */}
      {completedItems.length > 1 && (
        <Box
          sx={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            p: 3,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Download all trimmed videos in a single ZIP archive
          </Typography>
          {isZipping ? (
            <Button
              variant="outlined"
              size="large"
              disabled
              startIcon={<CircularProgress size={18} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Packaging ZIP Archive…
            </Button>
          ) : zipUrl ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<FolderZip sx={{ fontSize: 20, display: 'block' }} />}
              component="a"
              href={zipUrl}
              download="silence_removed_videos.zip"
              sx={{
                py: 1.4,
                px: 4,
                fontWeight: 700,
                textTransform: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          width: '100%',
          overflow: 'hidden',
          textAlign: 'left',
        }}
      >
        <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Processed Videos
          </Typography>
        </Box>

        <Stack divide={<Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} />}>
          {batchItems.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.6,
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden', minWidth: 0 }}>
                <Movie sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0, display: 'block' }} />
                <Typography variant="body2" fontWeight={600} noWrap color="text.primary" sx={{ lineHeight: 1.3 }}>
                  #{idx + 1} {item.file.name}
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                {item.status === 'done' && item.resultBlob ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download sx={{ fontSize: 16, display: 'block' }} />}
                    onClick={() => downloadSingle(item)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justify: 'center',
                      textTransform: 'none',
                      borderColor: 'rgba(52,211,153,0.35)',
                      color: '#34D399',
                      fontWeight: 700,
                      py: 0.7,
                      px: 2,
                      '&:hover': { background: 'rgba(52,211,153,0.12)', borderColor: '#34D399' },
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
        startIcon={<RestartAlt sx={{ fontSize: 20, display: 'block' }} />}
        onClick={onReset}
        sx={{
          py: 1.4,
          px: 4,
          fontWeight: 600,
          textTransform: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'text.secondary',
          '&:hover': { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' },
        }}
      >
        Process New Batch
      </Button>
    </Stack>
  );
}
