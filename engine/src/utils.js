// @flow

const {concat, curry, mergeWith} = require('ramda');

const handleMerge = (a,b) =>
    Array.isArray(a) && Array.isArray(b) ? concat(a, b) :
    typeof(a) == 'object' && typeof(b) == 'object' ? deepMerge(a, b) :
        b;

const deepMerge = curry((a: any, b: any) => mergeWith(handleMerge, a, b));

module.exports = {
    deepMerge
};