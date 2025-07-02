export interface FormData {
  text: string;
  conllu: string;
  linking: string;
  ttl: string;
}

export interface StepData {
  [key: string]: any;
}

export enum StepState {
  INITIAL = 'initial',
  PENDING = 'pending',
  SETTLED = 'settled',
  ERRORED = 'errored',
}

export interface StepStatus {
  focused: boolean;
  state: StepState;
}

export interface Step {
  id: number;
  title: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  data: FormData;
  onDataChange: (stepData: StepData) => void;
}

export interface APIResponse {
  format: string;
  target: string;
}
