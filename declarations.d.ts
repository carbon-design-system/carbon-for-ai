/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element; // eslint-disable-line no-undef
  export default {
    parameters: {
      docs: {
        container: JSX.Element, // eslint-disable-line no-undef
        page: MDXComponent,
      },
    },
  };
}

declare global {
  interface ElementEventMap {
    loadend: Event;
  }
}

declare module '*.scss?inline' {
  import { CSSResult } from 'lit';
  const styles: CSSResult;
  export default styles;
}

declare module '*.scss' {
  import { CSSResult } from 'lit';
  const styles: CSSResult;
  export default styles;
}

declare module '*.svg';
declare module '*.jpg';
declare module '*.png';
