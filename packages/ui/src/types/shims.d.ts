// Type augmentations for lucide-react components
declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  
  export interface LucideProps extends Partial<Omit<SVGProps<SVGSVGElement>, "ref">> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export const ChevronDown: FC<LucideProps>;
  export const ChevronRight: FC<LucideProps>;
  export const AlertCircle: FC<LucideProps>;
}
