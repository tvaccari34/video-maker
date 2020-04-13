const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    const content = {
        maximumSenteces: 10
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)
    //await robots.text(content)

    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipead seach term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }
}

module.exports = robot