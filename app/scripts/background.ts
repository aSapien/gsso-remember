console.log(`Loading background script`)

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

interface DestinationAndEmailPayload {
  action: ActionName.SaveAccountAction
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


function storageApiExecutor (message: MessagePayload) {
  console.log(`storageApi: received message ${JSON.stringify(message)}`)

  switch(message.action) {
    case ActionName.SaveAccountAction: 
      return savePreferenceFor(message)

    case ActionName.FindAccountAction:
      return findPreferenceFor(message)

    case ActionName.ListAccountAction:
      return listAllPreferences()

    case ActionName.DeleteAccountAction:
      return deletePrefereceFor(message)

    default:
      const err = new Error(`Unrecognized message [ ${JSON.stringify(message)} ]`)
      console.error(err)

      return Promise.reject(err)
  }
}
const savePreferenceFor  = ({destination, email}: DestinationAndEmailPayload) => 
  browser.storage.local.set({ [destination]: { email } })
    .then(() => succeed())
    .catch((e: Error) => fail(e))


const deletePrefereceFor = ({destination}: DestinationPayload) => 
  browser.storage.local.remove(destination)
    .then(() => succeed())
    .catch((e: Error) => fail(e))

const listAllPreferences = () => 
  browser.storage.local.get(undefined)
    .then((data: StoreEntry) => {
      const storeEntries: ({ email:string, destination: keyof StoreEntry})[] = 
        Object.keys(data).map((key: keyof StoreEntry) => Object.assign({destination: key}, data[key]))
      
      console.log(`atore entries ::: ${JSON.stringify(storeEntries)}`)
      return succeed({data: storeEntries})
    })
    .catch((e: Error) => fail(e))

const findPreferenceFor = ({destination}: DestinationPayload) => 
  browser.storage.local.get(destination)
    .then((result: StoreEntry) => result && hasEmail(result[destination])
        ? succeed(result[destination])
        : fail(new Error(`Storage key ${destination} empty or not found`)))
    .catch((e: Error) => fail(e))

const hasEmail = (obj: StoreValue)  =>
  obj && typeof obj.email === 'string'

function succeed<T extends object> (data?: T){ 
  return  response(data, true) 
}

function fail(error = new Error('BackgroundScript: Unknown Error')) {
  return response({error}, false)
}

function response<T extends object>(data: T, success: boolean) { 
  return {...(data as object), success: success} 
}

browser.runtime.onMessage.addListener(storageApiExecutor)
