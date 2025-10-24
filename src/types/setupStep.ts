export interface SetupStep {
  id: number;
  stepOrder: number;
  title: string;
  description?: string;
  setupCommand: string;
  expectedExitCode: number;
  retryCount: number;
  timeoutSeconds: number;
  continueOnFailure: boolean;
}

export interface CreateSetupStepRequest {
  stepOrder?: number;
  title: string;
  description?: string;
  setupCommand: string;
  expectedExitCode?: number;
  retryCount?: number;
  timeoutSeconds?: number;
  continueOnFailure?: boolean;
}

export interface UpdateSetupStepRequest extends CreateSetupStepRequest {
  id: number;
}
