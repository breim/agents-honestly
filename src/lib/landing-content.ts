export type LogLine = {
  note: string;
  op: string;
  status: 'crash' | 'ok' | 'replayed';
  time: string;
  worker: string;
};

/** The exact moment the hero teases: a crash with nothing written, and the same call
    succeeding on a different worker forty minutes later. The journal section below plays
    the full sequence this is cut from. */
export const heroLog: LogLine[] = [
  { note: 'nothing written', op: 'send_reply(4921)', status: 'crash', time: '14:02:09.338', worker: 'worker-1' },
  { note: 'recovered from journal', op: 'send_reply(4921)', status: 'ok', time: '14:41:52.130', worker: 'worker-4' },
];

export const diagnosticFields = [
  { key: 'STATE', question: 'Who owns it when the worker dies?' },
  { key: 'KNOWLEDGE', question: 'Where does the answer actually live?' },
  { key: 'TIME', question: 'What survives a retry, a deploy, a three-day wait?' },
  { key: 'ACTION', question: 'What can be undone when step two already succeeded?' },
] as const;

export type LoadShift = {
  demo: { detail: string; value: string };
  label: string;
  production: { detail: string; value: string };
  /** Percent of quota, set only on the one row where a utilization bar earns its place. */
  utilization?: number;
};

export const loadShifts: LoadShift[] = [
  {
    demo: { detail: 'starts, replies, exits', value: '1 process' },
    label: 'Runtime',
    production: { detail: 'same run, survives deploys and OOM kills', value: '3 restarts' },
  },
  {
    demo: { detail: 'nobody to wait for', value: '0s' },
    label: 'Wait for a human',
    production: { detail: 'held for approval, no thread kept open', value: '71h 40m' },
  },
  {
    demo: { detail: 'one cooperative user', value: '1 run' },
    label: 'Concurrent load',
    production: { detail: 'against a 500 req/min provider quota', value: '2,400 req/min' },
    utilization: 480,
  },
  {
    demo: { detail: 'you typed it yourself', value: 'trusted' },
    label: 'Input trust',
    production: { detail: 'inputs the injection filter flags', value: '1 in 40' },
  },
];

export const journalFirstAttempt: LogLine[] = [
  { note: '→ {…}', op: 'get_order(4921)', status: 'ok', time: '14:02:09.001', worker: 'worker-1' },
  { note: '→ 420000', op: 'compute_credit()', status: 'ok', time: '14:02:09.114', worker: 'worker-1' },
  { note: '→ cr_8823_1', op: 'issue_credit()', status: 'ok', time: '14:02:09.220', worker: 'worker-1' },
  { note: 'OOMKilled — nothing written', op: 'send_reply()', status: 'crash', time: '14:02:09.338', worker: 'worker-1' },
];

export const journalRecovery: LogLine[] = [
  { note: 'from journal, not called', op: 'get_order(4921)', status: 'replayed', time: '14:41:52.006', worker: 'worker-4' },
  { note: 'from journal, not called', op: 'compute_credit()', status: 'replayed', time: '14:41:52.006', worker: 'worker-4' },
  { note: 'from journal, not called again', op: 'issue_credit()', status: 'replayed', time: '14:41:52.007', worker: 'worker-4' },
  { note: 'sent', op: 'send_reply()', status: 'ok', time: '14:41:52.130', worker: 'worker-4' },
];

export const readerRequirements = [
  'a typed language',
  'HTTP APIs',
  'enough SQL to inspect real data',
  'systems that can fail halfway through',
];
