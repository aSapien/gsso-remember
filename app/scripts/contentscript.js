console.log(`Loading account chooser`);

const getLoginDestination = () => {
    try {
        return Option(document.querySelectorAll('[data-destination-info]')[0].textContent);
    } catch (e) {
        return None;
    }
}

const getLoginPreferenceFor = (destination) => {
    console.log(`searching login preference for [ ${destination} ]`);
    const message = { action: 'find-account', destination };
    console.log(`Sending message [ ${JSON.stringify(message)} ]`);
    return browser.runtime
        .sendMessage({ action: 'find-account', destination })
}

const saveLoginPreferenceFor = (destination, email) => {
    console.log(`saving login preference for ${destination} as ${email}.` )
    browser.runtime
        .sendMessage({ action: 'save-account', destination, email })
        .then(result => result.success
            ? Some(email)
            : None);
}

const suggestAccountsToRemember = (destination) => {
    console.log(`Suggesting to remember preference for ${destination}`);

    const accountNodes = Array.from(document.querySelectorAll('[data-email]'));

    accountNodes
        .map(el => ({element: el,  email: el.getAttribute('data-email')}))
        .map(({element, email}) => {
            const buttonContainer = document.createElement('div'); 
            const rememberButton = document.createElement('button');
            rememberButton.innerText = `+ REMEMBER`;
            rememberButton.addEventListener('click', ev => saveLoginPreferenceFor(destination, email));

            console.log(`Attaching button [ ${rememberButton} ]`);
            buttonContainer.setAttribute('class', 'google-remember-account-button');
            buttonContainer.appendChild(rememberButton);

            element.appendChild(buttonContainer);
        });
}

const clickLogin = (email) => {
    console.log(`Logging in with account [ ${email} ]`);
    const accountNode = document.querySelector(`[data-email="${email}"]`);

    Option(accountNode).fold(
        () => logCantFind(email), 
        (node) => clickNodeDelayed(node, 300)
    );
}

const clickNodeDelayed = (node, delay) => 
    setTimeout(() => node.click(), delay);

const logCantFind = (property) => console.error(`Couldn't find [ ${property} ]`);

const loginOrSuggest = (destination) => {
    console.log(`Starting login process for [ ${destination} ]`);
    getLoginPreferenceFor(destination)
            .then(result => {
                const emailOption = result.success
                    ? Some(result.email)
                    : None;

                console.log(`preference result: ${JSON.stringify(result)}`);

                emailOption.fold(
                    () => suggestAccountsToRemember(destination), 
                    (email) => clickLogin(email));
            })
}

const whenOnGoogleLogin = () => document.URL.startsWith('https://accounts.google.com/signin/')
    ? Some()
    : None;

const startAccountChooser = () => whenOnGoogleLogin().map(() => getLoginDestination().fold(
    () => logCantFind('destination'), 
    (dest) => loginOrSuggest(dest)))

console.log(`Starting account chooser`);
startAccountChooser();