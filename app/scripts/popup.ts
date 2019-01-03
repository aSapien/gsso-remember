console.log(`Loading Popup`)

const getSavedPreferences = () => 
  browser.runtime.sendMessage<EmptyPayload, {data: DestinationEmailEmailPair[]}>({ action: ActionName.ListAccountAction })

const removePreference = (destination: string) =>
  browser.runtime.sendMessage<DestinationPayload, BackgroundTaskResult>({ action: ActionName.DeleteAccountAction, destination })

const renderSavedPreferences = () => {
  getSavedPreferences()
    .then(result => {
        const rows = result.data
            .map(p => htmlUtils.createTableRow(p.destination, p.email, () => 
                removePreference(p.destination)
                .then(finalize)))

        const tableRowsOption: OptionT<any> = rows.length ? new Some(rows) : None

        tableRowsOption.fold(htmlUtils.renderNoItems, htmlUtils.renderTable)
    })
}

const htmlUtils = {
    create: (elemName: string, text = '', children = <any>[]) => {
        const elem = document.createElement(elemName)
        elem.innerText = text
        children.forEach((c: any) => elem.appendChild(c))
        return elem
    },
    createTable: (tableRows: any) => {
        const loginDestinationHeader = htmlUtils.create('th', 'Login Destination')
        const preferredAccountHeader = htmlUtils.create('th', 'Preferred Account')
        const emptyHeader = htmlUtils.create('th')

        const tableHeaderContainer = htmlUtils.create('tr', '', [loginDestinationHeader, preferredAccountHeader, emptyHeader])
        const tableContainer = htmlUtils.create('table', '', [tableHeaderContainer, ...tableRows])

        return tableContainer
    },
    createTableRow: (destination: string, email: string, onclick: (a: any) => void) => {
        const destinationCell = htmlUtils.create('td', destination)
        const preferredEmailCell = htmlUtils.create('td', email)
        const removeButton = htmlUtils.create('button', 'Forget')
        const removeButtonCell = htmlUtils.create('td', '', [removeButton])

        removeButton.addEventListener('click', onclick)
        
        return htmlUtils.create('tr', '', [
            destinationCell, 
            preferredEmailCell, 
            removeButtonCell
        ])
    },
    renderNoItems: () => {
        const noItemsFound = htmlUtils.create('h4', 'No items found')
        document.body.appendChild(noItemsFound)
    },
    renderTable: (rows: any): void => {
        const table = htmlUtils.createTable(rows)
        document.body.appendChild(table)
    }
}

const finalize = (result: BackgroundTaskResult) => result.success
    ? clearRender()
    : console.error(`Could not remove preference. Error [ ${JSON.stringify(result)} ] `)

const clearRender = () => {
    document.body.innerHTML = ''
    return renderSavedPreferences()
}

clearRender()