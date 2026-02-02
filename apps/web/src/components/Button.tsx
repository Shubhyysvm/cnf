import Link from "next/link";

type Common = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

type ButtonProps = Common & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type LinkButtonProps = Common & {
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", size = "md", className = "", children } = props;

  const base = "inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  } as const;
  const variants = {
    primary: "bg-trust-green text-white hover:bg-trust-green/90 focus:ring-trust-green",
    secondary: "bg-white text-trust-green border border-trust-green hover:bg-trust-green/10 focus:ring-trust-green",
    ghost: "bg-transparent text-white border border-white/70 hover:bg-white/10 focus:ring-white",
  } as const;

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props as LinkButtonProps;
    return (
      <Link className={classes} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const { href: _unused, ...buttonRest } = props as ButtonProps;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
