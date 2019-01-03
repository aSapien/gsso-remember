import {
    ActionName,
    BackgroundTaskResult,
    DestinationAndEmailPayload,
    DestinationPayload,
    OptionT,
    StoreValue,
} from './common'

console.log(`Loading account chooser`)

const getLoginDestination = () => {
    return OptionT.from(
        document.querySelector('[data-destination-info]'),
    ).map((el) => el.textContent)
}

const getLoginPreferenceFor = (destination: string) => {
    const message: DestinationPayload = {
        action: ActionName.FindAccountAction,
        destination,
    }
    return browser.runtime.sendMessage<DestinationPayload, StoreValue>(message)
}

const saveLoginPreferenceFor = (destination: string, email: string) => {
    console.log(`saving login preference for ${destination} as ${email}.` )
    const message: DestinationAndEmailPayload = {
        action: ActionName.SaveAccountAction,
        destination,
        email,
    }

    browser.runtime
        .sendMessage<DestinationAndEmailPayload, BackgroundTaskResult>(message)
}

const suggestAccountsToRemember = (destination: string) => {
    const accountNodes = Array.from(document.querySelectorAll('[data-email]'))

    accountNodes
        .map((el) => ({element: el,  email: el.getAttribute('data-email')}))
        .map(({element, email}) => {
            const button = createButton((ev) => saveLoginPreferenceFor(destination, email))

            element.appendChild(button)
        })
}

const createButton = (onclick: (ev: any) => void) => {
    const buttonContainer = document.createElement('div')
    const rememberButton = document.createElement('button')

    rememberButton.innerText = `+ REMEMBER`
    rememberButton.addEventListener('click', onclick)

    buttonContainer.setAttribute('class', 'google-remember-account-button')
    buttonContainer.appendChild(rememberButton)

    return buttonContainer
}

const clickLogin = (email: string) =>
    OptionT.from(
        document.querySelector(`[data-email="${email}"]`),
    ).fold(
        () => logCantFind(email),
        (node) => clickNodeDelayed(node as any, 300),
    )

const clickNodeDelayed = (node: { click(): void }, delay: number) =>
    setTimeout(() => node.click(), delay)

const logCantFind = (property: string) => console.error(`Couldn't find [ ${property} ]`)

const loginOrSuggest = (destination: string) => {
    getLoginPreferenceFor(destination)
        .then((result) => OptionT.from(result.email).fold(
                () => suggestAccountsToRemember(destination),
                (email) => clickLogin(email),
            ),
        )
}

const startAccountChooser = () => getLoginDestination().fold(
    () => logCantFind('destination'),
    (dest) => loginOrSuggest(dest),
)

console.log(`Starting account chooser`)
startAccountChooser()
