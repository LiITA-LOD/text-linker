import {
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Step as MuiStep,
  Paper,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import type {
  APIResponse,
  FormData,
  Step,
  StepKey,
  StepStatus,
} from '../types';
import { StepState } from '../types';
import Turtle from './steps/Turtle';
import Conllu from './steps/Conllu';
import Linked from './steps/Linked';
import Origin from './steps/Origin';

const steps: Step[] = [
  { id: 1, title: 'Original', component: Origin },
  { id: 2, title: 'CoNLL-U', component: Conllu },
  { id: 3, title: 'Linked', component: Linked },
  { id: 4, title: 'Turtle', component: Turtle },
];

const Wizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    conllu: '',
    linked: '',
    turtle: '',
  });

  // New step state tracking system
  const [stepStates, setStepStates] = useState<Map<number, StepStatus>>(() => {
    const initialStates = new Map<number, StepStatus>();
    steps.forEach((step) => {
      initialStates.set(step.id, {
        focused: step.id === 1,
        state: step.id === 1 ? StepState.INITIAL : StepState.INITIAL,
      });
    });
    return initialStates;
  });

  const updateStepState = (
    stepId: number,
    updates: Partial<StepStatus>,
  ): void => {
    setStepStates((prev) => {
      const newStates = new Map(prev);
      const currentState = newStates.get(stepId) || {
        focused: false,
        state: StepState.INITIAL,
      };
      newStates.set(stepId, { ...currentState, ...updates });
      return newStates;
    });
  };

  const updateStepFocus = (focusedStepId: number): void => {
    setStepStates((prev) => {
      const newStates = new Map(prev);
      // Set all steps to not focused
      steps.forEach((step) => {
        const currentState = newStates.get(step.id) || {
          focused: false,
          state: StepState.INITIAL,
        };
        newStates.set(step.id, { ...currentState, focused: false });
      });
      // Set the focused step
      const focusedState = newStates.get(focusedStepId) || {
        focused: false,
        state: StepState.INITIAL,
      };
      newStates.set(focusedStepId, { ...focusedState, focused: true });
      return newStates;
    });
  };

  const callTokenizationAPI = async (text: string): Promise<string> => {
    try {
      const response = await fetch('http://0.0.0.0:8000/tokenizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: text,
          format: 'plain',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.format !== 'conllu') {
        throw new Error('Unexpected response format from tokenization API');
      }

      return data.target;
    } catch (error) {
      console.error('Tokenization API error:', error);
      throw new Error(
        `Failed to tokenize text: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const callPrelinkerAPI = async (conlluData: string): Promise<string> => {
    try {
      const response = await fetch('http://0.0.0.0:8000/prelinker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: conlluData,
          format: 'conllu',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.format !== 'conllu') {
        throw new Error('Unexpected response format from prelinker API');
      }

      return data.target;
    } catch (error) {
      console.error('Prelinker API error:', error);
      throw new Error(
        `Failed to prelink CoNLL-U data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const handleStepClick = (stepId: number): void => {
    if (stepId !== currentStep) {
      setCurrentStep(stepId);
      updateStepFocus(stepId);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (currentStep === 1 && formData.origin.trim()) {
      // Update step 1 to pending
      updateStepState(1, { state: StepState.PENDING });
      setIsLoading(true);

      try {
        // Call the real tokenization API
        const conlluData = await callTokenizationAPI(formData.origin);
        setFormData((prev) => ({ ...prev, conllu: conlluData }));
        // Update step 1 to settled and step 2 to initial
        updateStepState(1, { state: StepState.SETTLED });
        updateStepState(2, { state: StepState.INITIAL });
      } catch (error) {
        console.error('Tokenization failed:', error);
        // Update step 1 to errored
        updateStepState(1, { state: StepState.ERRORED });
        alert(
          `Tokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the tokenization service is running at http://0.0.0.0:8000/tokenizer`,
        );
        setIsLoading(false);
        return; // Don't proceed to next step
      }

      setIsLoading(false);
    }

    if (currentStep === 2 && formData.conllu.trim()) {
      // Update step 2 to pending
      updateStepState(2, { state: StepState.PENDING });
      setIsLoading(true);

      try {
        // Call the real prelinker API
        const linkedConlluData = await callPrelinkerAPI(formData.conllu);
        setFormData((prev) => ({ ...prev, linked: linkedConlluData }));
        // Update step 2 to settled and step 3 to initial
        updateStepState(2, { state: StepState.SETTLED });
        updateStepState(3, { state: StepState.INITIAL });
      } catch (error) {
        console.error('Prelinking failed:', error);
        // Update step 2 to errored
        updateStepState(2, { state: StepState.ERRORED });
        alert(
          `Prelinking failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the prelinker service is running at http://0.0.0.0:8000/prelinker`,
        );
        setIsLoading(false);
        return; // Don't proceed to next step
      }

      setIsLoading(false);
    }

    if (currentStep === 3) {
      // Mark step 3 as settled (no API call needed)
      updateStepState(3, { state: StepState.SETTLED });
      updateStepState(4, { state: StepState.INITIAL });
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateStepFocus(nextStep);
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStepFocus(prevStep);
    }
  };

  const handleDataChange = (stepKey: StepKey, value: string): void => {
    setFormData((prev) => ({ ...prev, [stepKey]: value }));
  };

  const getStepStatus = (stepId: number): string => {
    const stepStatus = stepStates.get(stepId);
    if (!stepStatus) return '';

    if (stepStatus.focused) return 'active';
    return stepStatus.state;
  };

  const getStepIcon = (stepId: number) => {
    const stepStatus = stepStates.get(stepId);
    if (!stepStatus) return <RadioButtonUnchecked />;

    switch (stepStatus.state) {
      case StepState.SETTLED:
        return <CheckCircle color="success" />;
      case StepState.ERRORED:
        return <ErrorIcon color="error" />;
      case StepState.PENDING:
        return <Pending color="primary" />;
      default:
        return stepStatus.focused ? (
          <RadioButtonUnchecked color="primary" />
        ) : (
          <RadioButtonUnchecked />
        );
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Horizontal Stepper */}
      <Paper elevation={0}>
        <Stepper activeStep={currentStep - 1} sx={{ p: 3 }}>
          {steps.map((step, index) => (
            <MuiStep
              key={step.id}
              completed={getStepStatus(step.id) === 'settled'}
            >
              <StepLabel
                icon={getStepIcon(step.id)}
                onClick={() => handleStepClick(step.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {step.title}
                </Typography>
                {getStepStatus(step.id) === 'error' && (
                  <Chip label="Error" color="error" size="small" sx={{ ml: 1 }} />
                )}
                {getStepStatus(step.id) === 'pending' && (
                  <Chip label="Processing" color="primary" size="small" sx={{ ml: 1 }} />
                )}
              </StepLabel>
            </MuiStep>
          ))}
        </Stepper>

        <Alert severity="info" sx={{ mx: 3, mb: 3, fontSize: '0.875rem' }}>
          You can skip to any step by clicking on the step indicators above.
          During any step you can save the data and load it back to continue at a later time.
        </Alert>
      </Paper>

      {/* Fullscreen Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: 300,
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {currentStep === 1
                ? 'Tokenizing text...'
                : currentStep === 2
                  ? 'Prelinking CoNLL-U data...'
                  : 'Processing...'}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {currentStep === 1
                ? 'Converting your text into CoNLL-U format'
                : currentStep === 2
                  ? 'Adding entity linking annotations'
                  : 'Processing your data...'}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Current Step Content */}
      <Paper elevation={0}>
        <Box sx={{ p: 3 }}>
          <CurrentStepComponent data={formData} mergeWizardData={handleDataChange} />
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              currentStep === steps.length ||
              isLoading ||
              (currentStep === 1 && !formData.origin.trim())
            }
          >
            {currentStep === steps.length ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Wizard;
