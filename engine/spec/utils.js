// @flow

const chai = require('chai');
const expect = chai.expect;

const { deepMerge } = require('../src/utils.js');

describe('deepMerge', () => {

    it('merges', () => {
        const result = deepMerge(
            { a: 'test', b: [ '123' ]},
            { b: [ '456' ]}
        );

        expect(result).to.deep.equal(
            { a: 'test', b: [ '123', '456' ]}
        );
    });

    it('merges with curry', () => {
        const result = deepMerge
            ({ a: 'test', b: [ '123' ]})
            ({ b: [ '456' ]});

        expect(result).to.deep.equal(
            { a: 'test', b: [ '123', '456' ]}
        );
    });
});