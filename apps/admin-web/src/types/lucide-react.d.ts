import { ForwardRefExoticComponent, RefAttributes, SVGAttributes, ReactElement } from 'react';
import { LinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}

declare module 'lucide-react' {
  // Authentication icons
  export const Eye: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const EyeOff: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Mail: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Lock: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const User: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Shield: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

  // Navigation icons
  export const Menu: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const X: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const ChevronDown: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const ChevronRight: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const ArrowLeft: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const ArrowRight: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Home: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const LogOut: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

  // Commerce icons
  export const Package: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const ShoppingCart: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const DollarSign: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const IndianRupee: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Tags: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

  // Status & feedback icons
  export const CheckCircle2: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const AlertCircle: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Loader: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const BarChart3: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

  // Data/Location icons
  export const Calendar: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Phone: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const MapPin: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Search: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

  // Order & fulfillment icons
  export const Clock: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Truck: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const XCircle: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const TrendingUp: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Download: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Plus: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Edit2: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const MessageSquare: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Printer: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  export const Share2: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

declare module 'next/link' {
  export const Link: ForwardRefExoticComponent<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<any> & { children?: React.ReactNode } & RefAttributes<HTMLAnchorElement>>;
}

