import { Card } from './Card';

export function GlassCard({ children, className = '', hover = true }) {
  return (
    <Card className={className} hover={hover}>
      {children}
    </Card>
  );
}
