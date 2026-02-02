/// <reference types="react" />

import type { ReactElement, ReactNode } from 'react'

declare module 'react' {
  interface ReactPortal {
    children?: ReactNode;
  }
}
