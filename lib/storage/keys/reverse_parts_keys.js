var genericKeys = require('./generic_keys');


module.exports = genericKeys(
    "ReverseParts",
    null,
    function reverseItemKey(item) { return item.split('').reverse().join(''); }
);
