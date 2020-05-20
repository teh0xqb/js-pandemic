const isNodeEnv = typeof module !== 'undefined' && module.exports;

// ============================== SOME HELPERS =================================

function reverseString(str) {
    return str
        .split('')
        .reverse('')
        .join('');
}

/**
 * Given a positive integer, returns if it is a palindrome.
 **/
function isPalindrome(num) {
    const asString = num.toString();
    const reversed = reverseString(asString);
    return asString === reversed;
}

/**
 * Returns a string without its last character.
 **/
function shaveLast(str) {
    return str.substring(0, str.length - 1);
}

const _even = num => num % 2 === 0;
const _odd = num => !_even(num);

// ================================= MAIN fns ==================================


/**
 * See https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
 **/
function primes(start, end) {
    const n = end + 1;

    const sieve = new Array(n).fill(true);

    for (let x = 2; x <= Math.sqrt(n); x++) {
        if (sieve[x]) {
            for (let y = Math.pow(x, 2); y <= n; y += x) {
                sieve[y] = false;
            }
        }
    }

    return sieve.reduce((acc, isPrime, index) => {
        return (isPrime && index >= start && index > 1) ?
            [...acc, index] :
            acc;
    }, []);

}

/**
 * _nextPalindrome: given a numeric string, returns the next number which is a palindrome, up to 1,000,000 digits.
 * @param {string} asString - a number as string which will be used as base for next palindrome number.
 *
 * Nomenclature:
 * A number can have odd or even length.
 *
 * For a given number 123456 of even length:
 *   left | middle | right = '123' | '' | '456'
 * given a number of odd length 1234567:
 *   left | middle | right = '123' | '4' | '567'
 *
 * In a simplified odd-length example with 1234567:
 * palindrome basis = 1234. That is, left + middle; used to reverse and calculate the rest of the palindrome.
 * then a proper rightReplacement = 4321 for use on the rest of the palindrome.
 *
 * @returns {bigint}
 **/
function _nextPalindrome(asString) {
    const isOdd = _odd(asString.length);
    const pivotIndex = Math.floor(asString.length / 2);

    // Given that some strings have odd length, add logic for the presence of a middle number, or none (for even length)
    const left = asString.substring(0, pivotIndex);
    const middle = isOdd ? asString[pivotIndex] : '';
    const right = asString.substring(pivotIndex + (isOdd ? 1 : 0));

    // Palindrome basis and replacement
    let basis = left + middle;
    let rightReplacement = reverseString(left);

    // When original right value is greater than replacement
    //   then increase the basis of the palindrome and recalculate replacement
    if (right >= rightReplacement) {
        basis = (BigInt(basis) + 1n).toString();
        rightReplacement = reverseString(isOdd ? shaveLast(basis) : basis);
    }

    return BigInt(basis + rightReplacement);
}

function nextPalindrome(num) {
    if (typeof num === 'number' && num > Number.MAX_SAFE_INTEGER) {
        throw RangeError('nextPalindrome: when using numbers, please ensure to provide a positive safe js integer.');
    }
    if (Array.isArray(num)) {
        throw TypeError('nextPalindrome: expected a numeric string, number, or bigint, but received an array.');
    }
    if (num <= 0) {
        throw RangeError('nextPalindrome: please provide a positive (> 0) numberic (or equivalent) value.');
    }

    let input = num.toString();

    // TODO... fix for 99 cases as below. Don't have time now.
    if (input.match(/^9+$/)) {
        input = "0" + input;
    }

    return _nextPalindrome(input);
}

/**
 * Scans a string for the length of the character repeating itself until
 * a different character is found.
 * That is,
 * Given 'a', and 'aaab', returns 3.
 * Given 'a', and 'abb', returns 1.
 * Given 'a', and 'b', returns 0.
 * @returns {number}
 **/
function scanRepeated(character, str) {
    const re = new RegExp(`${character}+`);
    const result = str.match(re);

    return result ? result[0].length : 0; // can use lodash/get
}

// Compress lookahead, with partial regex
// snake_case convention for variations of same fn
function compress_scan(string1) {
    let accumulator = '';
    let index = 0;

    while (index < string1.length) {
        const currentChar = string1[index];
        const occurrences = scanRepeated(currentChar, string1.substring(index));
        const displayCount = occurrences === 1 ? '' : occurrences;

        accumulator += currentChar + displayCount;
        index += occurrences;
    }

    return accumulator;
}

/**
 * Given that lookbehind (store and compare to previous char) was more involved,
 * implement by compressing and looking ahead.
 **/
function compress_lookahead(string1) {

    let accumulator = '';

    for (
        let index = 0,
            repeatCounter = 0;

        index < string1.length;
        index++
    ) {
        repeatCounter++;
        const current = string1[index];
        const next = string1[index + 1];

        if (current !== next) {
            const displayCount = repeatCounter === 1 ? '' : repeatCounter;
            accumulator += current + displayCount;
            repeatCounter = 0;
        }
    }

    return accumulator;
}

// Full regex solution, lone capture group is a character
const compress_regex = string1 =>
      string1.replace(
          /(.)\1+/g,
          (fullMatch, character) => character + fullMatch.length
      );

const compress_algorithms = {
    mixed: compress_scan,
    regex: compress_regex,
    lookahead: compress_lookahead
};














// ========================== PREVIOUS / OLD ===================================

/**
 * Given a positive integer K of max 1,000,000 digits
 * return the next palindrome number, if it exists;
 * 1,000,000 digits is larger than javascript's maximum JS number.
 * Returns null if, given a valid input, cannot find the next palindrome within
 * javascript's integer constraints.
 **/
function Q2_old(K) {
    if (!Number.isInteger(K)) {
        throw new TypeError(`Q2 expects an integer. Received "${K}" of type "${typeof K}".`);
    }
    if (K < 0 || K > Number.MAX_SAFE_INTEGER) {
        throw new RangeError(`Q2 expects a positive integer up to ${Number.MAX_SAFE_INTEGER}.`);
    }

    // Can still go over safest integer while searching
    for (let counter = K + 1; counter < Number.MAX_SAFE_INTEGER; counter++) {
        // This is very slow for bigger inputs close to Number.MAX_SAFE_INTEGER
        if (isPalindrome(counter)) {
            return counter;
        }
    }

    return null;
}

if (isNodeEnv) {
    module.exports = {
        primes,
        nextPalindrome,
        compress_regex
    };
}
