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
    skipTextStep: false,
  });

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

  const handleNext = async (): Promise<void> => {
    if (currentStep === 1 && formData.text.trim() && !formData.skipTextStep) {
      // Show loading state for tokenization
      setIsLoading(true);

      try {
        // Call the real tokenization API
        const conlluData = await callTokenizationAPI(formData.text);
        setFormData((prev) => ({ ...prev, conllu: conlluData }));
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

    // Handle skip functionality
    if (stepData.skipTextStep && currentStep === 1) {
      // Clear the skip flag and move to next step
      setFormData((prev) => ({ ...prev, skipTextStep: false }));
      setCurrentStep(2);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2>Linguistic Data Annotation</h2>
        <div className="step-indicator">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep > step.id ? 'completed' : currentStep === step.id ? 'active' : ''}`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
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
            (currentStep === 1 &&
              !formData.text.trim() &&
              !formData.skipTextStep)
          }
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Wizard;
