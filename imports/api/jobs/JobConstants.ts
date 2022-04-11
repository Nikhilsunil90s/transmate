export enum JobPriority {
  HIGH = 1,
  NORMAL = 10,
  LOW = 20
}

export interface LogOptions {
  echo?: boolean;
  data?: any;
  level?: "info" | "success" | "warning" | "danger";
}
export interface Job {
  data: any;
  log: (message: string, logOptions?: LogOptions) => void;
  done: (message: string | Object) => void;
  fail: (message: string) => void;
}

export interface JobProcessOptions {
  concurrency: number;

  // NO USE
  prefetch: number;

  // TODO:move to save
  workTimeout: number;
}

export type JobProcessFunction = (
  job: Job,
  callback: () => void
) => Promise<void>;
