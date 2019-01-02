console.log(`Loading background script`);

const storageApiExecutor = (message) => {
  console.log(`storageApi: received message ${JSON.stringify(message)}`);

  switch(message.action) {
    case 'save-account': 
      console.log(`saving...`);
      return savePreferenceFor(message.destination, message.email);
    break;
    case 'find-account':
      console.log(`finding...`);
      return findPreferenceFor(message.destination);
    break;
    case 'list-account':
      console.log(`listing all...`);
      return listAllPreferences();
    break;
    case 'delete-account':
      console.log(`deleting...`);
    return deletePrefereceFor(message.destination);
    break;
    default:
      const err = new Error(`Unrecognized action [ ${message.action} ]`);
      console.error(err);
      return Promise.reject(err);
  }
}

const savePreferenceFor  = (destination, email) => 
  browser.storage.local.set({ [destination]: { email } })
    .then(() => succeed())
    .catch((e) => fail(e));

const deletePrefereceFor = (destination) => 
  browser.storage.local.remove(destination)
    .then(() => succeed())
    .catch((e) => fail(e));

const listAllPreferences = () => 
  browser.storage.local.get(undefined)
    .then((data) => {
      const response = Object.keys(data).map(dest => ({email: data[dest].email, destination: dest}))
      return succeed({data: response});
    })
    .catch((e) => fail(e));

const findPreferenceFor = (destination) => 
  browser.storage.local.get(destination)
  .then(result => result && hasEmail(result[destination])
      ? succeed(result[destination])
      : fail(new Error(`Storage key ${destination} empty or not found`)))
  .catch((e) => fail(e));


const hasEmail = (obj = {}) => typeof obj.email === 'string';
const succeed = (data = {}) => response(data, true);
const fail = (error = new Error('BackgroundScript: Unknown Error')) => response({error}, false);
const response = (data = {}, success) => ({...data, success: success});

browser.runtime.onMessage.addListener(storageApiExecutor);
