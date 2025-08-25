/**
 * Exportaciones centralizadas de componentes UI
 * Permite importar todos los componentes base desde un solo lugar
 */

// Button components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton,
  type ButtonProps,
} from './Button';

// Input components
export {
  Input,
  SearchInput,
  PasswordInput,
  NumberInput,
  type InputProps,
} from './Input';

// Card components
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatCard,
  type CardProps,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
  type StatCardProps,
} from './Card';

// Loading components
export {
  Spinner,
  LoadingOverlay,
  LoadingInline,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  LoadingButton,
  LoadingState,
  LoadingScreen,
  ProgressBar,
  type SpinnerProps,
  type LoadingOverlayProps,
  type LoadingInlineProps,
  type SkeletonProps,
  type LoadingButtonProps,
  type LoadingStateProps,
  type LoadingScreenProps,
  type ProgressBarProps,
} from './Loading';

// Modal components
export {
  Modal,
  ConfirmModal,
  type ModalProps,
  type ConfirmModalProps,
} from './Modal';

// Toast components
export {
  ToastContainer,
  ToastComponent,
  ToastProvider,
  useToast,
  useToastContext,
  type Toast,
  type ToastProps,
  type ToastContainerProps,
  type ToastProviderProps,
} from './Toast';

// Table components
export {
  Table,
  Pagination,
  type TableProps,
  type PaginationProps,
} from './Table';

// Empty state components
export {
  EmptyState,
  NoProductsFound,
  NoStockAlerts,
  NoRequestsFound,
  NoUsersFound,
  NoMovementsFound,
  SearchNotFound,
  ErrorState,
  type EmptyStateProps,
} from './EmptyState';