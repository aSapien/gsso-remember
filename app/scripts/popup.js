console.log(`Loading Popup`);

const getSavedPreferences = () => 
  browser.runtime.sendMessage({ action: 'list-account' });

const removePreference = (destination) => 
  browser.runtime.sendMessage({ action: 'delete-account', destination });

const renderSavedPreferences = () => {
  getSavedPreferences()
    .then(result => {
        const rows = result.data.map(p => {
            const destinationCell = htmlUtils.create('td', p.destination);
            const preferredEmailCell = htmlUtils.create('td', p.email);
            const removeButton = htmlUtils.create('button', 'Forget');
            const removeButtonCell = htmlUtils.create('td', '', [removeButton]);

            removeButton.addEventListener('click', (ev) => 
                removePreference(p.destination)
                    .then(result => result.success 
                        ? clearRender() 
                        : console.error(`Could not remove preference. Error [ ${result.error} ] `))
            );

            return htmlUtils.create('tr', '', [
                destinationCell, 
                preferredEmailCell, 
                removeButtonCell
            ]);
        });

        const tableRowsOption = rows.length ? Some(rows) : None;

        tableRowsOption.fold(
            () => {
                const noPrefs = htmlUtils.create('h4', 'No items found');
                document.body.appendChild(noPrefs);
            }, 
            (rows) => {
                const loginDestinationHeader = htmlUtils.create('th', 'Login Destination');
                const preferredAccountHeader = htmlUtils.create('th', 'Preferred Account');
                const emptyHeader = htmlUtils.create('th');

                const tableHeaderContainer = htmlUtils.create('tr', '', [loginDestinationHeader, preferredAccountHeader, emptyHeader]);
                const tableContainer = htmlUtils.create('table', '', [tableHeaderContainer, ...rows]);

                document.body.appendChild(tableContainer);
            });
    });
}

const htmlUtils = {
    create: (elemName, text = '', children = []) => {
        const elem = document.createElement(elemName);
        elem.innerText = text;
        children.forEach(c => elem.appendChild(c));
        return elem;
    }
}

const clearRender = () => {
    document.body.innerHTML = '';
    return renderSavedPreferences();
};

clearRender();