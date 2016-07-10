// @flow

const chai = require('chai');
const expect = chai.expect;

const { set, view } = require('ramda');

const { lexer, lexBase, getQuestionLens } = require('../src/lexer.js');

describe('lexer', () => {

    it('parses a question title', () => {
        const question = 'S1. Are you?';

        expect(lexer(question)).to.deep.equal({
            questions: [
                {
                    id: 'S1',
                    text: 'Are you?'
                }
            ]
        });
    });

    it('parses a question with a type', () => {
        const question =
            'S1. Are you?\n' +
            'SINGLE CODE\n';

        expect(lexer(question)).to.deep.equal({
            questions: [
                {
                    id: 'S1',
                    text: 'Are you?',
                    type: 'SINGLE CODE'
                }
            ]
        });
    });


    it('parses a simple question into an object', () => {
        const question =
            'S1. Are you?\n' +
            'SINGLE CODE\n' +
            '  1. Male\n' +
            '  2. Female\n';

        expect(lexer(question)).to.deep.equal({
            questions: [
                {
                    id: 'S1',
                    text: 'Are you?',
                    type: 'SINGLE CODE',
                    answers: [
                        'Male',
                        'Female'
                    ]
                }
            ]
        });
    });

    it('returns an empty array when are no questions', () => {
        const nonQuestion =
            'SINGLE CODE\n' +
            '  1. Male\n' +
            '  2. Female\n';

        expect(lexer(nonQuestion)).to.deep.equal({
            questions: []
        });
    });

    it('parses a with more than 2 answers', () => {
        const question =
            'S1. Are you from?\n' +
            'SINGLE CODE\n' +
            '  1. UK\n' +
            '  2. France\n' +
            '  3. Germany\n +';

        expect(lexer(question)).to.deep.equal({
            questions: [
                {
                    id: 'S1',
                    text: 'Are you from?',
                    type: 'SINGLE CODE',
                    answers: [
                        'UK',
                        'France',
                        'Germany'
                    ]
                }
            ]
        });
    });

    it('parses two questions', () => {
        const question =
            'S1. Are you?\n' +
            'SINGLE CODE\n' +
            '  1. Male\n' +
            '  2. Female\n' +
            '\n'+
            'S2. Are you from?\n' +
            'SINGLE CODE\n' +
            '  1. UK\n' +
            '  2. France\n' +
            '  3. Germany\n';

        expect(lexer(question)).to.deep.equal({
            questions: [
                {
                    id: 'S1',
                    text: 'Are you?',
                    type: 'SINGLE CODE',
                    answers: [
                        'Male',
                        'Female'
                    ]
                },
                {
                    id: 'S2',
                    text: 'Are you from?',
                    type: 'SINGLE CODE',
                    answers: [
                        'UK',
                        'France',
                        'Germany'
                    ]
                }
            ]
        });
    });
});

describe('lexBase', () => {

    let lexer;

    beforeEach(() => {
        lexer = {
            data: {
                questions: []
            },
            lexStack: [
                lexBase
            ],
            lensStack: [
            ]
        }
    });


    it('adds a question', () => {
        const line = 'S1. Are you?';
        const result = lexBase(lexer, line);

        expect(result.data).to.deep.equal({
            questions: [
                { id: 'S1', text: 'Are you?' }
            ]
        });
    });

    it('adds another question', () => {
        lexer.data.questions.push({ id: 'S1', text: 'Are you?' });

        const line = 'S2. Another question?';
        const result = lexBase(lexer, line);

        expect(result.data).to.deep.equal({
            questions: [
                { id: 'S1', text: 'Are you?'},
                { id: 'S2', text: 'Another question?' }
            ]
        });
    });

    it('returns the correct processor');
});

describe('getQuestionLens', () => {

    let data;

    beforeEach(() => {
        data = {
            questions: [
                { id: 'q1' },
                { id: 'q2' }
            ]
        };
    });

    it('gets the question at the first index', () => {
        const result = view(getQuestionLens(0), data);
        expect(result).to.deep.equal({ id: 'q1' });
    });

    it('gets the questions at another index', () => {
        const result = view(getQuestionLens(1), data);
        expect(result).to.deep.equal({ id: 'q2' });
    });

    it('updates the value at the first index', () => {
        const result = set(getQuestionLens(0), { title: 'text' }, data);

        expect(result.questions[0]).to.deep.equal({
            id: 'q1',
            title: 'text'
        });
    });

    it('updates nested arrays', () => {
        data.questions[0].answers = ['male'];
        const result = set(getQuestionLens(0), { answers: ['female'] }, data);

        expect(result.questions[0]).to.deep.equal({
            id: 'q1',
            answers: ['male', 'female']
        });
    });

});