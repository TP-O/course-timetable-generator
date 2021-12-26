declare interface Window {
  // extend the window
}

declare module '*.vue' {
  import type { Component } from 'vue'
  const component: Component
  export default component
}
