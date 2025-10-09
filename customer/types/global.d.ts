// Global type definitions for React Native environment

declare global {
   // Fix for AbortSignal compatibility issues
   interface AbortSignal {
      readonly aborted: boolean;
      readonly reason?: any;
      onabort: ((this: AbortSignal, ev: Event) => any) | null;
      addEventListener<K extends keyof AbortSignalEventMap>(
         type: K,
         listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
         options?: boolean | AddEventListenerOptions
      ): void;
      removeEventListener<K extends keyof AbortSignalEventMap>(
         type: K,
         listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
         options?: boolean | EventListenerOptions
      ): void;
      dispatchEvent(event: Event): boolean;
   }

   interface AbortSignalEventMap {
      abort: Event;
   }

   // Enhanced fetch type definitions
   interface RequestInit {
      signal?: AbortSignal;
      headers?: Record<string, string> | Headers;
   }

   // Fix for HeadersInit
   type HeadersInit = Record<string, string> | Headers | [string, string][];

   // Timer types for React Native
   type Timeout = ReturnType<typeof setTimeout>;
   type Interval = ReturnType<typeof setInterval>;

   // Google Maps types for the global scope
   interface Window {
      google?: {
         maps: any;
      };
   }
}

// API Response types
export interface ApiResponse<T = any> {
   success: boolean;
   data?: T;
   message?: string;
   error?: string;
}

// Location types
export interface LocationData {
   address: string;
   coordinates?: {
      latitude: number;
      longitude: number;
   };
   placeId?: string;
}

export {};
