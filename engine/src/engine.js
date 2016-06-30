// @flow

const debugLogger = require('debug')('engine');
const debug = (desc) => (value) => { debugLogger(desc + ": %s", JSON.stringify(value, null, ' ')); return value; };

const { compose, filter, map } = require('ramda');

const splitOnSpace = (text: string): Array<string> => text.split(/\s+/);
const splitOnNewLine = (text: string): Array<string> => text.split(/\n/);
const splitText = compose(map(splitOnSpace), splitOnNewLine);

const isEmpty = (value:string|Array<string>) => value.length > 0;
const removeEmpty = compose(filter(isEmpty), map(filter(isEmpty)));

const engine:(text: string) => Array<Array<string>> = compose(debug('Cleaned'), removeEmpty, debug('With empty'), splitText);

module.exports = engine;