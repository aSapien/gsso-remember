declare const browser: WebExtensionBrowserApi

interface WebExtensionBrowserApi { 
  runtime: {
    sendMessage<M, U>(m: M): Promise<U>
    onMessage: {
      addListener(f: (a: MessagePayload) => void): void
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
