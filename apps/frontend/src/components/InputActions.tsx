import {
  ContentCopy,
  ContentPaste,
  Download,
  Upload,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface InputActionsProps {
  onDataChange: (value: string) => void;
  value: string; // Current value of the textarea
  acceptFileTypes: string; // File input accept attribute
  placeholder: string;
  dragPlaceholder: string;
  rows?: number;
  className?: string;
  showOutputButtons?: boolean; // Whether to show copy/download buttons
  defaultFileName?: string; // Default filename for download
  showTextField?: boolean; // Whether to show the text input field
}

const InputActions: React.FC<InputActionsProps> = ({
  onDataChange,
  value,
  acceptFileTypes,
  placeholder,
  rows = 8,
  showOutputButtons = false,
  defaultFileName = 'output',
  showTextField = true,
}) => {
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }, []);

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      if (!file) return;

      setIsLoading(true);
      try {
        const text = await readFileAsText(file);
        onDataChange(text);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Error reading file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onDataChange, readFileAsText],
  );

  // Global drag and drop handlers
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (!isDragOver) {
        setIsDragOver(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only hide if we're leaving the window entirely
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsDragOver(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    // Add global event listeners
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [isDragOver, handleFileUpload]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const text = e.target.value;
    onDataChange(text);
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      onDataChange(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Unable to access clipboard. Please paste manually using Ctrl+V.');
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!value.trim()) {
      alert('No content to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      // You could add a toast notification here instead of alert
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to write to clipboard:', err);
      alert('Unable to copy to clipboard. Please copy manually using Ctrl+C.');
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!value.trim()) {
      alert('No content to download.');
      return;
    }

    // Try to use the modern File System Access API for "Save As" dialog
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${defaultFileName}.txt`,
          types: [
            {
              description: 'Text files',
              accept: {
                'text/plain': ['.txt'],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(value);
        await writable.close();

        alert('File saved successfully!');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // User cancelled the save dialog
          return;
        }
        console.error('Failed to save file:', err);
        alert('Failed to save file. Falling back to download...');
        // Fall back to the old method
        fallbackDownload();
      }
    } else {
      // Fallback for browsers that don't support File System Access API
      fallbackDownload();
    }
  };

  const fallbackDownload = (): void => {
    // Create a blob with the content
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${defaultFileName}.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ContentPaste />}
            onClick={handlePaste}
            disabled={isLoading}
            size="small"
          >
            Paste from Clipboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="small"
          >
            Upload File
          </Button>
        </Box>

        {showOutputButtons && (
          <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopy}
              disabled={isLoading || !value.trim()}
              size="small"
            >
              Copy to Clipboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={isLoading || !value.trim()}
              size="small"
            >
              Download File
            </Button>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptFileTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>

      {showTextField && (
        <Box sx={{ position: 'relative' }}>
          <TextField
            multiline
            rows={rows}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={isLoading}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              },
            }}
          />

          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.background.default, 0.8),
                borderRadius: 1,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading file...</Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {isDragOver &&
        createPortal(
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              backdropFilter: 'blur(4px)',
              border: '3px dashed',
              borderColor: theme.palette.primary.main,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                borderRadius: 2,
                padding: 3,
                border: '2px solid',
                borderColor: theme.palette.primary.main,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Drop file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Release to load the file content
              </Typography>
            </Box>
          </Box>,
          document.body,
        )}
    </>
  );
};

export default InputActions;
