function onCreated() {
    if (browser.runtime.lastError) {
        console.error(`Error while Creating Context Menu Items: ${browser.runtime.lastError}`);
    }
}

// Add tab context menu entries.
browser.menus.create({
    id: 'suspend-tab',
    title: 'Suspend Tab',
    contexts: ['tab'],
    documentUrlPatterns: ['*://*/*']
}, onCreated);

browser.menus.create({
    id: 'suspend-other-tabs',
    title: 'Suspend Other Tabs',
    contexts: ['tab'],
    documentUrlPatterns: ['*://*/*']
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'suspend-tab':
            // If selected tab is not active or already discarded, discard.
            if (!tab.active && !tab.discarded) {
                browser.tabs.discard(tab.id);
            }
            else {
                console.error('Tab is ' + (tab.active ? 'currently active' : 'already discarded') + '.');
            }
            break;
        case 'suspend-other-tabs':
            // Retrieve all tabs in the current window that are not the current tab, pinned, or already discarded.
            let query = browser.tabs.query({ currentWindow: true, active: false, pinned: false, discarded: false });
            query.then(t => {
                // Reduce from an array of tabs.Tab to tab ID integers.
                t = t.map(v => v.id);
                // Modifies existing array to remove the selected tab.
                // Function's return value is removed entries, which we don't need.
                t.splice(t.indexOf(tab.id), 1);
                // Discard array of tabs by ID.
                browser.tabs.discard(t);
            }, err => console.log(`Error while Querying Tabs: ${err}`));
            break;
    }
});
