import * as React from 'react';

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // Custom attributes for Edu-Bot logical identifiers
        accessibilityId?: string;
    }
}
