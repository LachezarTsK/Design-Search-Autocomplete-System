
/**
 * @param {string[]} sentences
 * @param {number[]} times
 */
var AutocompleteSystem = function (sentences, times) {
    this.ASCII_SPACE = 32;
    this.ASCII_SMALL_CASE_A = 97;
    this.MAX_LENGTH_ENTRY_SENTENCE = 200;//MIN = 1;
    this.ALPHABET_PLUS_SPACE_CHARACTER = 27;
    this.MAX_HOT_SENTENCES_TO_DISPLAY = 3;
    this.frequencyMap = new Map();
    this.prefix = [];
    this.root = new TrieNode();
    this.createDictionary(sentences, times);
};

/** 
 * @param {character} c
 * @return {string[]}
 */
AutocompleteSystem.prototype.input = function (c) {
    if (c !== '#') {
        this.frequencyMap = new Map();
        this.prefix.push(c);
        const checkSentence = new Array(this.MAX_LENGTH_ENTRY_SENTENCE);
        let current = this.root;
        this.searchTrie(current, checkSentence, 0);
        return this.pickTop_3_hotSentences();
    }

    this.addSentenceToTrie(this.prefix.join(''), 1);
    this.prefix = [];
    return [];
};

/** 
 * @return {string[]}
 */
AutocompleteSystem.prototype.pickTop_3_hotSentences = function () {

    const result = [];
    const keys = [...this.frequencyMap.keys()];
    keys.sort((x, y) => x - y);
    let indexStartSearch = keys.length - 1;

    for (let i = indexStartSearch; i >= 0; i--) {
        const sentences = [...this.frequencyMap.get(keys[i])];
        sentences.sort();

        let indexAdd = Math.min(this.MAX_HOT_SENTENCES_TO_DISPLAY - result.length, sentences.length);
        result.push(...sentences.slice(0, indexAdd));

        if (result.length === this.MAX_HOT_SENTENCES_TO_DISPLAY) {
            break;
        }
    }
    return result;
};


/** 
 * @param {TrieNode} node
 * @param {character[]} checkSentence
 * @param {number} trieLevel
 */
AutocompleteSystem.prototype.searchTrie = function (node, checkSentence, trieLevel) {
    if (node === undefined) {
        return;
    }

    if (node.isEndOfSentence && trieLevel >= this.prefix.length) {

        this.addSentenceToFrequencyMap(checkSentence.slice(0, trieLevel).join(''), node.frequency);
    }

    for (let i = 0; i < this.ALPHABET_PLUS_SPACE_CHARACTER; i++) {

        if (node.branches[i] !== undefined) {
            checkSentence[trieLevel] = this.getCharacterFromIndex(i);
            if (trieLevel >= this.prefix.length || checkSentence[trieLevel] === this.prefix[trieLevel]) {
                this.searchTrie(node.branches[i], checkSentence, trieLevel + 1);
            }
        }
    }
};

/** 
 * @param {character[]} checkSentence
 * @return {boolean}
 */
AutocompleteSystem.prototype.equalsPrefix = function (checkSentence) {
    for (let i = 0; i < this.prefix.length; i++) {
        if (checkSentence[i] !== this.prefix[i]) {
            return false;
        }
    }
    return true;
};

/**
 * @param {string[]} sentences
 * @param {number[]} times
 */
AutocompleteSystem.prototype.createDictionary = function (sentences, times) {
    let size = sentences.length;
    for (let i = 0; i < size; i++) {
        this.addSentenceToTrie(sentences[i], times[i]);
    }
};

/**
 * @param {string} sentence
 * @param {number} frequency
 */
AutocompleteSystem.prototype.addSentenceToTrie = function (sentence, frequency) {
    let current = this.root;
    let size = sentence.length;

    for (let i = 0; i < size; i++) {
        let index = this.getIndexFromCharacter(sentence.codePointAt(i));

        if (current.branches[index] === undefined) {
            current.branches[index] = new TrieNode();
        }
        current = current.branches[index];
    }
    current.isEndOfSentence = true;
    current.frequency += frequency;
};

/**
 * @param {string} sentence
 * @param {number} frequency
 */
AutocompleteSystem.prototype.addSentenceToFrequencyMap = function (sentence, frequency) {

    if (this.frequencyMap.size < this.MAX_HOT_SENTENCES_TO_DISPLAY) {
        if (!this.frequencyMap.has(frequency)) {
            this.frequencyMap.set(frequency, []);
        }
        this.frequencyMap.get(frequency).push(sentence);
        return;
    }

    if (this.frequencyMap.has(frequency)) {
        this.frequencyMap.get(frequency).push(sentence);
        return;
    }

    let min = Number.MAX_SAFE_INTEGER;
    for (let n of this.frequencyMap.keys()) {
        min = Math.min(min, n);
    }
    if (frequency > min) {
        this.frequencyMap.set(frequency, [sentence]);
        this.frequencyMap.delete(min);
    }
};

/**
 * @param {number} codePoint
 */
AutocompleteSystem.prototype.getIndexFromCharacter = function (codePoint) {
    return codePoint !== this.ASCII_SPACE ? (codePoint - this.ASCII_SMALL_CASE_A) : (this.ALPHABET_PLUS_SPACE_CHARACTER - 1);
};

/**
 * @param {number} index
 */
AutocompleteSystem.prototype.getCharacterFromIndex = function (index) {
    return index < (this.ALPHABET_PLUS_SPACE_CHARACTER - 1) ? String.fromCodePoint(index + this.ASCII_SMALL_CASE_A) : ' ';
};

class TrieNode {

    constructor() {
        this.ALPHABET_PLUS_SPACE_CHARACTER = 27;
        this.frequency = 0;
        this.isEndOfSentence = false;
        this.branches = new Array(this.ALPHABET_PLUS_SPACE_CHARACTER);
    }
}
