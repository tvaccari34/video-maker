const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credendials/algorithmia.json').apiKey
function robot(content){
    console.log('Entrei com sucesso')
    fetchContentFromWikipedia(content)
    //sanitizeContent(content)
    //breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        console.log(wikipediaContent)
    }

}

module.exports = robot