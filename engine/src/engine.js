// @flow

const debugLogger = require('debug')('engine');
const debug = (desc) => (value) => { debugLogger(desc + ": %s", JSON.stringify(value, null, ' ')); return value; };

const {compose, fromPairs, forEach, filter, map, mapObj, match, merge, reduce, slice, zipObj} = require('ramda');

const splitOnNewLine = (text) => text.split(/\n/);

const questionStartRegex = /([A-Z][0-9])\. (.*)/;
const findQuestionStart = (text) => match(questionStartRegex, text);
const questionStartProcessor = (result, line) => {
    const lineResult = findQuestionStart(line);

    return lineResult.length > 2
            ? {
                data: {
                    id: lineResult[1],
                    text: lineResult[2],
                    answers: []
                },
                processor: typeProcessor
            }
            : result;
};

const typeProcessor = ({ data, processor }, line) => ({
    data: merge(data, { type: line }),
    processor: answerProcessor
});

const answerProcessor = (result, line) => {
    const answer = findAnswer(line);

    if (answer.length > 0) {
        result.data.answers.push(answer[1]);
    }

    return result;
};

const answerRegex = /\s+[0-9]\. (.*)/;
const findAnswer = (text) => match(answerRegex, text);


const processLines = (text) => reduce(
    (result, line) => result.processor(result, line),
    { processor: questionStartProcessor, data: {} },
    splitOnNewLine(text)
);

const engine = compose(result => result.data, processLines);

module.exports = engine;