// Every file is a module here (moduleDetection: force), so globals need `declare global`.
declare global {
  /** App version from package.json, injected by Vite. */
  const __APP_VERSION__: string
}

export {}
