// Exports principales del módulo login
export { default as LoginForm } from './LoginForm';
export { default as LoginMain } from './LoginMain';
export { default as TestingPanel } from './testing/TestingPanel';

// Re-export de tipos relacionados
export type { 
  LoginFormProps, 
  LoginMainProps, 
  TestingPanelProps,
  TestResult,
  TestCredential 
} from '@/types/auth';
