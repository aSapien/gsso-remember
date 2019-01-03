export enum ActionName {
  SaveAccountAction = 'save-account',
  DeleteAccountAction = 'delete-account',
  FindAccountAction = 'find-account',
  ListAccountAction = 'list-account',
}

export interface EmptyPayload {
  action: ActionName.ListAccountAction
}

export interface DestinationPayload {
  action: ActionName.DeleteAccountAction | ActionName.FindAccountAction
  destination: string
}

export interface BackgroundTaskResult {
  success: boolean
}

export interface DestinationAndEmailPayload extends DestinationEmailEmailPair {
  action: ActionName.SaveAccountAction
}

export interface DestinationEmailEmailPair {
  destination: string
  email: string
}

export type MessagePayload =
  EmptyPayload
    | DestinationPayload
    | DestinationAndEmailPayload

export interface StoreValue {
  email: string
}

export interface StoreEntry  {
  [key: string]: StoreValue
}

export abstract class OptionT<T> {
    public static from<T>(t: T): OptionT<T> {
        return t === null || t === undefined
            ? None.prototype
            : new Some(t)
    }
    public abstract map<A>(f: (t: T) => A): OptionT<A>
    public abstract flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A>
    public abstract fold<A>(ifEmpty: () => A, ifSome: (t: T) => A): A
}

export class Some<T> extends OptionT<T> {
    public value: T
    constructor(t: T) {
        super()
        this.value = t
    }
    public map<A>(f: (t: T) => A): OptionT<A> {
        return new Some<A>(f(this.value))
    }
    public flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A> {
        return f(this.value)
    }
    public fold<A>(ifEmpty: () => A, ifSome: (t: T) => A): A {
        return ifSome(this.value)
    }
}

export class None<T> extends OptionT<T> {
    public static map<A>(f: (t: any) => A): OptionT<A> {
        return None.prototype
    }
    public static flatMap<A>(f: (t: any) => OptionT<A>): OptionT<A> {
        return None.prototype
    }
    public static fold<A>(ifEmpty: () => A, ifSome: (t: any) => A): A {
        return ifEmpty()
    }

    // Has to be implemened. static implementation is not enough

    public map<A>(f: (t: T) => A): OptionT<A> {
        return None.prototype
    }
    public flatMap<A>(f: (t: T) => OptionT<A>): OptionT<A> {
        return None.prototype
    }
    public fold<A>(ifEmpty: () => A, ifSome: (t: T) => A): A {
        return ifEmpty()
    }
}
