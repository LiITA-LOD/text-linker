import type React from 'react';
import { useState } from 'react';
import './Wizard.css';
import type { APIResponse, FormData, Step, StepData } from '../types';
import ExportTTL from './steps/ExportTTL';
import InputConllu from './steps/InputConllu';
import InputLinking from './steps/InputLinking';
import InputText from './steps/InputText';

const steps: Step[] = [
  { id: 1, title: 'Original', component: InputText },
  { id: 2, title: 'CoNLL-U', component: InputConllu },
  { id: 3, title: 'Linked', component: InputLinking },
  { id: 4, title: 'Turtle', component: ExportTTL },
];

const Wizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    text: '',
    conllu: '',
    linking: '',
    ttl: '',
  });

  // Track which steps have been completed through normal flow
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
    }
  };

  const handleNext = async (): Promise<void> => {
    if (currentStep === 1 && formData.text.trim()) {
      // Show loading state for tokenization
      setIsLoading(true);

      try {
        // Call the real tokenization API
        const conlluData = await callTokenizationAPI(formData.text);
        setFormData((prev) => ({ ...prev, conllu: conlluData }));
        setCompletedSteps(prev => new Set([...prev, 1]));
      } catch (error) {
        console.error('Tokenization failed:', error);
        // Show error message to user and don't proceed
        alert(
          `Tokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the tokenization service is running at http://0.0.0.0:8000/tokenizer`,
        );
        setIsLoading(false);
        return; // Don't proceed to next step
      }

      setIsLoading(false);
    }

    if (currentStep === 2 && formData.conllu.trim()) {
      // Show loading state for prelinking
      setIsLoading(true);

      try {
        // Call the real prelinker API
        const linkedConlluData = await callPrelinkerAPI(formData.conllu);
        setFormData((prev) => ({ ...prev, linking: linkedConlluData }));
        setCompletedSteps(prev => new Set([...prev, 2]));
      } catch (error) {
        console.error('Prelinking failed:', error);
        // Show error message to user and don't proceed
        alert(
          `Prelinking failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the prelinker service is running at http://0.0.0.0:8000/prelinker`,
        );
        setIsLoading(false);
        return; // Don't proceed to next step
      }

      setIsLoading(false);
    }

    if (currentStep === 3) {
      // Mark step 3 as completed (no API call needed)
      setCompletedSteps(prev => new Set([...prev, 3]));
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (stepData: StepData): void => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const getStepStatus = (stepId: number): 'completed' | 'active' | '' => {
    if (currentStep === stepId) return 'active';
    if (completedSteps.has(stepId)) return 'completed';
    return '';
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="wizard">
      <div className="step-indicator">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step ${getStepStatus(step.id)}`}
            onClick={() => handleStepClick(step.id)}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="step-note">
        💡 You can skip to any step by clicking on the step indicators above
      </div>

      {isLoading && (
        <div className="wizard-loading">
          <div className="loading-spinner"></div>
          <div className="loading-message">
            {currentStep === 1
              ? 'Tokenizing text...'
              : currentStep === 2
                ? 'Prelinking CoNLL-U data...'
                : 'Processing...'}
          </div>
        </div>
      )}

      <div className={`wizard-content ${isLoading ? 'loading' : ''}`}>
        <CurrentStepComponent data={formData} onDataChange={handleDataChange} />
      </div>

      <div className="wizard-footer">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={
            currentStep === steps.length ||
            isLoading ||
            (currentStep === 1 && !formData.text.trim())
          }
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Wizard;
