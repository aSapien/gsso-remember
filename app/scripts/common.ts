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

enum ActionName {
  SaveAccountAction = 'save-account',
  DeleteAccountAction = 'delete-account',
  FindAccountAction = 'find-account',
  ListAccountAction = 'list-account'
}

interface EmptyPayload {
  action: ActionName.ListAccountAction
}

interface DestinationPayload {
  action: ActionName.DeleteAccountAction | ActionName.FindAccountAction
  destination: string
}

interface BackgroundTaskResult {
  success: boolean
}

interface DestinationAndEmailPayload extends DestinationEmailEmailPair {
  action: ActionName.SaveAccountAction
}

interface DestinationEmailEmailPair {
  destination: string
  email: string
}

type MessagePayload = 
  EmptyPayload 
    | DestinationPayload 
    | DestinationAndEmailPayload

interface StoreValue {
  email: string
}

interface StoreEntry  {
  [key: string]: StoreValue
}

abstract class OptionT<T> {
    static from<T>(t: T): OptionT<T> { 
        return t === null || t === undefined 
            ? None.prototype 
            : new Some(t); 
    }
    abstract map<A>(f: (t: T) => A): OptionT<A>
    abstract flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A>
    abstract fold<A>(ifEmpty: () => A, ifSome: (t:T) => A): A
}

class Some<T> extends OptionT<T> {
    value: T
    constructor(t: T){
        super()
        this.value = t;
    }
    map<A>(f: (t: T) => A): OptionT<A> {
        return new Some<A>(f(this.value))
    }
    flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A> {
        return f(this.value)
    }
    fold<A>(ifEmpty: () => A, ifSome: (t:T) => A): A {
        return ifSome(this.value)
    }
}

class None<T> extends OptionT<T> {
    static map<A>(f: (t: any) => A): OptionT<A> {
        return None.prototype
    }
    static flatMap<A>(f: (t: any) => OptionT<A>): OptionT<A> {
        return None.prototype
    }
    static fold<A>(ifEmpty: () => A, ifSome: (t:any) => A): A {
        return ifEmpty()
    }

    // Has to be implemened. static implementation is not enough
    
    map<A>(f: (t: T) => A): OptionT<A> {
        return None.prototype
    }
    flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A> {
        return None.prototype
    }
    fold<A>(ifEmpty: () => A, ifSome: (t:T) => A): A {
        return ifEmpty()
    }
}

(function init(global: any) {
     //TODO: remove this ugliness
     global.ActionName = ActionName
     global.OptionT = OptionT
     global.Some = Some
     global.None = None
})(window)