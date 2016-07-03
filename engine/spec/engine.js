// @flow

const chai = require('chai');
const expect = chai.expect;

const engine = require('../src/engine.js');

describe('engine', () => {
    
    it('parses a simple question into an object', () => {
        const question =
            'S1. Are you?\n' +
            'SINGLE CODE\n' +
            '  1. Male\n' +
            '  2. Female\n';

        expect(engine(question)).to.deep.equal({
            id: 'S1',
            text: 'Are you?',
            type: 'SINGLE CODE',
            answers: [
                'Male',
                'Female'
            ]
        });
    });

    it('returns an empty object when there is no question', () => {
        const nonQuestion =
            'SINGLE CODE\n' +
            '  1. Male\n' +
            '  2. Female\n';

        expect(engine(nonQuestion)).to.deep.equal({});
    });

    it('parses a with more than 2 answers', () => {
        const question =
            'S1. Are you from?\n' +
            'SINGLE CODE\n' +
            '  1. UK\n' +
            '  2. France\n' +
            '  3. Germany\n +';

        expect(engine(question)).to.deep.equal({
            id: 'S1',
            text: 'Are you from?',
            type: 'SINGLE CODE',
            answers: [
                'UK',
                'France',
                'Germany'
            ]
        });
    });
});