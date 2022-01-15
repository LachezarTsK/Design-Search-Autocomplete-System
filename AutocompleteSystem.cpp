
#include<map>
#include<vector>
#include<iterator>
#include<algorithm>

using namespace std;

struct TrieNode {
    static const size_t ALPHABET_PLUS_SPACE_CHARACTER = 27;
    int frequency = 0;
    bool isEndOfSentence = false;
    TrieNode* branches[ALPHABET_PLUS_SPACE_CHARACTER] = {nullptr};
};

class AutocompleteSystem {
public:
    const size_t MAX_LENGTH_ENTRY_SENTENCE = 200; //MIN = 1;
    const int ASCII_SMALL_CASE_A = 97;
    const int ALPHABET_PLUS_SPACE_CHARACTER = 27;
    const int MAX_HOT_SENTENCES_TO_DISPLAY = 3;
    map<int, vector<string>> frequencyMap; //At any time: 0 <= frequencyMap.size() <= MAX_HOT_SENTENCES_TO_DISPLAY
    vector<char> prefix;
    TrieNode* root = new TrieNode();

    AutocompleteSystem(vector<string>& sentences, vector<int>& times) {
        createDictionary(sentences, times);
    }

    vector<string> input(char c) {
        if (c != '#') {
            frequencyMap.clear();
            prefix.push_back(c);

            vector<char>checkSentence(MAX_LENGTH_ENTRY_SENTENCE, ' ');
            TrieNode* current = root;
            searchTrie(current, checkSentence, 0);

            current = nullptr;
            delete current;
            return pickTop_3_hotSentences();
        }

        addSentenceToTrie((string(prefix.begin(), prefix.end())), 1);
        prefix.clear();
        return vector<string>();
    }

    vector<string> pickTop_3_hotSentences() {

        vector<string> result;
        map<int, vector < string>> ::reverse_iterator it;

        for (it = frequencyMap.rbegin(); it != frequencyMap.rend(); it++) {

            vector<string> sentences = it->second;
            sort(sentences.begin(), sentences.end());

            int indexAdd = min(MAX_HOT_SENTENCES_TO_DISPLAY - result.size(), sentences.size());
            for (size_t j = 0; j < indexAdd; j++) {
                result.push_back(sentences[j]);
            }

            if (result.size() == MAX_HOT_SENTENCES_TO_DISPLAY) {
                break;
            }
        }

        return result;
    }

    void searchTrie(TrieNode* node, vector<char>& checkSentence, int trieLevel) {
        if (node == nullptr) {
            return;
        }

        if (node->isEndOfSentence && trieLevel >= prefix.size()) {
            vector<char> found(checkSentence.begin(), (checkSentence.begin() + trieLevel));
            addSentenceToFrequencyMap((string(found.begin(), found.end())), node->frequency);
        }

        for (int i = 0; i < ALPHABET_PLUS_SPACE_CHARACTER; i++) {
            if (node->branches[i] != nullptr) {
                checkSentence[trieLevel] = getCharacterFromIndex(i);
                if (trieLevel >= prefix.size() || checkSentence[trieLevel] == prefix[trieLevel]) {
                    searchTrie(node->branches[i], checkSentence, trieLevel + 1);
                }
            }
        }
    }

    bool equalsPrefix(vector<char>& checkSentence) {
        for (int i = 0; i < prefix.size(); i++) {
            if (checkSentence[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    void createDictionary(vector<string>& sentences, vector<int>& times) {
        int size = sentences.size();
        for (int i = 0; i < size; i++) {
            addSentenceToTrie(sentences[i], times[i]);
        }
    }

    void addSentenceToTrie(const string& sentence, int frequency) {
        TrieNode* current = root;
        int size = sentence.length();

        for (int i = 0; i < size; i++) {
            int index = getIndexFromCharacter(sentence[i]);
            if (current->branches[index] == nullptr) {
                current->branches[index] = new TrieNode();
            }
            current = current->branches[index];
        }
        current->isEndOfSentence = true;
        current->frequency += frequency;

        current = nullptr;
        delete current;
    }

    void addSentenceToFrequencyMap(const string& sentence, int frequency) {

        if (frequencyMap.size() < MAX_HOT_SENTENCES_TO_DISPLAY) {
            if (frequencyMap.find(frequency) == frequencyMap.end()) {
                frequencyMap[frequency] = vector<string>();
            }
            frequencyMap[frequency].push_back(sentence);
            return;
        }

        if (frequencyMap.find(frequency) != frequencyMap.end()) {
            frequencyMap[frequency].push_back(sentence);
            return;
        }

        if (frequency > frequencyMap.begin()->first) {
            frequencyMap[frequency] = vector<string>();
            frequencyMap[frequency].push_back(sentence);
            frequencyMap.erase(frequencyMap.begin()->first);
        }
    }

    int getIndexFromCharacter(char ch) {
        return ch != ' ' ? (ch - 'a') : (ALPHABET_PLUS_SPACE_CHARACTER - 1);
    }

    char getCharacterFromIndex(int index) {
        return index < (ALPHABET_PLUS_SPACE_CHARACTER - 1) ? (char) (index + ASCII_SMALL_CASE_A) : ' ';
    }
};
