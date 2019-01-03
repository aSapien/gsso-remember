declare const browser: WebExtensionBrowserApi

interface WebExtensionBrowserApi { 
  runtime: {
    sendMessage<M, U>(m: M): Promise<U>
    onMessage: {
      addListener<T>(f: (a: T) => void): void
    }
  }
  storage: {
    local: {
      get<T>(a: string): Promise<T>
      set<T>(a: T): Promise<{}>
      remove(a: string): Promise<{}>
    }
  }
}
