const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credendials/algorithmia.json').apiKey
async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    
    //breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        //console.log(wikipediaContent)

        content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizeContent(content){

        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)
        console.log(withoutDatesInParentheses)
        // const withoutMarkdown = removeMarkDown(withoutBlankLines)
        // console.log(withoutMarkdown)

        function removeBlankLinesAndMarkDown(text) {
            const allLines = text.split('\n')
            
            const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                }
                return true
            })

            return withoutBlankLinesAndMarkDown.join(' ')
        }

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

}

module.exports = robot