// @flow

const {concat, mergeWith} = require('ramda');

const handleMerge = (a,b) =>
    Array.isArray(a) && Array.isArray(b) ? concat(a, b) :
    typeof(a) == 'object' && typeof(b) == 'object' ? deepMerge(a, b) :
        b;

const deepMerge = (a, b) => mergeWith(handleMerge, a, b);

module.exports = {
    deepMerge: deepMerge
};