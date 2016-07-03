// @flow

const debugLogger = require('debug')('engine');
const debug = (desc) => (value) => { debugLogger(desc + ": %s", JSON.stringify(value, null, ' ')); return value; };

const {compose, match, merge, reduce} = require('ramda');

const {deepMerge} = require('./utils.js');

const splitOnNewLine = (text) => text.split(/\n/);

// Question
const questionStartRegex = /([A-Z][0-9])\. (.*)/;
const findQuestionStart = (text) => match(questionStartRegex, text);
const handleQuestionStart = (result, lineResult) => lineResult.length > 2
    ? {
        data: {
            id: lineResult[1],
            text: lineResult[2]
        },
        processor: typeProcessor
    }
    : result;
const questionStartProcessor = compose(
    ({result, lineResult}) => handleQuestionStart(result, lineResult),
    (result, line) => ({ result: result, lineResult: findQuestionStart(line) })
);

// Type
const typeProcessor = ({ data, processor }, line) => ({
    data: merge(data, { type: line }),
    processor: answerProcessor
});

// Answers
const answerRegex = /\s+[0-9]\. (.*)/;
const findAnswer = (text) => match(answerRegex, text);
const answerProcessor = compose(
    ({ result, lineResult }) => deepMerge(
        result,
        lineResult.length > 1
            ? { data: { answers: [ lineResult[1] ] } }
            : {}
    ),
    (result, line) => ({ result: result, lineResult: findAnswer(line) })
);



const processLines = (text) => reduce(
    (result, line) => result.processor(result, line),
    { processor: questionStartProcessor, data: {} },
    splitOnNewLine(text)
);

const engine = compose(result => result.data, processLines);

module.exports = engine;