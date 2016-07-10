// @flow

const debugLogger = require('debug')('lexer');
const debug = (desc) => (value) => { debugLogger(desc + ": %s", JSON.stringify(value, null, ' ')); return value; };

const { adjust, append, assoc, compose, concat, init, last, lens, lensPath, lensIndex, lensProp, match, merge, over, prop, reduce, set, view } = require('ramda');
const { deepMerge } = require('./utils.js');

const splitOnNewLine = (text) => text.split(/\n/);

type Lexer = { data: Object, lexStack: Array<Function> }

// Lenses
const getQuestionLens = (index: number) => lens(
        compose((questions) => questions[index], prop('questions')),
        (update, data) => assoc(
            'questions',
            adjust((question) => deepMerge(question, update), index, data.questions),
            data
        )
    );

// Base
const questionStartRegex = /([A-Z][0-9])\. (.*)/;
const findQuestion = (text) => match(questionStartRegex, text);
const processQuestion = ({data, lexStack}, lineResult) => lineResult.length < 3
    ? {data, lexStack}
    : {
        data: deepMerge(data, { questions: [ { id: lineResult[1], text: lineResult[2] } ] }),
        lexStack: append(typeLex(getQuestionLens(data.questions.length)), lexStack)
    };
const lexBase = compose(
    ({lexer, lineResult}) => processQuestion(lexer, lineResult),
    (lexer, line) => ({ lexer, lineResult: findQuestion(line) })
);

// Type
const typeLex = (lens) => ({ data, lexStack }, line) => ({
    data: set(lens, { type: line }, data),
    lexStack: append(answerLex(lens) ,init(lexStack))
});


// Answers
const answerRegex = /\s+[0-9]\. (.*)/;
const findAnswer = text => match(answerRegex, text);
const processAnswer = ({data, lexStack}, lineResult, lens) => lineResult.length > 1
    ? { data: set(lens, { answers: [ lineResult[1] ] } , data), lexStack }
    : { data, lexStack: init(lexStack) };
const answerLex = lens => compose(
    ({lexer, lineResult}) => processAnswer(lexer, lineResult, lens),
    (lexer, line) => ({ lexer, lineResult: findAnswer(line) })
);

// Main processing loop
const processLines = (text) => reduce(
    (lexer, line) => last(lexer.lexStack)(lexer, line),
    { lexStack: [ lexBase ], data: { questions: [] } },
    splitOnNewLine(text)
);

const lexer = compose(lexer => lexer.data, processLines);

module.exports = {
    lexer,
    lexBase,
    getQuestionLens
};