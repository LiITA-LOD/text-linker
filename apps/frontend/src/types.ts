export type StepKey = 'origin' | 'conllu' | 'linked' | 'turtle';

export type FormData = Record<StepKey, string | null>;

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
  mergeWizardData: (stepKey: StepKey, value: string | null) => void;
}

export interface APIResponse {
  format: string;
  target: string;
}
