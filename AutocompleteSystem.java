
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeMap;

public class AutocompleteSystem {

    final int ASCII_SMALL_CASE_A = 97;
    final int MAX_LENGTH_ENTRY_SENTENCE = 200;//MIN = 1;
    final int ALPHABET_PLUS_SPACE_CHARACTER = 27;
    final int MAX_HOT_SENTENCES_TO_DISPLAY = 3;
    TreeMap<Integer, List<String>> frequencyMap;//At any time, 0<= frequencyMap.size() <=3
    StringBuilder prefix;
    TrieNode root;

    public AutocompleteSystem(String[] sentences, int[] times) {
        root = new TrieNode();
        createDictionary(sentences, times);
        frequencyMap = new TreeMap<>();
        prefix = new StringBuilder();
    }

    public List<String> input(char c) {
        if (c != '#') {
            frequencyMap = new TreeMap<>();
            prefix.append(Character.toString(c));

            char[] array = new char[MAX_LENGTH_ENTRY_SENTENCE];
            TrieNode current = root;
            searchTrie(current, array, 0);
            return pickTop_3_hotSentences();
        }

        addSentenceToTrie(prefix.toString(), 1);
        prefix = new StringBuilder();
        return new ArrayList<>();
    }

    public List<String> pickTop_3_hotSentences() {

        List<String> result = new ArrayList<>();

        for (int frequency : frequencyMap.descendingKeySet()) {

            List<String> sentences = frequencyMap.get(frequency);
            Collections.sort(sentences);

            int indexAdd = Math.min(MAX_HOT_SENTENCES_TO_DISPLAY - result.size(), sentences.size());
            result.addAll(new ArrayList<>(sentences.subList(0, indexAdd)));
            if (result.size() == MAX_HOT_SENTENCES_TO_DISPLAY) {
                break;
            }
        }

        return result;
    }

    public void searchTrie(TrieNode node, char[] array, int trieLevel) {
        if (node == null) {
            return;
        }

        if (node.isEndOfSentence && trieLevel >= prefix.length()) {
            addSentenceToFrequencyMap(String.valueOf(Arrays.copyOfRange(array, 0, trieLevel)), node.frequency);
        }

        for (int i = 0; i < ALPHABET_PLUS_SPACE_CHARACTER; i++) {
            if (node.branches[i] != null) {
                array[trieLevel] = getCharacterFromIndex(i);
                if (trieLevel >= prefix.length() || array[trieLevel] == prefix.charAt(trieLevel)) {
                    searchTrie(node.branches[i], array, trieLevel + 1);
                }
            }
        }
    }

    public boolean equalsPrefix(char[] array) {
        for (int i = 0; i < prefix.length(); i++) {
            if (array[i] != prefix.charAt(i)) {
                return false;
            }
        }
        return true;
    }

    public final void createDictionary(String[] sentences, int[] times) {
        int size = sentences.length;
        for (int i = 0; i < size; i++) {
            addSentenceToTrie(sentences[i], times[i]);
        }
    }

    public void addSentenceToTrie(String sentence, int frequency) {
        TrieNode current = root;
        int size = sentence.length();

        for (int i = 0; i < size; i++) {
            int index = getIndexFromCharacter(sentence.charAt(i));
            if (current.branches[index] == null) {
                current.branches[index] = new TrieNode();
            }
            current = current.branches[index];
        }
        current.isEndOfSentence = true;
        current.frequency += frequency;
    }

    public void addSentenceToFrequencyMap(String sentence, int frequency) {

        if (frequencyMap.size() < MAX_HOT_SENTENCES_TO_DISPLAY) {
            frequencyMap.putIfAbsent(frequency, new ArrayList<>());
            frequencyMap.get(frequency).add(sentence);
            return;
        }

        if (frequencyMap.containsKey(frequency)) {
            frequencyMap.get(frequency).add(sentence);
            return;
        }

        if (frequency > frequencyMap.firstKey()) {
            frequencyMap.put(frequency, new ArrayList<>(List.of(sentence)));
            frequencyMap.remove(frequencyMap.firstKey());
        }
    }

    public int getIndexFromCharacter(char ch) {
        return ch != ' ' ? (ch - 'a') : (ALPHABET_PLUS_SPACE_CHARACTER - 1);
    }

    public char getCharacterFromIndex(int index) {
        return index < (ALPHABET_PLUS_SPACE_CHARACTER - 1) ? (char) (index + ASCII_SMALL_CASE_A) : ' ';
    }
}

class TrieNode {

    final int ALPHABET_PLUS_SPACE_CHARACTER = 27;
    int frequency;
    boolean isEndOfSentence;
    TrieNode[] branches;

    public TrieNode() {
        branches = new TrieNode[ALPHABET_PLUS_SPACE_CHARACTER];
    }
}
