const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const watwonUrl = require('../credentials/watson-nlu.json').url

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const nlu = new NaturalLanguageUnderstandingV1({
  version: '2018-04-05',
  authenticator: new IamAuthenticator({
    apikey: watsonApiKey,
  }),
  url: watwonUrl,
});

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

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
        content.sourceContentSanitized = withoutDatesInParentheses

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

    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)

        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
        console.log(sentences)
    }

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSenteces)
    }

    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze(
                {
                  text: sentence,
                  features: {
                    keywords: {}
                  }
                })
                .then(response => {
                    const keywords = response.result.keywords.map((keyword) => {
                        return keyword.text
                    })
                  resolve(keywords)
                })
                .catch(err => {
                  console.log('error: ', err);
                });
        })
    }
}

module.exports = robot