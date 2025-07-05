import { ContentPaste, Upload } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useRef, useState } from 'react';

interface InputActionsProps {
  onDataChange: (data: { [key: string]: string }) => void;
  dataKey: string; // The key to use when calling onDataChange (e.g., 'text', 'conllu')
  value: string; // Current value of the textarea
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  acceptFileTypes: string; // File input accept attribute
  placeholder: string;
  dragPlaceholder: string;
  rows?: number;
  className?: string;
}

const InputActions: React.FC<InputActionsProps> = ({
  onDataChange,
  dataKey,
  value,
  isLoading,
  setIsLoading,
  acceptFileTypes,
  placeholder,
  dragPlaceholder,
  rows = 8,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    onDataChange({ [dataKey]: e.target.value });
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      onDataChange({ [dataKey]: text });
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Unable to access clipboard. Please paste manually using Ctrl+V.');
    }
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await readFileAsText(file);
      onDataChange({ [dataKey]: text });
    } catch (err) {
      console.error('Error reading file:', err);
      alert('Error reading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ContentPaste />}
          onClick={handlePaste}
          disabled={isLoading}
        >
          Paste from Clipboard
        </Button>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptFileTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>

      <Box sx={{ position: 'relative' }}>
        <TextField
          multiline
          rows={rows}
          value={value}
          onChange={handleTextChange}
          placeholder={isDragOver ? dragPlaceholder : placeholder}
          disabled={isLoading}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: isDragOver
                ? '2px dashed #6366f1'
                : '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused': {
                border: '2px solid #6366f1',
              },
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {isDragOver && (
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
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 1,
              border: '2px dashed #6366f1',
              zIndex: 1,
            }}
          >
            <Typography variant="h6" color="primary">
              📄 Drop file here to load its content
            </Typography>
          </Box>
        )}

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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 1,
              zIndex: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Loading file...</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default InputActions;
