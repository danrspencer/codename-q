// @flow

const debugLogger = require('debug')('lexer');
const debug = (desc) => (value) => { debugLogger(desc + ": %s", JSON.stringify(value, null, ' ')); return value; };

const { adjust, assoc, compose, last, lens, lensPath, lensIndex, lensProp, match, merge, over, prop, reduce, set, view } = require('ramda');
const { deepMerge } = require('./utils.js');

const splitOnNewLine = (text) => text.split(/\n/);

type lexer = { data: Object, lexStack: Array<Function>, lensStack: Array<Object> }

// Lenses
const getQuestionLens = (index) => lens(
        compose((questions) => questions[index], prop('questions')),
        (update, data) => assoc(
            'questions',
            adjust((question) => merge(question, update), index, data.questions),
            data
        )
    );

// Base
const questionStartRegex = /([A-Z][0-9])\. (.*)/;
const findQuestion = (text) => match(questionStartRegex, text);
const processQuestion = (lexer, lineResult) => {
    if (lineResult.length <= 2) {
        return lexer;
    }

    lexer.data.questions.push({ id: lineResult[1], text: lineResult[2] });

    return {
        data: lexer.data,
        processor: typeProcessor,
        focus: getQuestionLens(lexer.data.questions.length - 1)
    }
};
const lexBase = compose(
    ({lexer, lineResult}) => processQuestion(lexer, lineResult),
    (lexer, line) => ({ lexer: lexer, lineResult: findQuestion(line) })
);

// Type
const typeProcessor = ({ data, processor, focus }, line) => ({
    data: set(focus, { type: line }, data),
    processor: answerProcessor,
    focus
});

// Answers
const answerRegex = /\s+[0-9]\. (.*)/;
const findAnswer = (text) => match(answerRegex, text);
const answerProcessor = compose(
    ({ lexer, lineResult }) => lineResult.length > 1
        ? assoc('data', set(lexer.focus, { answers: [ lineResult[1] ] } , lexer.data), lexer)
        : assoc('processor', lexBase, lexer),
    (lexer, line) => ({ lexer: lexer, lineResult: findAnswer(line) })
);

const processLines = (text) => reduce(
    (lexer, line) => lexer.processor(lexer, line),
    { processor: lexBase, data: { questions: [{}] } },
    splitOnNewLine(text)
);

const lexer = compose(lexer => lexer.data, processLines);

module.exports = {
    lexer,
    lexBase,
    getQuestionLens
};