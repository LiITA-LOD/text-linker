import { useState } from 'react';
import './Wizard.css';
import InputText from './steps/InputText';
import InputConllu from './steps/InputConllu';
import InputLinking from './steps/InputLinking';
import ExportTTL from './steps/ExportTTL';

const steps = [
  { id: 1, title: 'Input Text', component: InputText },
  { id: 2, title: 'Input CONLLU', component: InputConllu },
  { id: 3, title: 'Input Linking', component: InputLinking },
  { id: 4, title: 'Export TTL', component: ExportTTL },
];

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    text: '',
    conllu: '',
    linking: '',
    ttl: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2>Linguistic Data Annotation</h2>
        <div className="step-indicator">
          {steps.map((step, index) => (
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

      <div className="wizard-content">
        <CurrentStepComponent
          data={formData}
          onDataChange={handleDataChange}
        />
      </div>

      <div className="wizard-footer">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={currentStep === steps.length}
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Wizard; 