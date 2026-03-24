import { motion } from 'framer-motion';

export function Button({
  children,
  className = '',
  variant = 'primary',
  as: Component = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 disabled:cursor-not-allowed disabled:opacity-65';
  const variants = {
    primary: 'border border-cyan-300/20 bg-gradient-to-r from-neon to-violetNova text-white shadow-[0_10px_26px_rgba(59,130,246,0.16)] hover:glow hover:brightness-110',
    secondary: 'glass border-white/10 text-slate-100 hover:border-neon hover:text-white',
    ghost: 'border border-transparent bg-white/5 text-slate-200 hover:border-violetNova/50 hover:bg-white/10 hover:glow',
  };

  return (
    <motion.div whileHover={{ scale: props.disabled ? 1 : 1.03 }} whileTap={{ scale: props.disabled ? 1 : 0.97 }} className="inline-flex">
      <Component className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
        {children}
      </Component>
    </motion.div>
  );
}
