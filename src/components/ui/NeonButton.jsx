import { Button } from './Button';

export function NeonButton({ children, className = '', variant = 'primary', ...props }) {
  return (
    <Button className={className} variant={variant} {...props}>
      {children}
    </Button>
  );
}
