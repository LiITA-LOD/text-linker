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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    conllu: '',
    linking: '',
    ttl: '',
    skipTextStep: false,
  });

  const generateSampleConllu = (text) => {
    // Simple tokenization and CONLLU generation
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) {
      return '# No text provided for tokenization\n';
    }

    let conllu = '# Generated CONLLU from input text\n';
    conllu += '# Columns: ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD, DEPREL, DEPS, MISC\n\n';
    
    words.forEach((word, index) => {
      const id = index + 1;
      const form = word.replace(/[^\w\s]/g, ''); // Remove punctuation for form
      const lemma = form.toLowerCase();
      const upos = getUPOS(form);
      const xpos = upos;
      const feats = getFeatures(form, upos);
      const head = getHead(id, words.length);
      const deprel = getDepRel(upos, head);
      
      conllu += `${id}\t${form}\t${lemma}\t${upos}\t${xpos}\t${feats}\t${head}\t${deprel}\t_\t_\n`;
    });
    
    conllu += '\n';
    return conllu;
  };

  const getUPOS = (word) => {
    // Simple POS tagging logic
    const lower = word.toLowerCase();
    if (['the', 'a', 'an', 'this', 'that', 'these', 'those'].includes(lower)) return 'DET';
    if (['is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'].includes(lower)) return 'AUX';
    if (lower.endsWith('ing')) return 'VERB';
    if (lower.endsWith('ed')) return 'VERB';
    if (lower.endsWith('s') && lower.length > 3) return 'NOUN';
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(lower)) return 'PRON';
    if (['in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'down'].includes(lower)) return 'ADP';
    if (['and', 'or', 'but', 'if', 'because', 'when', 'where', 'why', 'how'].includes(lower)) return 'CCONJ';
    if (['quickly', 'slowly', 'well', 'badly', 'very', 'really', 'quite'].includes(lower)) return 'ADV';
    if (['big', 'small', 'good', 'bad', 'new', 'old', 'young', 'beautiful', 'ugly'].includes(lower)) return 'ADJ';
    if (/^\d+$/.test(word)) return 'NUM';
    if (/^[A-Z]/.test(word)) return 'PROPN';
    return 'NOUN'; // Default to noun
  };

  const getFeatures = (word, upos) => {
    const lower = word.toLowerCase();
    const features = [];
    
    if (upos === 'NOUN' || upos === 'PROPN') {
      features.push('Number=Sing');
      if (lower.endsWith('s') && !lower.endsWith('ss')) features.push('Number=Plur');
    }
    if (upos === 'VERB') {
      if (lower.endsWith('ing')) features.push('VerbForm=Ger');
      else if (lower.endsWith('ed')) features.push('Tense=Past');
      else features.push('VerbForm=Fin');
    }
    if (upos === 'PRON') {
      if (['i', 'we'].includes(lower)) features.push('Person=1');
      else if (['you'].includes(lower)) features.push('Person=2');
      else features.push('Person=3');
    }
    
    return features.length > 0 ? features.join('|') : '_';
  };

  const getHead = (id, totalWords) => {
    // Simple dependency: first word is root, others depend on previous
    if (id === 1) return 0; // Root
    return id - 1;
  };

  const getDepRel = (upos, head) => {
    if (head === 0) return 'root';
    if (upos === 'DET') return 'det';
    if (upos === 'ADJ') return 'amod';
    if (upos === 'ADP') return 'case';
    if (upos === 'AUX') return 'aux';
    return 'nmod'; // Default
  };

  const handleNext = async () => {
    if (currentStep === 1 && formData.text.trim() && !formData.skipTextStep) {
      // Show loading state for tokenization
      setIsLoading(true);
      
      // Simulate server call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate sample CONLLU
      const sampleConllu = generateSampleConllu(formData.text);
      setFormData(prev => ({ ...prev, conllu: sampleConllu }));
      
      setIsLoading(false);
    }
    
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
    
    // Handle skip functionality
    if (stepData.skipTextStep && currentStep === 1) {
      // Clear the skip flag and move to next step
      setFormData(prev => ({ ...prev, skipTextStep: false }));
      setCurrentStep(2);
    }
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

      {isLoading && (
        <div className="wizard-loading">
          <div className="loading-spinner"></div>
          <div className="loading-message">Tokenizing text...</div>
        </div>
      )}

      <div className={`wizard-content ${isLoading ? 'loading' : ''}`}>
        <CurrentStepComponent
          data={formData}
          onDataChange={handleDataChange}
        />
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
          disabled={currentStep === steps.length || isLoading || (currentStep === 1 && !formData.text.trim() && !formData.skipTextStep)}
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Wizard; 