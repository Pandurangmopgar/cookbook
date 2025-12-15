import { Category, Problem } from './types';

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const GET_SYSTEM_INSTRUCTION = (problem: Problem, learningContext?: string) => `You are "Algo", an expert, friendly, and patient coding tutor. 
Your goal is to help the user solve the current algorithm problem: "${problem.title}".

PROBLEM CONTEXT:
${problem.description}

${learningContext ? `
=== STUDENT'S LEARNING HISTORY (from MemoryStack) ===
${learningContext}
=== END LEARNING HISTORY ===

IMPORTANT: Use the learning history above to personalize your tutoring! For example:
- If they struggled with loops before, watch for similar patterns
- If they solved similar problems, reference that success
- If they have preferred approaches, acknowledge them
- If they made specific mistakes before, help them avoid repeating them
` : ''}

GUIDELINES:
1. **Voice-First**: You interact primarily via voice. Keep responses concise (1-3 sentences). Avoid reading long code blocks aloud.
2. **Socratic Method**: Do NOT give the solution immediately. Ask guiding questions.
   - Example: "How can we track the elements we've seen so far?" or "What data structure works best for LIFO?"
3. **Tools - IMPORTANT**:
   - ALWAYS call 'getCurrentCode' FIRST when the user:
     * Says "look at my code", "check this", "is this right?", "what do you think?"
     * Asks for help, feedback, or says they're stuck
     * Mentions they wrote something or made changes
     * Asks any question about their solution
   - Call 'runTests' when the user says "run it", "test it", "execute", or wants to verify their solution
   - Call 'getLearningContext' to fetch the student's learning history and personalize your feedback
   - Call 'storeLearningInsight' to save important observations about the student's learning patterns
   - YOU MUST USE THESE TOOLS - do not try to guess what the code looks like!
4. **Feedback**:
   - If code fails tests, explain *why* concisely.
   - If code passes, celebrate!
   - For complex structures (Trees/Linked Lists/ML Models), visual testing isn't available, so relies on your code analysis.
5. **Context**: The user is writing **Python**.
   - The user is using a class-based structure \`class Solution:\`.
   - Watch out for Python-specific syntax issues or indentation errors.
   - For Machine Learning problems, assume the user has access to \`torch\` and \`numpy\`.

Your personality is encouraging, like a supportive pair programmer.
`;

// --- 1. Arrays & Hashing ---
const ARRAYS: Problem[] = [
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    functionName: 'containsDuplicate',
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true', explanation: 'The value 1 appears at index 0 and index 3.' },
      { input: 'nums = [1,2,3,4]', output: 'false', explanation: 'All elements (1, 2, 3, 4) are unique.' },
      { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true', explanation: 'Multiple values appear more than once.' }
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    starterCode: `from typing import List
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        pass`,
    solution: `from typing import List
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False`,
    solutionExplanation: 'We use a hash set to track numbers we have seen. As we iterate through the array, we check if the current number is already in the set. If yes, we found a duplicate and return True. Otherwise, we add it to the set. If we finish the loop without finding duplicates, return False.',
    testCases: [{ input: [[1,2,3,1]], expected: true }, { input: [[1,2,3,4]], expected: false }]
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    functionName: 'isAnagram',
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
        { input: 's="anagram", t="nagaram"', output: 'true', explanation: 'Both strings contain the same characters: 3 "a"s, 1 "n", 1 "g", 1 "r", 1 "m".' },
        { input: 's="rat", t="car"', output: 'false', explanation: '"rat" has "r","a","t" but "car" has "c","a","r". They do not match.' }
    ],
    starterCode: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        pass`,
    solution: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        
        count = {}
        for c in s:
            count[c] = count.get(c, 0) + 1
        
        for c in t:
            if c not in count:
                return False
            count[c] -= 1
            if count[c] < 0:
                return False
        
        return True`,
    solutionExplanation: 'We use a hash map to count character frequencies in the first string. Then we iterate through the second string, decrementing counts. If any character is missing or count goes negative, they are not anagrams. Alternatively, you can sort both strings and compare, but that is O(n log n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [{ input: ["anagram", "nagaram"], expected: true }, { input: ["rat", "car"], expected: false }]
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    functionName: 'twoSum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 2 + 7 == 9, so we return [0, 1].' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 2 + 4 == 6.' }
    ],
    starterCode: `from typing import List
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
    solution: `from typing import List
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # value -> index
        
        for i, num in enumerate(nums):
            complement = target - num
            
            if complement in seen:
                return [seen[complement], i]
            
            seen[num] = i
        
        return []`,
    solutionExplanation: 'We use a hash map to store each number and its index as we iterate. For each number, we calculate its complement (target - num). If the complement exists in our hash map, we found our pair and return both indices. This one-pass approach is optimal because hash map lookups are O(1).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [{ input: [[2,7,11,15], 9], expected: [0,1] }, { input: [[3,2,4], 6], expected: [1,2] }]
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    functionName: 'groupAnagrams',
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.`,
    examples: [
        { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Groups are formed by words using the exact same set of letters.' },
        { input: 'strs = [""]', output: '[[""]]', explanation: 'Single empty string is its own group.' }
    ],
    starterCode: `from typing import List
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        pass`,
    solution: `from typing import List
from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        
        for s in strs:
            # Use sorted string as key
            key = tuple(sorted(s))
            groups[key].append(s)
        
        return list(groups.values())`,
    solutionExplanation: 'We use a hash map where the key is a sorted tuple of characters. All anagrams will have the same sorted form, so they get grouped together. For each string, we sort it to create the key and append the original string to that group.',
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
    testCases: [{ input: [["eat","tea","tan","ate","nat","bat"]], expected: [["bat"],["nat","tan"],["ate","eat","tea"]] }]
  },
  {
    id: 'top-k-frequent',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    functionName: 'topKFrequent',
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`,
    examples: [
        { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explanation: '1 appears 3 times, 2 appears 2 times, 3 appears 1 time. The top 2 are 1 and 2.' },
        { input: 'nums = [1], k = 1', output: '[1]', explanation: 'Only one element exists.' }
    ],
    starterCode: `from typing import List
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        pass`,
    solution: `from typing import List
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        
        # Bucket sort: index = frequency, value = list of nums
        buckets = [[] for _ in range(len(nums) + 1)]
        for num, freq in count.items():
            buckets[freq].append(num)
        
        result = []
        for i in range(len(buckets) - 1, -1, -1):
            for num in buckets[i]:
                result.append(num)
                if len(result) == k:
                    return result
        
        return result`,
    solutionExplanation: 'We use bucket sort for O(n) time. First count frequencies with a hash map. Then create buckets where index = frequency. Finally, iterate from highest frequency bucket down, collecting elements until we have k elements.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [{ input: [[1,1,1,2,2,3], 2], expected: [1,2] }]
  },
  {
    id: 'encode-decode-strings',
    title: 'Encode and Decode Strings',
    difficulty: 'Medium',
    functionName: 'encode',
    description: `Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.`,
    examples: [
        { input: '["lint","code","love","you"]', output: '["lint","code","love","you"]', explanation: 'The decoded list matches the original list.' },
        { input: '["we", "say", ":", "yes"]', output: '["we", "say", ":", "yes"]', explanation: 'Handles special characters correctly.' }
    ],
    starterCode: `from typing import List
class Solution:
    def encode(self, strs: List[str]) -> str:
        pass
    def decode(self, s: str) -> List[str]:
        pass`,
    solution: `from typing import List

class Solution:
    def encode(self, strs: List[str]) -> str:
        # Format: length + '#' + string
        result = ""
        for s in strs:
            result += str(len(s)) + "#" + s
        return result
    
    def decode(self, s: str) -> List[str]:
        result = []
        i = 0
        while i < len(s):
            j = i
            while s[j] != '#':
                j += 1
            length = int(s[i:j])
            result.append(s[j + 1 : j + 1 + length])
            i = j + 1 + length
        return result`,
    solutionExplanation: 'We encode each string as "length#string". The length prefix tells us exactly how many characters to read, so we can handle any characters including # in the original strings. Decode reads the length, then extracts that many characters.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [{ input: [["lint","code","love","you"]], expected: "encoded_string_placeholder" }] // Placeholder as encode/decode is 2 parts
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    functionName: 'productExceptSelf',
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.`,
    examples: [
        { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Index 0: 2*3*4=24. Index 1: 1*3*4=12. Index 2: 1*2*4=8. Index 3: 1*2*3=6.' },
        { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: 'Product involves a zero for all elements except the one at index 2.' }
    ],
    starterCode: `from typing import List
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        pass`,
    solution: `from typing import List

class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        result = [1] * n
        
        # Left pass: result[i] = product of all elements to the left
        prefix = 1
        for i in range(n):
            result[i] = prefix
            prefix *= nums[i]
        
        # Right pass: multiply by product of all elements to the right
        suffix = 1
        for i in range(n - 1, -1, -1):
            result[i] *= suffix
            suffix *= nums[i]
        
        return result`,
    solutionExplanation: 'We make two passes. First pass (left to right): store the product of all elements to the left of each index. Second pass (right to left): multiply by the product of all elements to the right. This gives us the product of everything except self without using division.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [{ input: [[1,2,3,4]], expected: [24,12,8,6] }]
  },
  {
    id: 'valid-sudoku',
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    functionName: 'isValidSudoku',
    description: `Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules: 
1. Each row must contain the digits 1-9 without repetition. 
2. Each column must contain the digits 1-9 without repetition. 
3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.`,
    examples: [
        { input: 'board = [...]', output: 'true', explanation: 'All rows, columns, and 3x3 sub-boxes contain unique digits (or dots).' },
        { input: 'board = [["8","3",".",".","7",".",".",".","."],...]', output: 'false', explanation: 'Wait, 8 appears twice in the top-left corner?' }
    ],
    starterCode: `from typing import List
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        pass`,
    solution: `from typing import List

class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        
        for r in range(9):
            for c in range(9):
                val = board[r][c]
                if val == '.':
                    continue
                
                box_idx = (r // 3) * 3 + (c // 3)
                
                if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                    return False
                
                rows[r].add(val)
                cols[c].add(val)
                boxes[box_idx].add(val)
        
        return True`,
    solutionExplanation: 'We use three arrays of sets to track seen numbers: one for each row, column, and 3x3 box. For each cell, we check if the value already exists in its row, column, or box. The box index is calculated as (row//3)*3 + (col//3).',
    timeComplexity: 'O(81) = O(1)',
    spaceComplexity: 'O(81) = O(1)',
    testCases: []
  },
  {
    id: 'longest-consecutive',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    functionName: 'longestConsecutive',
    description: `Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.`,
    examples: [
        { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' },
        { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9', explanation: 'Sequence is [0, 1, 2, 3, 4, 5, 6, 7, 8].' }
    ],
    starterCode: `from typing import List
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        pass`,
    solution: `from typing import List

class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        longest = 0
        
        for num in num_set:
            # Only start counting if num is the start of a sequence
            if num - 1 not in num_set:
                current = num
                length = 1
                
                while current + 1 in num_set:
                    current += 1
                    length += 1
                
                longest = max(longest, length)
        
        return longest`,
    solutionExplanation: 'We use a set for O(1) lookups. The key insight: only start counting from numbers that are the START of a sequence (num-1 not in set). Then count consecutive numbers. This ensures each number is visited at most twice, giving O(n) time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [{ input: [[100,4,200,1,3,2]], expected: 4 }]
  }
];

// --- 2. Two Pointers ---
const TWO_POINTERS: Problem[] = [
    {
        id: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        functionName: 'isPalindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
        examples: [
            { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: 'Normalized to "amanaplanacanalpanama", which reads the same forwards and backwards.' },
            { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
        ],
        starterCode: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        pass`,
        solution: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        
        while left < right:
            # Skip non-alphanumeric characters
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            
            if s[left].lower() != s[right].lower():
                return False
            
            left += 1
            right -= 1
        
        return True`,
        solutionExplanation: 'We use two pointers starting from both ends. Skip non-alphanumeric characters, then compare characters (case-insensitive). If any pair doesn\'t match, it\'s not a palindrome. Continue until pointers meet.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["A man, a plan, a canal: Panama"], expected: true }, { input: ["race a car"], expected: false }]
    },
    {
        id: 'two-sum-ii',
        title: 'Two Sum II - Input Array Sorted',
        difficulty: 'Medium',
        functionName: 'twoSum',
        description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the indices of the two numbers, added by one.',
        examples: [
            { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', explanation: '2 + 7 = 9. Indices are 1 and 2.' },
            { input: 'numbers = [2,3,4], target = 6', output: '[1,3]', explanation: '2 + 4 = 6. Indices are 1 and 3.' }
        ],
        starterCode: `from typing import List
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        pass`,
        solution: `from typing import List

class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1
        
        while left < right:
            current_sum = numbers[left] + numbers[right]
            
            if current_sum == target:
                return [left + 1, right + 1]  # 1-indexed
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        
        return []`,
        solutionExplanation: 'Since the array is sorted, we use two pointers. If sum is too small, move left pointer right (increase sum). If sum is too big, move right pointer left (decrease sum). This works because sorted order guarantees we won\'t miss the answer.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,7,11,15], 9], expected: [1,2] }]
    },
    {
        id: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        functionName: 'threeSum',
        description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
        examples: [
            { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].' },
            { input: 'nums = [0,1,1]', output: '[]', explanation: 'No triplet sums to 0.' }
        ],
        starterCode: `from typing import List
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        
        for i in range(len(nums) - 2):
            # Skip duplicates for first element
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            
            left, right = i + 1, len(nums) - 1
            
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                
                if total == 0:
                    result.append([nums[i], nums[left], nums[right]])
                    # Skip duplicates
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1
        
        return result`,
        solutionExplanation: 'Sort the array first. Fix one element, then use two pointers to find pairs that sum to its negative. Skip duplicates at all three positions to avoid duplicate triplets. Sorting enables the two-pointer technique.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] }]
    },
    {
        id: 'container-with-most-water',
        title: 'Container With Most Water',
        difficulty: 'Medium',
        functionName: 'maxArea',
        description: 'You are given an integer array height of length n. There are n vertical lines drawn. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
        examples: [
            { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between index 1 (height 8) and index 8 (height 7). Width is 7. Area = 7 * 7 = 49.' },
            { input: 'height = [1,1]', output: '1', explanation: 'Width 1, height 1. Area = 1.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxArea(self, height: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        max_area = 0
        
        while left < right:
            width = right - left
            h = min(height[left], height[right])
            max_area = max(max_area, width * h)
            
            # Move the shorter line inward
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        
        return max_area`,
        solutionExplanation: 'Start with widest container (both ends). Area = width × min(height). Always move the shorter line inward because keeping it can\'t increase area (width decreases, height limited by shorter). This greedy approach finds the optimal solution.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,8,6,2,5,4,8,3,7]], expected: 49 }]
    },
    {
        id: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        functionName: 'trap',
        description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        examples: [
            { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The blue section in a diagram would represent 6 units of water trapped.' },
            { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: 'Water is trapped between the peaks.' }
        ],
        starterCode: `from typing import List
class Solution:
    def trap(self, height: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        
        return water`,
        solutionExplanation: 'Two pointer approach: water at each position = min(max_left, max_right) - height. We track max heights from both sides. Move the pointer with smaller max because that side determines the water level. Add water trapped at each step.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6 }]
    }
];

// --- 3. Sliding Window ---
const SLIDING_WINDOW: Problem[] = [
    {
        id: 'best-time-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        functionName: 'maxProfit',
        description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
        examples: [
            { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
            { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and the max profit = 0.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        
        return max_profit`,
        solutionExplanation: 'We track the minimum price seen so far and the maximum profit. For each price, we either update the minimum (potential buy point) or calculate profit if we sold at current price. This is a sliding window where we always buy at the lowest point before the current day.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[7,1,5,3,6,4]], expected: 5 }]
    },
    {
        id: 'longest-substring-no-repeat',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        functionName: 'lengthOfLongestSubstring',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        examples: [
            { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
            { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' }
        ],
        starterCode: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
        solution: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_set = set()
        left = 0
        max_len = 0
        
        for right in range(len(s)):
            while s[right] in char_set:
                char_set.remove(s[left])
                left += 1
            
            char_set.add(s[right])
            max_len = max(max_len, right - left + 1)
        
        return max_len`,
        solutionExplanation: 'We use a sliding window with a set to track characters in the current window. When we find a duplicate, we shrink the window from the left until the duplicate is removed. The window always contains unique characters, and we track the maximum length seen.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(min(n, m))',
        testCases: [{ input: ["abcabcbb"], expected: 3 }]
    },
    {
        id: 'longest-repeating-char-replacement',
        title: 'Longest Repeating Character Replacement',
        difficulty: 'Medium',
        functionName: 'characterReplacement',
        description: 'You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get.',
        examples: [
            { input: 's = "ABAB", k = 2', output: '4', explanation: 'Replace the two "A"s with two "B"s or vice versa.' },
            { input: 's = "AABABBA", k = 1', output: '4', explanation: 'Replace the one middle "B" with "A" to get "AAAA" substring.' }
        ],
        starterCode: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        pass`,
        solution: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        left = 0
        max_freq = 0
        result = 0
        
        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            max_freq = max(max_freq, count[s[right]])
            
            # Window size - max frequency = chars to replace
            while (right - left + 1) - max_freq > k:
                count[s[left]] -= 1
                left += 1
            
            result = max(result, right - left + 1)
        
        return result`,
        solutionExplanation: 'We use a sliding window tracking character frequencies. The key insight: window is valid if (window_size - max_frequency) <= k, meaning we can replace the non-dominant characters. When invalid, shrink from left. Track the maximum valid window size.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(26) = O(1)',
        testCases: [{ input: ["ABAB", 2], expected: 4 }]
    },
    {
        id: 'permutation-in-string',
        title: 'Permutation in String',
        difficulty: 'Medium',
        functionName: 'checkInclusion',
        description: 'Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise. In other words, return true if one of s1\'s permutations is the substring of s2.',
        examples: [
            { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', explanation: 's2 contains one permutation of s1 ("ba").' },
            { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false', explanation: 'No permutation of "ab" is present as a substring.' }
        ],
        starterCode: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        pass`,
        solution: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        
        s1_count = {}
        window_count = {}
        
        for c in s1:
            s1_count[c] = s1_count.get(c, 0) + 1
        
        for i in range(len(s2)):
            # Add right character
            window_count[s2[i]] = window_count.get(s2[i], 0) + 1
            
            # Remove left character if window exceeds s1 length
            if i >= len(s1):
                left_char = s2[i - len(s1)]
                window_count[left_char] -= 1
                if window_count[left_char] == 0:
                    del window_count[left_char]
            
            if window_count == s1_count:
                return True
        
        return False`,
        solutionExplanation: 'We use a fixed-size sliding window of length s1. We maintain character counts for both s1 and the current window. As we slide, we add the new character and remove the old one. If counts match at any point, we found a permutation.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(26) = O(1)',
        testCases: [{ input: ["ab", "eidbaooo"], expected: true }]
    },
    {
        id: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        functionName: 'minWindow',
        description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.',
        examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: '"BANC" includes A, B, and C.' },
            { input: 's = "a", t = "a"', output: '"a"', explanation: 'Entire string s is the minimum window.' }
        ],
        starterCode: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        pass`,
        solution: `from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        
        t_count = Counter(t)
        required = len(t_count)
        
        left = 0
        formed = 0
        window_counts = {}
        
        ans = float("inf"), None, None  # (length, left, right)
        
        for right in range(len(s)):
            char = s[right]
            window_counts[char] = window_counts.get(char, 0) + 1
            
            if char in t_count and window_counts[char] == t_count[char]:
                formed += 1
            
            while left <= right and formed == required:
                char = s[left]
                
                if right - left + 1 < ans[0]:
                    ans = (right - left + 1, left, right)
                
                window_counts[char] -= 1
                if char in t_count and window_counts[char] < t_count[char]:
                    formed -= 1
                
                left += 1
        
        return "" if ans[0] == float("inf") else s[ans[1]:ans[2] + 1]`,
        solutionExplanation: 'We expand the window until it contains all characters from t, then contract from the left to find the minimum valid window. We track how many unique characters have the required count (formed). When formed equals required, we have a valid window and try to shrink it.',
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(m + n)',
        testCases: [{ input: ["ADOBECODEBANC", "ABC"], expected: "BANC" }]
    },
    {
        id: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        functionName: 'maxSlidingWindow',
        description: 'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Return the max sliding window.',
        examples: [
            { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Window [1 3 -1] max is 3. Window [3 -1 -3] max is 3. And so on.' },
            { input: 'nums = [1], k = 1', output: '[1]', explanation: 'Trivial case.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        pass`,
        solution: `from typing import List
from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        result = []
        dq = deque()  # stores indices
        
        for i in range(len(nums)):
            # Remove indices outside window
            while dq and dq[0] < i - k + 1:
                dq.popleft()
            
            # Remove smaller elements (they can never be max)
            while dq and nums[dq[-1]] < nums[i]:
                dq.pop()
            
            dq.append(i)
            
            # Start adding to result once we have a full window
            if i >= k - 1:
                result.append(nums[dq[0]])
        
        return result`,
        solutionExplanation: 'We use a monotonic decreasing deque storing indices. The front always has the maximum for the current window. When adding a new element, we remove all smaller elements from the back (they can never be the max while the new element is in the window). We also remove elements outside the window from the front.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(k)',
        testCases: [{ input: [[1,3,-1,-3,5,3,6,7], 3], expected: [3,3,5,5,6,7] }]
    }
];

// --- 4. Stack ---
const STACK: Problem[] = [
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        functionName: 'isValid',
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
        examples: [
            { input: 's = "()[]{}"', output: 'true', explanation: 'Pairs match and are closed in order.' },
            { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
        ],
        starterCode: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
        solution: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        
        for char in s:
            if char in mapping:
                # Closing bracket
                if not stack or stack[-1] != mapping[char]:
                    return False
                stack.pop()
            else:
                # Opening bracket
                stack.append(char)
        
        return len(stack) == 0`,
        solutionExplanation: 'We use a stack to track opening brackets. When we see an opening bracket, we push it onto the stack. When we see a closing bracket, we check if it matches the most recent opening bracket (top of stack). If it matches, we pop; if not, the string is invalid. At the end, the stack should be empty for a valid string.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: ["()[]{}"], expected: true }, { input: ["(]"], expected: false }]
    },
    {
        id: 'min-stack',
        title: 'Min Stack',
        difficulty: 'Medium',
        functionName: 'MinStack',
        description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
        examples: [
            { input: 'MinStack() -> push(-2) -> push(0) -> push(-3) -> getMin()', output: '-3', explanation: 'The stack contains [-2, 0, -3]. The min is -3.' },
            { input: '... pop() -> top()', output: '0', explanation: '-3 was popped. The top is now 0.' }
        ],
        starterCode: `class MinStack:
    def __init__(self):
        pass
    def push(self, val: int) -> None:
        pass
    def pop(self) -> None:
        pass
    def top(self) -> int:
        pass
    def getMin(self) -> int:
        pass`,
        solution: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val: int) -> None:
        self.stack.append(val)
        # Push to min_stack if empty or val <= current min
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self) -> None:
        if self.stack:
            val = self.stack.pop()
            if val == self.min_stack[-1]:
                self.min_stack.pop()
    
    def top(self) -> int:
        return self.stack[-1] if self.stack else -1
    
    def getMin(self) -> int:
        return self.min_stack[-1] if self.min_stack else -1`,
        solutionExplanation: 'We use two stacks: one for values and one for minimums. The min_stack only stores values when they are <= the current minimum. When we pop, if the popped value equals the current min, we also pop from min_stack. This gives O(1) for all operations.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)',
        testCases: []
    },
    {
        id: 'eval-rpn',
        title: 'Evaluate Reverse Polish Notation',
        difficulty: 'Medium',
        functionName: 'evalRPN',
        description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /.',
        examples: [
            { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
            { input: 'tokens = ["4","13","5","/","+"]', output: '6', explanation: '(4 + (13 / 5)) = 6' }
        ],
        starterCode: `from typing import List
class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        operators = {'+', '-', '*', '/'}
        
        for token in tokens:
            if token in operators:
                b = stack.pop()
                a = stack.pop()
                
                if token == '+':
                    stack.append(a + b)
                elif token == '-':
                    stack.append(a - b)
                elif token == '*':
                    stack.append(a * b)
                else:  # division
                    stack.append(int(a / b))  # truncate toward zero
            else:
                stack.append(int(token))
        
        return stack[0]`,
        solutionExplanation: 'We use a stack to evaluate RPN. Numbers are pushed onto the stack. When we see an operator, we pop two operands, apply the operation, and push the result back. The order matters: first popped is the right operand. Division truncates toward zero.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [["2","1","+","3","*"]], expected: 9 }]
    },
    {
        id: 'generate-parentheses',
        title: 'Generate Parentheses',
        difficulty: 'Medium',
        functionName: 'generateParenthesis',
        description: 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
        examples: [
            { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]', explanation: 'All distinct valid combinations.' },
            { input: 'n = 1', output: '["()"]', explanation: 'Only one pair possible.' }
        ],
        starterCode: `from typing import List
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        pass`,
        solution: `from typing import List

class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        result = []
        
        def backtrack(current, open_count, close_count):
            if len(current) == 2 * n:
                result.append(current)
                return
            
            if open_count < n:
                backtrack(current + '(', open_count + 1, close_count)
            
            if close_count < open_count:
                backtrack(current + ')', open_count, close_count + 1)
        
        backtrack('', 0, 0)
        return result`,
        solutionExplanation: 'We use backtracking with two rules: 1) We can add "(" if we have not used all n opening brackets. 2) We can add ")" only if close_count < open_count (ensures validity). This generates only valid combinations without needing to filter.',
        timeComplexity: 'O(4^n / sqrt(n))',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [3], expected: ["((()))","(()())","(())()","()(())","()()()"] }]
    },
    {
        id: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        functionName: 'dailyTemperatures',
        description: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0.',
        examples: [
            { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]', explanation: 'For 73, next is 74 (1 day). For 75, next is 76 (4 days later).' },
            { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]', explanation: 'Each day is warmer than the previous.' }
        ],
        starterCode: `from typing import List
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        pass`,
        solution: `from typing import List

class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        result = [0] * n
        stack = []  # stores indices
        
        for i in range(n):
            while stack and temperatures[i] > temperatures[stack[-1]]:
                prev_idx = stack.pop()
                result[prev_idx] = i - prev_idx
            stack.append(i)
        
        return result`,
        solutionExplanation: 'We use a monotonic decreasing stack storing indices. For each temperature, we pop all indices with smaller temperatures (we found their next warmer day). The difference in indices gives the number of days to wait. Indices remaining in the stack have no warmer day (stay 0).',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[73,74,75,71,69,72,76,73]], expected: [1,1,4,2,1,1,0,0] }]
    },
    {
        id: 'car-fleet',
        title: 'Car Fleet',
        difficulty: 'Medium',
        functionName: 'carFleet',
        description: 'There are n cars going to the same destination along a one-lane road. You are given the target position, and arrays position and speed. A car fleet is some non-empty set of cars driving at the same position and same speed. Return the number of car fleets that will arrive at the destination.',
        examples: [
            { input: 'target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]', output: '3', explanation: 'Cars at 10 and 8 form a fleet. Car at 0 forms a fleet. Cars at 5 and 3 form a fleet.' },
            { input: 'target = 10, position = [3], speed = [3]', output: '1', explanation: 'One car is one fleet.' }
        ],
        starterCode: `from typing import List
class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        # Pair position and speed, sort by position descending
        cars = sorted(zip(position, speed), reverse=True)
        stack = []  # stores time to reach target
        
        for pos, spd in cars:
            time = (target - pos) / spd
            
            # If this car takes longer than the car ahead, it's a new fleet
            if not stack or time > stack[-1]:
                stack.append(time)
        
        return len(stack)`,
        solutionExplanation: 'Sort cars by position (closest to target first). Calculate time to reach target for each car. If a car behind takes less time, it will catch up and merge into the fleet ahead. We use a stack to track fleet times. A new fleet forms only when a car takes longer than the one ahead.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [12, [10,8,0,5,3], [2,4,1,1,3]], expected: 3 }]
    },
    {
        id: 'largest-rectangle-histogram',
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        functionName: 'largestRectangleArea',
        description: 'Given an array of integers heights representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.',
        examples: [
            { input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'The largest rectangle is formed by the bars of height 5 and 6, with width 2. Area = 5 * 2 = 10.' },
            { input: 'heights = [2,4]', output: '4', explanation: 'Largest is single bar 4, or 2*2.' }
        ],
        starterCode: `from typing import List
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []  # stores indices
        max_area = 0
        
        for i, h in enumerate(heights):
            start = i
            while stack and stack[-1][1] > h:
                idx, height = stack.pop()
                max_area = max(max_area, height * (i - idx))
                start = idx
            stack.append((start, h))
        
        # Process remaining bars
        for idx, height in stack:
            max_area = max(max_area, height * (len(heights) - idx))
        
        return max_area`,
        solutionExplanation: 'We use a monotonic increasing stack storing (index, height). When we see a shorter bar, we pop taller bars and calculate their areas (they cannot extend further right). We track the leftmost index where each height can extend. Remaining bars in the stack extend to the end.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[2,1,5,6,2,3]], expected: 10 }]
    }
];

// --- 5. Binary Search ---
const BINARY_SEARCH: Problem[] = [
    {
        id: 'binary-search',
        title: 'Binary Search',
        difficulty: 'Easy',
        functionName: 'search',
        description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
        examples: [
            { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' }, 
            { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' }
        ],
        starterCode: `from typing import List
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return -1`,
        solutionExplanation: 'Binary search works by repeatedly dividing the search interval in half. We maintain two pointers (left and right) and calculate the middle index. If the middle element equals the target, we return its index. If the target is greater, we search the right half; if smaller, we search the left half. This continues until we find the target or the search space is exhausted.',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[-1,0,3,5,9,12], 9], expected: 4 }]
    },
    {
        id: 'search-2d-matrix',
        title: 'Search a 2D Matrix',
        difficulty: 'Medium',
        functionName: 'searchMatrix',
        description: 'Write an efficient algorithm that searches for a value target in an m x n integer matrix matrix. This matrix has the following properties: Integers in each row are sorted from left to right. The first integer of each row is greater than the last integer of the previous row.',
        examples: [
            { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true', explanation: '3 is present in the first row.' },
            { input: 'matrix = [[1,3]], target = 15', output: 'false', explanation: '15 is not in the matrix.' }
        ],
        starterCode: `from typing import List
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        pass`,
        solution: `from typing import List

class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        if not matrix or not matrix[0]:
            return False
        
        rows, cols = len(matrix), len(matrix[0])
        left, right = 0, rows * cols - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            # Convert 1D index to 2D coordinates
            row = mid // cols
            col = mid % cols
            val = matrix[row][col]
            
            if val == target:
                return True
            elif val < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return False`,
        solutionExplanation: 'Treat the 2D matrix as a sorted 1D array. Use binary search on indices 0 to (rows*cols-1). Convert 1D index to 2D: row = index // cols, col = index % cols. This gives O(log(m*n)) time complexity.',
        timeComplexity: 'O(log(m*n))',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3], expected: true }]
    },
    {
        id: 'koko-eating-bananas',
        title: 'Koko Eating Bananas',
        difficulty: 'Medium',
        functionName: 'minEatingSpeed',
        description: 'Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. The guards have gone and will come back in h hours. Koko can decide her bananas-per-hour eating speed of k. Return the minimum integer k such that she can eat all the bananas within h hours.',
        examples: [
            { input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'Eating speed 4 allows finishing in: 1hr(3) + 2hr(6) + 2hr(7) + 3hr(11) = 8hrs.' },
            { input: 'piles = [30,11,23,4,20], h = 5', output: '30', explanation: 'Must eat max pile in 1 hour.' }
        ],
        starterCode: `from typing import List
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        pass`,
        solution: `from typing import List
import math

class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        def can_finish(k):
            hours = 0
            for pile in piles:
                hours += math.ceil(pile / k)
            return hours <= h
        
        left, right = 1, max(piles)
        
        while left < right:
            mid = left + (right - left) // 2
            
            if can_finish(mid):
                right = mid  # Try smaller speed
            else:
                left = mid + 1  # Need faster speed
        
        return left`,
        solutionExplanation: 'Binary search on the eating speed k (1 to max pile). For each speed, calculate total hours needed (ceiling of pile/k for each pile). If we can finish in h hours, try a smaller speed. Otherwise, we need a faster speed. Find the minimum valid speed.',
        timeComplexity: 'O(n * log(max(piles)))',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[3,6,7,11], 8], expected: 4 }]
    },
    {
        id: 'find-min-rotated-sorted',
        title: 'Find Minimum in Rotated Sorted Array',
        difficulty: 'Medium',
        functionName: 'findMin',
        description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array.',
        examples: [
            { input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'The original was [1,2,3,4,5] rotated 3 times.' },
            { input: 'nums = [11,13,15,17]', output: '11', explanation: 'Sorted array with no rotation.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findMin(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1
        
        while left < right:
            mid = left + (right - left) // 2
            
            if nums[mid] > nums[right]:
                # Min is in right half
                left = mid + 1
            else:
                # Min is in left half (including mid)
                right = mid
        
        return nums[left]`,
        solutionExplanation: 'In a rotated sorted array, the minimum is at the rotation point. Compare mid with right: if mid > right, the rotation point (minimum) is in the right half. Otherwise, it is in the left half including mid. Continue until left == right.',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[3,4,5,1,2]], expected: 1 }]
    },
    {
        id: 'search-rotated-sorted',
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        functionName: 'search',
        description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.',
        examples: [
            { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 is at index 4.' },
            { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '3 is not in the array.' }
        ],
        starterCode: `from typing import List
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                return mid
            
            # Left half is sorted
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            # Right half is sorted
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        
        return -1`,
        solutionExplanation: 'At each step, one half is always sorted. Determine which half is sorted by comparing nums[left] with nums[mid]. Then check if target is in the sorted half (easy to check with range comparison). If yes, search there; otherwise, search the other half.',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[4,5,6,7,0,1,2], 0], expected: 4 }]
    },
     {
        id: 'time-based-key-value',
        title: 'Time Based Key-Value Store',
        difficulty: 'Medium',
        functionName: 'TimeMap',
        description: 'Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key\'s value at a certain timestamp.',
        examples: [
            { input: 'set("foo", "bar", 1); get("foo", 1);', output: '"bar"', explanation: 'Value at timestamp 1 is bar.' },
            { input: 'get("foo", 3);', output: '"bar"', explanation: 'Value at timestamp 3 is bar (most recent).' }
        ],
        starterCode: `class TimeMap:
    def __init__(self):
        pass
    def set(self, key: str, value: str, timestamp: int) -> None:
        pass
    def get(self, key: str, timestamp: int) -> str:
        pass`,
        solution: `class TimeMap:
    def __init__(self):
        self.store = {}  # key -> list of (timestamp, value)
    
    def set(self, key: str, value: str, timestamp: int) -> None:
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((timestamp, value))
    
    def get(self, key: str, timestamp: int) -> str:
        if key not in self.store:
            return ""
        
        values = self.store[key]
        left, right = 0, len(values) - 1
        result = ""
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if values[mid][0] <= timestamp:
                result = values[mid][1]
                left = mid + 1
            else:
                right = mid - 1
        
        return result`,
        solutionExplanation: 'Store values as (timestamp, value) pairs in a list for each key. Since timestamps are always increasing, the list is sorted. For get, use binary search to find the largest timestamp <= query timestamp. Track the best result found so far.',
        timeComplexity: 'O(1) set, O(log n) get',
        spaceComplexity: 'O(n)',
        testCases: []
    },
    {
        id: 'median-two-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        functionName: 'findMedianSortedArrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
        examples: [
            { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'Merged array = [1,2,3] and median is 2.' },
            { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'Merged array = [1,2,3,4] and median is (2+3)/2 = 2.5.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        pass`,
        solution: `from typing import List

class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        # Ensure nums1 is smaller
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        
        m, n = len(nums1), len(nums2)
        left, right = 0, m
        
        while left <= right:
            i = (left + right) // 2  # partition in nums1
            j = (m + n + 1) // 2 - i  # partition in nums2
            
            left1 = nums1[i - 1] if i > 0 else float('-inf')
            right1 = nums1[i] if i < m else float('inf')
            left2 = nums2[j - 1] if j > 0 else float('-inf')
            right2 = nums2[j] if j < n else float('inf')
            
            if left1 <= right2 and left2 <= right1:
                # Found correct partition
                if (m + n) % 2 == 0:
                    return (max(left1, left2) + min(right1, right2)) / 2
                else:
                    return max(left1, left2)
            elif left1 > right2:
                right = i - 1
            else:
                left = i + 1
        
        return 0.0`,
        solutionExplanation: 'Binary search on the smaller array to find the correct partition. We need to split both arrays such that all elements on the left are <= all elements on the right. The partition is correct when left1 <= right2 and left2 <= right1. Median is derived from the boundary elements.',
        timeComplexity: 'O(log(min(m,n)))',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,3], [2]], expected: 2.0 }]
    }
];

// --- 6. Linked List ---
const LINKED_LIST: Problem[] = [
    {
        id: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        functionName: 'reverseList',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        examples: [
            { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'The list is reversed.' },
            { input: 'head = [1,2]', output: '[2,1]', explanation: 'Two element reversal.' }
        ],
        starterCode: `from typing import Optional
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        
        while curr:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        
        return prev`,
        solutionExplanation: 'We iterate through the list, reversing each pointer. We maintain three pointers: prev (previous node), curr (current node), and next_temp (to save the next node before we change curr.next). At each step, we point curr.next to prev, then advance all pointers.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        functionName: 'mergeTwoLists',
        description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
        examples: [
            { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Elements are interleaved in sorted order.' },
            { input: 'list1 = [], list2 = []', output: '[]', explanation: 'Two empty lists merge to empty.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        
        while list1 and list2:
            if list1.val <= list2.val:
                curr.next = list1
                list1 = list1.next
            else:
                curr.next = list2
                list2 = list2.next
            curr = curr.next
        
        curr.next = list1 if list1 else list2
        return dummy.next`,
        solutionExplanation: 'We use a dummy node to simplify edge cases. Compare nodes from both lists, always picking the smaller one and advancing that list pointer. When one list is exhausted, attach the remaining nodes from the other list.',
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'linked-list-cycle',
        title: 'Linked List Cycle',
        difficulty: 'Easy',
        functionName: 'hasCycle',
        description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
        examples: [
            { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to node at index 1.' },
            { input: 'head = [1], pos = -1', output: 'false', explanation: 'No cycle.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        pass`,
        solution: `from typing import Optional

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            
            if slow == fast:
                return True
        
        return False`,
        solutionExplanation: 'Floyd\'s Cycle Detection (Tortoise and Hare). Use two pointers: slow moves 1 step, fast moves 2 steps. If there is a cycle, fast will eventually catch up to slow. If fast reaches the end (null), there is no cycle.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'reorder-list',
        title: 'Reorder List',
        difficulty: 'Medium',
        functionName: 'reorderList',
        description: 'You are given the head of a singly linked-list. The list can be represented as: L0 → L1 → … → Ln - 1 → Ln. Reorder the list to be on the following form: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …',
        examples: [
            { input: 'head = [1,2,3,4]', output: '[1,4,2,3]', explanation: '1 pairs with 4, 2 pairs with 3.' },
            { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]', explanation: 'Standard reordering.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        pass`,
        solution: `from typing import Optional

class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        if not head or not head.next:
            return
        
        # Find middle
        slow, fast = head, head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        
        # Reverse second half
        prev, curr = None, slow.next
        slow.next = None
        while curr:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        
        # Merge two halves
        first, second = head, prev
        while second:
            tmp1, tmp2 = first.next, second.next
            first.next = second
            second.next = tmp1
            first, second = tmp1, tmp2`,
        solutionExplanation: 'Three steps: 1) Find the middle using slow/fast pointers. 2) Reverse the second half of the list. 3) Merge the two halves by alternating nodes from each half.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'remove-nth-node',
        title: 'Remove Nth Node From End of List',
        difficulty: 'Medium',
        functionName: 'removeNthFromEnd',
        description: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
        examples: [
            { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', explanation: '2nd node from end is 4. Removed.' },
            { input: 'head = [1], n = 1', output: '[]', explanation: 'Only node removed.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        left = dummy
        right = head
        
        # Move right n steps ahead
        for _ in range(n):
            right = right.next
        
        # Move both until right reaches end
        while right:
            left = left.next
            right = right.next
        
        # Remove the nth node
        left.next = left.next.next
        return dummy.next`,
        solutionExplanation: 'Use two pointers with n nodes gap. Move right pointer n steps ahead, then move both pointers until right reaches the end. Now left is just before the node to remove. Use a dummy node to handle edge case of removing the head.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'copy-list-random',
        title: 'Copy List with Random Pointer',
        difficulty: 'Medium',
        functionName: 'copyRandomList',
        description: 'A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list.',
        examples: [
            { input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]', explanation: 'Deep copy matches structure.' },
            { input: 'head = [[3,null],[3,0],[3,null]]', output: '[[3,null],[3,0],[3,null]]', explanation: 'Duplicates handled correctly.' }
        ],
        starterCode: `from typing import Optional
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        pass`,
        testCases: []
    },
    {
        id: 'add-two-numbers',
        title: 'Add Two Numbers',
        difficulty: 'Medium',
        functionName: 'addTwoNumbers',
        description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
        examples: [
            { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807.' },
            { input: 'l1 = [0], l2 = [0]', output: '[0]', explanation: '0 + 0 = 0.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        carry = 0
        
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            
            total = v1 + v2 + carry
            carry = total // 10
            curr.next = ListNode(total % 10)
            curr = curr.next
            
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        
        return dummy.next`,
        solutionExplanation: 'Simulate addition digit by digit. Add corresponding digits plus carry. The new digit is sum % 10, and carry is sum // 10. Continue until both lists are exhausted and no carry remains.',
        timeComplexity: 'O(max(m, n))',
        spaceComplexity: 'O(max(m, n))',
        testCases: []
    },
    {
        id: 'find-duplicate-number',
        title: 'Find the Duplicate Number',
        difficulty: 'Medium',
        functionName: 'findDuplicate',
        description: 'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive. There is only one repeated number in nums, return this repeated number. You must solve the problem without modifying the array nums and uses only constant extra space.',
        examples: [
            { input: 'nums = [1,3,4,2,2]', output: '2', explanation: '2 is the duplicate.' },
            { input: 'nums = [3,1,3,4,2]', output: '3', explanation: '3 is the duplicate.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # Floyd's cycle detection
        slow = fast = nums[0]
        
        # Find intersection point
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        
        # Find cycle start (duplicate)
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        
        return slow`,
        solutionExplanation: 'Treat the array as a linked list where nums[i] points to nums[nums[i]]. The duplicate creates a cycle. Use Floyd\'s algorithm: find intersection, then find cycle start by moving one pointer to start and advancing both at same speed until they meet.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,3,4,2,2]], expected: 2 }]
    },
    {
        id: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        functionName: 'LRUCache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        examples: [
            { input: 'LRUCache(2); put(1, 1); put(2, 2); get(1); put(3, 3); get(2);', output: '[null, null, null, 1, null, -1]', explanation: 'get(1) makes 1 recently used. put(3) evicts 2. get(2) returns -1.' },
            { input: 'LRUCache(1); put(2,1); get(2);', output: '[null, null, 1]', explanation: 'Standard single capacity.' }
        ],
        starterCode: `class LRUCache:
    def __init__(self, capacity: int):
        pass
    def get(self, key: int) -> int:
        pass
    def put(self, key: int, value: int) -> None:
        pass`,
        solution: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
        solutionExplanation: 'Use OrderedDict which maintains insertion order. On get/put, move the key to end (most recently used). On put, if over capacity, remove the first item (least recently used). This gives O(1) for both operations.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(capacity)',
        testCases: []
    },
    {
        id: 'merge-k-sorted',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        functionName: 'mergeKLists',
        description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        examples: [
            { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'All lists merged in ascending order.' },
            { input: 'lists = []', output: '[]', explanation: 'Empty input.' }
        ],
        starterCode: `from typing import List, Optional
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        pass`,
        solution: `from typing import List, Optional
import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        heap = []
        
        # Add first node from each list
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))
        
        while heap:
            val, i, node = heapq.heappop(heap)
            curr.next = node
            curr = curr.next
            
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        
        return dummy.next`,
        solutionExplanation: 'Use a min-heap to always get the smallest node among all list heads. Pop the smallest, add it to result, and push its next node to the heap. The index i is used as a tiebreaker when values are equal.',
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
        testCases: []
    },
    {
        id: 'reverse-nodes-k-group',
        title: 'Reverse Nodes in k-Group',
        difficulty: 'Hard',
        functionName: 'reverseKGroup',
        description: 'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.',
        examples: [
            { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]', explanation: 'Reverse 1-2, then 3-4. 5 is left as is.' },
            { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]', explanation: 'Reverse 1-2-3. 4-5 are fewer than k, so left as is.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_prev = dummy
        
        while True:
            kth = self.getKth(group_prev, k)
            if not kth:
                break
            group_next = kth.next
            
            # Reverse group
            prev, curr = kth.next, group_prev.next
            while curr != group_next:
                tmp = curr.next
                curr.next = prev
                prev = curr
                curr = tmp
            
            tmp = group_prev.next
            group_prev.next = kth
            group_prev = tmp
        
        return dummy.next
    
    def getKth(self, curr, k):
        while curr and k > 0:
            curr = curr.next
            k -= 1
        return curr`,
        solutionExplanation: 'For each group of k nodes: 1) Find the kth node. 2) Reverse the group in place. 3) Connect the reversed group to the previous part. 4) Move to the next group. If fewer than k nodes remain, leave them as is.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: []
    }
];

// --- 7. Trees ---
const TREES: Problem[] = [
    {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        functionName: 'invertTree',
        description: 'Given the root of a binary tree, invert the tree, and return its root.',
        examples: [
            { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Left and right children are swapped recursively.' },
            { input: 'root = [2,1,3]', output: '[2,3,1]', explanation: 'Simple 3-node swap.' }
        ],
        starterCode: `from typing import Optional
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        pass`,
        solution: `from typing import Optional

class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        
        # Swap children
        root.left, root.right = root.right, root.left
        
        # Recursively invert subtrees
        self.invertTree(root.left)
        self.invertTree(root.right)
        
        return root`,
        solutionExplanation: 'Recursively swap the left and right children of each node. Base case: if node is null, return null. For each node, swap its children, then recursively invert both subtrees.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'max-depth-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        functionName: 'maxDepth',
        description: 'Given the root of a binary tree, return its maximum depth.',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'Depth 3 via path 3->20->15.' },
            { input: 'root = [1,null,2]', output: '2', explanation: 'Path 1->2.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        pass`,
        solution: `from typing import Optional

class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
        solutionExplanation: 'Recursively compute the depth. Base case: null node has depth 0. For each node, the depth is 1 plus the maximum depth of its left and right subtrees.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'diameter-binary-tree',
        title: 'Diameter of Binary Tree',
        difficulty: 'Easy',
        functionName: 'diameterOfBinaryTree',
        description: 'Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.',
        examples: [
            { input: 'root = [1,2,3,4,5]', output: '3', explanation: 'Path 4->2->1->3 has length 3.' },
            { input: 'root = [1,2]', output: '1', explanation: 'Path 2->1 has length 1.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        pass`,
        solution: `from typing import Optional

class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        self.diameter = 0
        
        def height(node):
            if not node:
                return 0
            
            left_h = height(node.left)
            right_h = height(node.right)
            
            # Update diameter (path through this node)
            self.diameter = max(self.diameter, left_h + right_h)
            
            return 1 + max(left_h, right_h)
        
        height(root)
        return self.diameter`,
        solutionExplanation: 'The diameter through any node is left_height + right_height. We compute height recursively while tracking the maximum diameter seen. The longest path may not pass through the root.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'balanced-binary-tree',
        title: 'Balanced Binary Tree',
        difficulty: 'Easy',
        functionName: 'isBalanced',
        description: 'Given a binary tree, determine if it is height-balanced.',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: 'true', explanation: 'Heights of subtrees differ by at most 1.' },
            { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false', explanation: 'Left subtree is too deep.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        pass`,
        solution: `from typing import Optional

class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def check(node):
            if not node:
                return 0
            
            left = check(node.left)
            if left == -1:
                return -1
            
            right = check(node.right)
            if right == -1:
                return -1
            
            if abs(left - right) > 1:
                return -1
            
            return 1 + max(left, right)
        
        return check(root) != -1`,
        solutionExplanation: 'We compute height while checking balance. Return -1 if any subtree is unbalanced (early termination). A tree is balanced if the height difference between left and right subtrees is at most 1 for every node.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'same-tree',
        title: 'Same Tree',
        difficulty: 'Easy',
        functionName: 'isSameTree',
        description: 'Given the roots of two binary trees p and q, write a function to check if they are the same or not.',
        examples: [
            { input: 'p = [1,2,3], q = [1,2,3]', output: 'true', explanation: 'Structures and values are identical.' },
            { input: 'p = [1,2], q = [1,null,2]', output: 'false', explanation: 'Structure is different.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        pass`,
        solution: `from typing import Optional

class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True
        if not p or not q:
            return False
        if p.val != q.val:
            return False
        
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
        solutionExplanation: 'Recursively compare both trees. Base cases: both null = same, one null = different. If values match, recursively check both left and right subtrees must also be the same.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'subtree-another-tree',
        title: 'Subtree of Another Tree',
        difficulty: 'Easy',
        functionName: 'isSubtree',
        description: 'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.',
        examples: [
            { input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true', explanation: '4-1-2 exists in root.' },
            { input: 'root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]', output: 'false', explanation: 'The 2 in root has a child 0, so it doesn\'t match subRoot.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        pass`,
        solution: `from typing import Optional

class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        if not subRoot:
            return True
        if not root:
            return False
        
        if self.isSameTree(root, subRoot):
            return True
        
        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)
    
    def isSameTree(self, p, q):
        if not p and not q:
            return True
        if not p or not q or p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
        solutionExplanation: 'For each node in root, check if the subtree starting at that node is identical to subRoot. Use a helper function isSameTree to compare two trees. Recursively check left and right subtrees of root.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'lowest-common-ancestor-bst',
        title: 'Lowest Common Ancestor of a BST',
        difficulty: 'Medium',
        functionName: 'lowestCommonAncestor',
        description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.',
        examples: [
            { input: 'root = [6,2,8,0,4,7,9], p = 2, q = 8', output: '6', explanation: 'LCA of 2 and 8 is 6.' },
            { input: 'root = [6,2,8...], p = 2, q = 4', output: '2', explanation: 'LCA of 2 and 4 is 2 (ancestor can be the node itself).' }
        ],
        starterCode: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        pass`,
        solution: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        curr = root
        
        while curr:
            if p.val > curr.val and q.val > curr.val:
                curr = curr.right
            elif p.val < curr.val and q.val < curr.val:
                curr = curr.left
            else:
                return curr
        
        return None`,
        solutionExplanation: 'In a BST, if both p and q are greater than current node, LCA is in right subtree. If both are smaller, LCA is in left subtree. Otherwise, current node is the LCA (split point where p and q diverge).',
        timeComplexity: 'O(h)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'binary-tree-level-order',
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        functionName: 'levelOrder',
        description: 'Given the root of a binary tree, return the level order traversal of its nodes values. (i.e., from left to right, level by level).',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level 1: 3. Level 2: 9, 20. Level 3: 15, 7.' },
            { input: 'root = [1]', output: '[[1]]', explanation: 'Single node.' }
        ],
        starterCode: `from typing import List, Optional
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        pass`,
        solution: `from typing import List, Optional
from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        
        result = []
        queue = deque([root])
        
        while queue:
            level = []
            level_size = len(queue)
            
            for _ in range(level_size):
                node = queue.popleft()
                level.append(node.val)
                
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            
            result.append(level)
        
        return result`,
        solutionExplanation: 'Use BFS with a queue. Process nodes level by level: for each level, process all nodes currently in the queue (track level size), add their children to the queue for the next level.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: []
    },
    {
        id: 'binary-tree-right-side',
        title: 'Binary Tree Right Side View',
        difficulty: 'Medium',
        functionName: 'rightSideView',
        description: 'Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
        examples: [
            { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]', explanation: 'Rightmost nodes at each level.' },
            { input: 'root = [1,null,3]', output: '[1,3]', explanation: 'Simple right stick.' }
        ],
        starterCode: `from typing import List, Optional
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        pass`,
        solution: `from typing import List, Optional
from collections import deque

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        
        result = []
        queue = deque([root])
        
        while queue:
            level_size = len(queue)
            
            for i in range(level_size):
                node = queue.popleft()
                
                # Last node in level is rightmost
                if i == level_size - 1:
                    result.append(node.val)
                
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
        
        return result`,
        solutionExplanation: 'Use BFS level order traversal. For each level, only add the last node (rightmost) to the result. The last node processed in each level is the one visible from the right side.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: []
    },
    {
        id: 'count-good-nodes',
        title: 'Count Good Nodes in Binary Tree',
        difficulty: 'Medium',
        functionName: 'goodNodes',
        description: 'Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X.',
        examples: [
            { input: 'root = [3,1,4,3,null,1,5]', output: '4', explanation: 'Good nodes: 3 (root), 4, 3, 5.' },
            { input: 'root = [3,3,null,4,2]', output: '3', explanation: 'Root 3, Left 3, Left-Left 4 are good.' }
        ],
        starterCode: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        pass`,
        solution: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(node, max_val):
            if not node:
                return 0
            
            count = 1 if node.val >= max_val else 0
            max_val = max(max_val, node.val)
            
            count += dfs(node.left, max_val)
            count += dfs(node.right, max_val)
            
            return count
        
        return dfs(root, root.val)`,
        solutionExplanation: 'DFS while tracking the maximum value seen on the path from root. A node is good if its value >= max value seen so far. Update max and recursively count good nodes in subtrees.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'validate-bst',
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        functionName: 'isValidBST',
        description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
        examples: [
            { input: 'root = [2,1,3]', output: 'true', explanation: '1 < 2 < 3.' },
            { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: '4 has a left child 3 (valid), but 4 is the right child of 5, which is wrong.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        pass`,
        solution: `from typing import Optional

class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(node, min_val, max_val):
            if not node:
                return True
            
            if node.val <= min_val or node.val >= max_val:
                return False
            
            return (validate(node.left, min_val, node.val) and 
                    validate(node.right, node.val, max_val))
        
        return validate(root, float('-inf'), float('inf'))`,
        solutionExplanation: 'Each node must be within a valid range. For left child, max becomes parent value. For right child, min becomes parent value. Recursively validate with updated bounds.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'kth-smallest-bst',
        title: 'Kth Smallest Element in a BST',
        difficulty: 'Medium',
        functionName: 'kthSmallest',
        description: 'Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
        examples: [
            { input: 'root = [3,1,4,null,2], k = 1', output: '1', explanation: 'Sorted: 1, 2, 3, 4. 1st is 1.' },
            { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3', explanation: 'Sorted: 1, 2, 3, 4, 5, 6. 3rd is 3.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        pass`,
        solution: `from typing import Optional

class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        curr = root
        count = 0
        
        while stack or curr:
            while curr:
                stack.append(curr)
                curr = curr.left
            
            curr = stack.pop()
            count += 1
            
            if count == k:
                return curr.val
            
            curr = curr.right
        
        return -1`,
        solutionExplanation: 'Inorder traversal of BST gives sorted order. Use iterative inorder with a stack. Count nodes visited; when count equals k, we found the kth smallest.',
        timeComplexity: 'O(h + k)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'construct-binary-tree',
        title: 'Construct Binary Tree from Preorder and Inorder Traversal',
        difficulty: 'Medium',
        functionName: 'buildTree',
        description: 'Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.',
        examples: [
            { input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]', explanation: 'Reconstructs the standard tree.' },
            { input: 'preorder = [-1], inorder = [-1]', output: '[-1]', explanation: 'Single node.' }
        ],
        starterCode: `from typing import List, Optional
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        pass`,
        solution: `from typing import List, Optional

class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder or not inorder:
            return None
        
        # First element of preorder is root
        root = TreeNode(preorder[0])
        mid = inorder.index(preorder[0])
        
        # Elements before mid in inorder are left subtree
        root.left = self.buildTree(preorder[1:mid+1], inorder[:mid])
        # Elements after mid in inorder are right subtree
        root.right = self.buildTree(preorder[mid+1:], inorder[mid+1:])
        
        return root`,
        solutionExplanation: 'Preorder first element is always the root. Find root in inorder to split left/right subtrees. Elements before root in inorder are left subtree, after are right. Recursively build subtrees.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: []
    },
    {
        id: 'binary-tree-max-path',
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        functionName: 'maxPathSum',
        description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.',
        examples: [
            { input: 'root = [1,2,3]', output: '6', explanation: '2 + 1 + 3 = 6.' },
            { input: 'root = [-10,9,20,15,7]', output: '42', explanation: '15 + 20 + 7 = 42.' }
        ],
        starterCode: `from typing import Optional
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        pass`,
        solution: `from typing import Optional

class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float('-inf')
        
        def max_gain(node):
            if not node:
                return 0
            
            # Max sum from left/right subtrees (ignore negative)
            left_gain = max(max_gain(node.left), 0)
            right_gain = max(max_gain(node.right), 0)
            
            # Path through current node
            path_sum = node.val + left_gain + right_gain
            self.max_sum = max(self.max_sum, path_sum)
            
            # Return max gain if continuing path upward
            return node.val + max(left_gain, right_gain)
        
        max_gain(root)
        return self.max_sum`,
        solutionExplanation: 'For each node, calculate max path sum passing through it (left + node + right). Track global maximum. When returning to parent, can only use one branch (path cannot split). Ignore negative gains.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        testCases: []
    },
    {
        id: 'serialize-deserialize-bst',
        title: 'Serialize and Deserialize Binary Tree',
        difficulty: 'Hard',
        functionName: 'Codec',
        description: 'Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.',
        examples: [
            { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explanation: 'Round trip works correctly.' },
            { input: 'root = []', output: '[]', explanation: 'Handles empty tree.' }
        ],
        starterCode: `class Codec:
    def serialize(self, root):
        pass
    def deserialize(self, data):
        pass`,
        solution: `class Codec:
    def serialize(self, root):
        result = []
        
        def dfs(node):
            if not node:
                result.append("N")
                return
            result.append(str(node.val))
            dfs(node.left)
            dfs(node.right)
        
        dfs(root)
        return ",".join(result)
    
    def deserialize(self, data):
        vals = data.split(",")
        self.i = 0
        
        def dfs():
            if vals[self.i] == "N":
                self.i += 1
                return None
            
            node = TreeNode(int(vals[self.i]))
            self.i += 1
            node.left = dfs()
            node.right = dfs()
            return node
        
        return dfs()`,
        solutionExplanation: 'Use preorder traversal for serialization. Mark null nodes with "N". For deserialization, use the same preorder approach with an index pointer. Preorder uniquely identifies tree structure when nulls are included.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: []
    }
];

// --- 8. Heap / Priority Queue ---
const HEAP: Problem[] = [
    {
        id: 'kth-largest-stream',
        title: 'Kth Largest Element in a Stream',
        difficulty: 'Easy',
        functionName: 'KthLargest',
        description: 'Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.',
        examples: [
            { input: '["KthLargest", "add", "add"], [[3, [4, 5, 8, 2]], [3], [5]]', output: '[null, 4, 5]', explanation: 'Init with [2,4,5,8], k=3. 3rd largest is 4. Add 3 -> [2,3,4,5,8], 3rd largest is 4. Add 5 -> [2,3,4,5,5,8], 3rd largest is 5.' },
            { input: '["KthLargest", "add"], [[1, []], [-3]]', output: '[null, -3]', explanation: 'Single element.' }
        ],
        starterCode: `from typing import List
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        pass
    def add(self, val: int) -> int:
        pass`,
        solution: `import heapq
from typing import List

class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.min_heap = []
        for num in nums:
            self.add(num)
    
    def add(self, val: int) -> int:
        heapq.heappush(self.min_heap, val)
        if len(self.min_heap) > self.k:
            heapq.heappop(self.min_heap)
        return self.min_heap[0]`,
        solutionExplanation: 'Maintain a min-heap of size k. The root of the heap is always the kth largest element. When adding, push to heap and pop if size exceeds k.',
        timeComplexity: 'O(log k) per add',
        spaceComplexity: 'O(k)',
        testCases: []
    },
    {
        id: 'last-stone-weight',
        title: 'Last Stone Weight',
        difficulty: 'Easy',
        functionName: 'lastStoneWeight',
        description: 'You are given an array of integers stones where stones[i] is the weight of the ith stone. We play a game with the stones. On each turn, we choose the heaviest two stones and smash them together. Return the weight of the last remaining stone. If there is no stones left, return 0.',
        examples: [
            { input: 'stones = [2,7,4,1,8,1]', output: '1', explanation: '8 and 7 collide -> 1. 4 and 2 collide -> 2. 2 and 1 collide -> 1. 1 and 1 collide -> 0. Last is 1.' },
            { input: 'stones = [1]', output: '1', explanation: 'No collision.' }
        ],
        starterCode: `from typing import List
class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        pass`,
        solution: `import heapq
from typing import List

class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        # Convert to max heap by negating values
        max_heap = [-s for s in stones]
        heapq.heapify(max_heap)
        
        while len(max_heap) > 1:
            first = -heapq.heappop(max_heap)
            second = -heapq.heappop(max_heap)
            if first != second:
                heapq.heappush(max_heap, -(first - second))
        
        return -max_heap[0] if max_heap else 0`,
        solutionExplanation: 'Use a max-heap (simulated with negated values in Python). Repeatedly pop two largest stones, smash them, and push the difference back if non-zero.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[2,7,4,1,8,1]], expected: 1 }]
    },
    {
        id: 'k-closest-points',
        title: 'K Closest Points to Origin',
        difficulty: 'Medium',
        functionName: 'kClosest',
        description: 'Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).',
        examples: [
            { input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]', explanation: 'Distances are sqrt(10) and sqrt(8). [-2,2] is closer.' },
            { input: 'points = [[3,3],[5,-1],[-2,4]], k = 2', output: '[[3,3],[-2,4]]', explanation: 'Closest 2 points.' }
        ],
        starterCode: `from typing import List
class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        pass`,
        solution: `import heapq
from typing import List

class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        # Use max heap of size k (negate distance for max behavior)
        max_heap = []
        
        for x, y in points:
            dist = -(x * x + y * y)  # Negative for max heap
            if len(max_heap) < k:
                heapq.heappush(max_heap, (dist, x, y))
            elif dist > max_heap[0][0]:
                heapq.heapreplace(max_heap, (dist, x, y))
        
        return [[x, y] for (_, x, y) in max_heap]`,
        solutionExplanation: 'Use a max-heap of size k. For each point, if heap has less than k elements, add it. Otherwise, if current point is closer than the farthest in heap, replace it.',
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
        testCases: [{ input: [[[1,3],[-2,2]], 1], expected: [[-2,2]] }]
    },
    {
        id: 'kth-largest-array',
        title: 'Kth Largest Element in an Array',
        difficulty: 'Medium',
        functionName: 'findKthLargest',
        description: 'Given an integer array nums and an integer k, return the kth largest element in the array.',
        examples: [
            { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'Sorted: 1,2,3,4,5,6. 2nd largest is 5.' },
            { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', explanation: 'Sorted: 1,2,2,3,3,4,5,5,6. 4th largest is 4.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        pass`,
        solution: `import heapq
from typing import List

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # Min heap of size k
        min_heap = []
        
        for num in nums:
            heapq.heappush(min_heap, num)
            if len(min_heap) > k:
                heapq.heappop(min_heap)
        
        return min_heap[0]`,
        solutionExplanation: 'Maintain a min-heap of size k. After processing all elements, the root contains the kth largest element. Alternative: use QuickSelect for O(n) average.',
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
        testCases: [{ input: [[3,2,1,5,6,4], 2], expected: 5 }]
    },
    {
        id: 'task-scheduler',
        title: 'Task Scheduler',
        difficulty: 'Medium',
        functionName: 'leastInterval',
        description: 'Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle. However, there is a non-negative integer n that represents the cooldown period between two same tasks.',
        examples: [
            { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'A -> B -> idle -> A -> B -> idle -> A -> B.' },
            { input: 'tasks = ["A","A","A","B","B","B"], n = 0', output: '6', explanation: 'No idle time needed.' }
        ],
        starterCode: `from typing import List
class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        pass`,
        solution: `import heapq
from collections import Counter, deque
from typing import List

class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        max_heap = [-cnt for cnt in count.values()]
        heapq.heapify(max_heap)
        
        time = 0
        queue = deque()  # (count, available_time)
        
        while max_heap or queue:
            time += 1
            
            if max_heap:
                cnt = 1 + heapq.heappop(max_heap)  # Decrement (add 1 since negated)
                if cnt:
                    queue.append((cnt, time + n))
            
            if queue and queue[0][1] == time:
                heapq.heappush(max_heap, queue.popleft()[0])
        
        return time`,
        solutionExplanation: 'Use max-heap to always pick the most frequent task. Use a queue to track tasks in cooldown. Process one task per time unit, adding idle time when no task is available.',
        timeComplexity: 'O(n * m) where m is cooldown',
        spaceComplexity: 'O(1) - at most 26 tasks',
        testCases: [{ input: [["A","A","A","B","B","B"], 2], expected: 8 }]
    },
    {
        id: 'design-twitter',
        title: 'Design Twitter',
        difficulty: 'Medium',
        functionName: 'Twitter',
        description: 'Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the 10 most recent tweets in the user\'s news feed.',
        examples: [
            { input: 'Twitter() ...', output: '...', explanation: 'Follows feed logic.' },
            { input: 'postTweet(1, 5)', output: 'null', explanation: 'User 1 posts tweet 5.' }
        ],
        starterCode: `class Twitter:
    def __init__(self):
        pass
    def postTweet(self, userId: int, tweetId: int) -> None:
        pass
    def getNewsFeed(self, userId: int) -> List[int]:
        pass
    def follow(self, followerId: int, followeeId: int) -> None:
        pass
    def unfollow(self, followerId: int, followeeId: int) -> None:
        pass`,
        solution: `import heapq
from collections import defaultdict
from typing import List

class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)  # userId -> [(time, tweetId)]
        self.following = defaultdict(set)  # userId -> set of followeeIds
    
    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.time, tweetId))
        self.time -= 1  # Decrement for max heap behavior
    
    def getNewsFeed(self, userId: int) -> List[int]:
        feed = []
        max_heap = []
        
        self.following[userId].add(userId)  # Include own tweets
        
        for followeeId in self.following[userId]:
            if self.tweets[followeeId]:
                idx = len(self.tweets[followeeId]) - 1
                time, tweetId = self.tweets[followeeId][idx]
                heapq.heappush(max_heap, (time, tweetId, followeeId, idx - 1))
        
        while max_heap and len(feed) < 10:
            time, tweetId, followeeId, idx = heapq.heappop(max_heap)
            feed.append(tweetId)
            if idx >= 0:
                time, tweetId = self.tweets[followeeId][idx]
                heapq.heappush(max_heap, (time, tweetId, followeeId, idx - 1))
        
        return feed
    
    def follow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].add(followeeId)
    
    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
        solutionExplanation: 'Store tweets with timestamps. For news feed, use a max-heap to merge k sorted lists (tweets from each followee). Pop 10 most recent tweets.',
        timeComplexity: 'O(k log k) for getNewsFeed where k is followees',
        spaceComplexity: 'O(n) for storing tweets and follows',
        testCases: []
    },
    {
        id: 'find-median-stream',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        functionName: 'MedianFinder',
        description: 'The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values. Design a data structure that supports adding numbers and finding the median.',
        examples: [
            { input: 'MedianFinder(); addNum(1); addNum(2); findMedian();', output: '1.5', explanation: '[1, 2] median is 1.5.' },
            { input: 'addNum(3); findMedian();', output: '2.0', explanation: '[1, 2, 3] median is 2.' }
        ],
        starterCode: `class MedianFinder:
    def __init__(self):
        pass
    def addNum(self, num: int) -> None:
        pass
    def findMedian(self) -> float:
        pass`,
        solution: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # Max heap (negated) for smaller half
        self.large = []  # Min heap for larger half
    
    def addNum(self, num: int) -> None:
        # Add to max heap (small)
        heapq.heappush(self.small, -num)
        
        # Ensure small's max <= large's min
        if self.small and self.large and -self.small[0] > self.large[0]:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        
        # Balance sizes (small can have at most 1 more)
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)
    
    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2`,
        solutionExplanation: 'Use two heaps: max-heap for smaller half, min-heap for larger half. Keep them balanced (size difference <= 1). Median is either max of small heap or average of both tops.',
        timeComplexity: 'O(log n) per addNum',
        spaceComplexity: 'O(n)',
        testCases: []
    }
];

// --- 9. Backtracking ---
const BACKTRACKING: Problem[] = [
    {
        id: 'subsets',
        title: 'Subsets',
        difficulty: 'Medium',
        functionName: 'subsets',
        description: 'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
        examples: [
            { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', explanation: '2^3 = 8 subsets.' },
            { input: 'nums = [0]', output: '[[],[0]]', explanation: 'Empty and single element.' }
        ],
        starterCode: `from typing import List
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result = []
        subset = []
        
        def backtrack(i):
            if i >= len(nums):
                result.append(subset.copy())
                return
            
            # Include nums[i]
            subset.append(nums[i])
            backtrack(i + 1)
            
            # Exclude nums[i]
            subset.pop()
            backtrack(i + 1)
        
        backtrack(0)
        return result`,
        solutionExplanation: 'For each element, we have two choices: include it or exclude it. Use backtracking to explore both branches. When we reach the end, add the current subset to results.',
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[1,2,3]], expected: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]] }]
    },
    {
        id: 'combination-sum',
        title: 'Combination Sum',
        difficulty: 'Medium',
        functionName: 'combinationSum',
        description: 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.',
        examples: [
            { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]', explanation: '2+2+3=7, 7=7.' },
            { input: 'candidates = [2], target = 1', output: '[]', explanation: 'Impossible.' }
        ],
        starterCode: `from typing import List
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result = []
        
        def backtrack(i, current, total):
            if total == target:
                result.append(current.copy())
                return
            if i >= len(candidates) or total > target:
                return
            
            # Include candidates[i] (can reuse)
            current.append(candidates[i])
            backtrack(i, current, total + candidates[i])
            
            # Exclude candidates[i]
            current.pop()
            backtrack(i + 1, current, total)
        
        backtrack(0, [], 0)
        return result`,
        solutionExplanation: 'Use backtracking with two choices at each step: include current candidate (staying at same index since we can reuse) or move to next candidate. Stop when sum equals target or exceeds it.',
        timeComplexity: 'O(2^(target/min))',
        spaceComplexity: 'O(target/min)',
        testCases: [{ input: [[2,3,6,7], 7], expected: [[2,2,3],[7]] }]
    },
    {
        id: 'combination-sum-ii',
        title: 'Combination Sum II',
        difficulty: 'Medium',
        functionName: 'combinationSum2',
        description: 'Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination.',
        examples: [
            { input: 'candidates = [10,1,2,7,6,1,5], target = 8', output: '[[1,1,6],[1,2,5],[1,7],[2,6]]', explanation: 'Note duplicates in input but unique sets.' },
            { input: 'candidates = [2,5,2,1,2], target = 5', output: '[[1,2,2],[5]]', explanation: '1+2+2=5, 5=5.' }
        ],
        starterCode: `from typing import List
class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        result = []
        
        def backtrack(i, current, total):
            if total == target:
                result.append(current.copy())
                return
            if total > target:
                return
            
            for j in range(i, len(candidates)):
                # Skip duplicates at same level
                if j > i and candidates[j] == candidates[j - 1]:
                    continue
                
                current.append(candidates[j])
                backtrack(j + 1, current, total + candidates[j])
                current.pop()
        
        backtrack(0, [], 0)
        return result`,
        solutionExplanation: 'Sort first to handle duplicates. Use backtracking but skip duplicate values at the same recursion level to avoid duplicate combinations. Move to next index after using an element.',
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[10,1,2,7,6,1,5], 8], expected: [[1,1,6],[1,2,5],[1,7],[2,6]] }]
    },
    {
        id: 'permutations',
        title: 'Permutations',
        difficulty: 'Medium',
        functionName: 'permute',
        description: 'Given an array nums of distinct integers, return all the possible permutations.',
        examples: [
            { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]', explanation: '6 permutations.' },
            { input: 'nums = [0,1]', output: '[[0,1],[1,0]]', explanation: '2 permutations.' }
        ],
        starterCode: `from typing import List
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        result = []
        
        def backtrack(current, remaining):
            if not remaining:
                result.append(current.copy())
                return
            
            for i in range(len(remaining)):
                current.append(remaining[i])
                backtrack(current, remaining[:i] + remaining[i+1:])
                current.pop()
        
        backtrack([], nums)
        return result`,
        solutionExplanation: 'For each position, try placing each remaining element. Use backtracking to explore all orderings. When no elements remain, we have a complete permutation.',
        timeComplexity: 'O(n! * n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[1,2,3]], expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] }]
    },
    {
        id: 'subsets-ii',
        title: 'Subsets II',
        difficulty: 'Medium',
        functionName: 'subsetsWithDup',
        description: 'Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
        examples: [
            { input: 'nums = [1,2,2]', output: '[[],[1],[1,2],[1,2,2],[2],[2,2]]', explanation: 'Duplicates handled.' },
            { input: 'nums = [0]', output: '[[],[0]]', explanation: 'Single.' }
        ],
        starterCode: `from typing import List
class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        
        def backtrack(i, subset):
            result.append(subset.copy())
            
            for j in range(i, len(nums)):
                # Skip duplicates at same level
                if j > i and nums[j] == nums[j - 1]:
                    continue
                
                subset.append(nums[j])
                backtrack(j + 1, subset)
                subset.pop()
        
        backtrack(0, [])
        return result`,
        solutionExplanation: 'Sort array first. Use backtracking but skip duplicate values at the same recursion level. This ensures we don\'t generate duplicate subsets.',
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[1,2,2]], expected: [[],[1],[1,2],[1,2,2],[2],[2,2]] }]
    },
    {
        id: 'word-search',
        title: 'Word Search',
        difficulty: 'Medium',
        functionName: 'exist',
        description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
        examples: [
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: 'Follow path A->B->C->C->E->D.' },
            { input: 'board = ... word = "ABCB"', output: 'false', explanation: 'Cannot reuse cell.' }
        ],
        starterCode: `from typing import List
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        pass`,
        solution: `from typing import List

class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        path = set()
        
        def dfs(r, c, i):
            if i == len(word):
                return True
            if (r < 0 or r >= rows or c < 0 or c >= cols or
                (r, c) in path or board[r][c] != word[i]):
                return False
            
            path.add((r, c))
            result = (dfs(r + 1, c, i + 1) or
                      dfs(r - 1, c, i + 1) or
                      dfs(r, c + 1, i + 1) or
                      dfs(r, c - 1, i + 1))
            path.remove((r, c))
            return result
        
        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False`,
        solutionExplanation: 'Use DFS with backtracking. Track visited cells in current path. For each cell matching current character, explore all 4 directions. Backtrack by removing cell from path after exploring.',
        timeComplexity: 'O(m * n * 4^L) where L is word length',
        spaceComplexity: 'O(L)',
        testCases: [{ input: [[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED"], expected: true }]
    },
    {
        id: 'palindrome-partitioning',
        title: 'Palindrome Partitioning',
        difficulty: 'Medium',
        functionName: 'partition',
        description: 'Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.',
        examples: [
            { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]', explanation: '"a", "a", "b" are palindromes. "aa", "b" are palindromes.' },
            { input: 's = "a"', output: '[["a"]]', explanation: 'Trivial.' }
        ],
        starterCode: `from typing import List
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        pass`,
        solution: `from typing import List

class Solution:
    def partition(self, s: str) -> List[List[str]]:
        result = []
        
        def is_palindrome(sub):
            return sub == sub[::-1]
        
        def backtrack(i, current):
            if i >= len(s):
                result.append(current.copy())
                return
            
            for j in range(i, len(s)):
                if is_palindrome(s[i:j+1]):
                    current.append(s[i:j+1])
                    backtrack(j + 1, current)
                    current.pop()
        
        backtrack(0, [])
        return result`,
        solutionExplanation: 'Use backtracking to try all possible partitions. At each position, try all substrings starting from that position. Only continue if the substring is a palindrome.',
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: ["aab"], expected: [["a","a","b"],["aa","b"]] }]
    },
    {
        id: 'letter-combinations',
        title: 'Letter Combinations of a Phone Number',
        difficulty: 'Medium',
        functionName: 'letterCombinations',
        description: 'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.',
        examples: [
            { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]', explanation: '2=abc, 3=def.' },
            { input: 'digits = ""', output: '[]', explanation: 'Empty.' }
        ],
        starterCode: `from typing import List
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        pass`,
        solution: `from typing import List

class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        
        phone = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
        }
        result = []
        
        def backtrack(i, current):
            if i == len(digits):
                result.append(current)
                return
            
            for char in phone[digits[i]]:
                backtrack(i + 1, current + char)
        
        backtrack(0, '')
        return result`,
        solutionExplanation: 'Map each digit to its letters. Use backtracking to build combinations by trying each letter for the current digit, then recursing to the next digit.',
        timeComplexity: 'O(4^n * n) where n is digits length',
        spaceComplexity: 'O(n)',
        testCases: [{ input: ["23"], expected: ["ad","ae","af","bd","be","bf","cd","ce","cf"] }]
    },
    {
        id: 'n-queens',
        title: 'N-Queens',
        difficulty: 'Hard',
        functionName: 'solveNQueens',
        description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.',
        examples: [
            { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', explanation: 'Two distinct solutions for 4 queens.' },
            { input: 'n = 1', output: '[["Q"]]', explanation: 'Trivial.' }
        ],
        starterCode: `from typing import List
class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        pass`,
        solution: `from typing import List

class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        cols = set()
        pos_diag = set()  # r + c
        neg_diag = set()  # r - c
        result = []
        board = [['.'] * n for _ in range(n)]
        
        def backtrack(r):
            if r == n:
                result.append([''.join(row) for row in board])
                return
            
            for c in range(n):
                if c in cols or (r + c) in pos_diag or (r - c) in neg_diag:
                    continue
                
                cols.add(c)
                pos_diag.add(r + c)
                neg_diag.add(r - c)
                board[r][c] = 'Q'
                
                backtrack(r + 1)
                
                cols.remove(c)
                pos_diag.remove(r + c)
                neg_diag.remove(r - c)
                board[r][c] = '.'
        
        backtrack(0)
        return result`,
        solutionExplanation: 'Place queens row by row. Track attacked columns and diagonals using sets. For diagonals, cells on same positive diagonal have same r+c, same negative diagonal have same r-c.',
        timeComplexity: 'O(n!)',
        spaceComplexity: 'O(n^2)',
        testCases: [{ input: [4], expected: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]] }]
    }
];

// --- 10. Tries ---
const TRIES: Problem[] = [
    {
        id: 'implement-trie',
        title: 'Implement Trie (Prefix Tree)',
        difficulty: 'Medium',
        functionName: 'Trie',
        description: 'A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class.',
        examples: [
            { input: 'Trie(); insert("apple"); search("apple");', output: 'true', explanation: 'Apple was inserted.' },
            { input: 'search("app");', output: 'false', explanation: 'App is a prefix, not a full word.' }
        ],
        starterCode: `class Trie:
    def __init__(self):
        pass
    def insert(self, word: str) -> None:
        pass
    def search(self, word: str) -> bool:
        pass
    def startsWith(self, prefix: str) -> bool:
        pass`,
        solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def search(self, word: str) -> bool:
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end
    
    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True`,
        solutionExplanation: 'Each TrieNode has a dictionary of children and an end-of-word flag. Insert traverses/creates nodes for each character. Search checks if path exists and ends at a word. StartsWith only checks if path exists.',
        timeComplexity: 'O(m) for all operations where m is word length',
        spaceComplexity: 'O(n * m) where n is number of words',
        testCases: []
    },
    {
        id: 'design-add-search-words',
        title: 'Design Add and Search Words Data Structure',
        difficulty: 'Medium',
        functionName: 'WordDictionary',
        description: 'Design a data structure that supports adding new words and finding if a string matches any previously added string.',
        examples: [
            { input: 'WordDictionary(); addWord("bad"); search("pad");', output: 'false', explanation: 'Pad not found.' },
            { input: 'search(".ad");', output: 'true', explanation: '. matches b.' }
        ],
        starterCode: `class WordDictionary:
    def __init__(self):
        pass
    def addWord(self, word: str) -> None:
        pass
    def search(self, word: str) -> bool:
        pass`,
        solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()
    
    def addWord(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def search(self, word: str) -> bool:
        def dfs(i, node):
            for j in range(i, len(word)):
                char = word[j]
                if char == '.':
                    # Try all children
                    for child in node.children.values():
                        if dfs(j + 1, child):
                            return True
                    return False
                else:
                    if char not in node.children:
                        return False
                    node = node.children[char]
            return node.is_end
        
        return dfs(0, self.root)`,
        solutionExplanation: 'Use a Trie for storage. For search, handle "." wildcard by trying all children at that position using DFS. Regular characters follow normal Trie traversal.',
        timeComplexity: 'O(m) for addWord, O(26^m) worst case for search with wildcards',
        spaceComplexity: 'O(n * m)',
        testCases: []
    },
    {
        id: 'word-search-ii',
        title: 'Word Search II',
        difficulty: 'Hard',
        functionName: 'findWords',
        description: 'Given an m x n board of characters and a list of strings words, return all words on the board.',
        examples: [
            { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]', explanation: 'Both words can be formed by paths.' },
            { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]', explanation: 'Cannot reuse cells.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        pass`,
        solution: `from typing import List

class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        # Build Trie
        root = TrieNode()
        for word in words:
            node = root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.word = word
        
        rows, cols = len(board), len(board[0])
        result = []
        
        def dfs(r, c, node):
            char = board[r][c]
            if char not in node.children:
                return
            
            next_node = node.children[char]
            if next_node.word:
                result.append(next_node.word)
                next_node.word = None  # Avoid duplicates
            
            board[r][c] = '#'  # Mark visited
            
            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                    dfs(nr, nc, next_node)
            
            board[r][c] = char  # Restore
        
        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)
        
        return result`,
        solutionExplanation: 'Build a Trie from all words. DFS from each cell, following Trie paths. When we reach a word end in Trie, add to results. Mark cells visited during DFS to avoid reuse. Much faster than searching each word separately.',
        timeComplexity: 'O(m * n * 4^L) where L is max word length',
        spaceComplexity: 'O(sum of word lengths)',
        testCases: [{ input: [[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], ["oath","pea","eat","rain"]], expected: ["eat","oath"] }]
    }
];

// --- 11. Graph ---
const GRAPH: Problem[] = [
    {
        id: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        functionName: 'numIslands',
        description: 'Given an m x n 2D binary grid grid which represents a map of "1"s (land) and "0"s (water), return the number of islands.',
        examples: [
            { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2', explanation: 'Top left island and bottom right island.' },
            { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1', explanation: 'All connected.' }
        ],
        starterCode: `from typing import List
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        if not grid:
            return 0
        
        rows, cols = len(grid), len(grid[0])
        count = 0
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0':
                return
            grid[r][c] = '0'  # Mark visited
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        
        return count`,
        solutionExplanation: 'Iterate through grid. When we find a "1", increment island count and use DFS to mark all connected land cells as visited (change to "0"). Each DFS call explores one complete island.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: [[["1","1","0"],["1","1","0"],["0","0","1"]]], expected: 2 }]
    },
    {
        id: 'clone-graph',
        title: 'Clone Graph',
        difficulty: 'Medium',
        functionName: 'cloneGraph',
        description: 'Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.',
        examples: [
            { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'Standard graph clone.' },
            { input: 'adjList = [[]]', output: '[[]]', explanation: 'Single node.' }
        ],
        starterCode: `class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        pass`,
        solution: `class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        if not node:
            return None
        
        old_to_new = {}
        
        def dfs(node):
            if node in old_to_new:
                return old_to_new[node]
            
            copy = Node(node.val)
            old_to_new[node] = copy
            
            for neighbor in node.neighbors:
                copy.neighbors.append(dfs(neighbor))
            
            return copy
        
        return dfs(node)`,
        solutionExplanation: 'Use DFS with a hash map to track cloned nodes. For each node, create a copy and recursively clone neighbors. The hash map prevents infinite loops and ensures each node is cloned exactly once.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        testCases: []
    },
    {
        id: 'max-area-island',
        title: 'Max Area of Island',
        difficulty: 'Medium',
        functionName: 'maxAreaOfIsland',
        description: 'You are given an m x n binary matrix grid. An island is a group of 1s (representing land) connected 4-directionally (horizontal or vertical). The area of an island is the number of cells with a value 1 in the island. Return the maximum area of an island in grid. If there is no island, return 0.',
        examples: [
            { input: 'grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0]...]', output: '6', explanation: 'Largest group of 1s has size 6.' },
            { input: 'grid = [[0,0,0,0,0,0,0,0]]', output: '0', explanation: 'No land.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        max_area = 0
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
                return 0
            grid[r][c] = 0  # Mark visited
            return 1 + dfs(r+1, c) + dfs(r-1, c) + dfs(r, c+1) + dfs(r, c-1)
        
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    max_area = max(max_area, dfs(r, c))
        
        return max_area`,
        solutionExplanation: 'Similar to Number of Islands, but DFS returns the count of cells in each island. Track the maximum area found across all islands.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: [[[0,0,0,0,0,0,0,0]]], expected: 0 }]
    },
    {
        id: 'walls-and-gates',
        title: 'Walls and Gates',
        difficulty: 'Medium',
        functionName: 'wallsAndGates',
        description: 'You are given an m x n grid rooms initialized with these three possible values. -1 A wall or an obstacle. 0 A gate. INF Infinity means an empty room. Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, it should be filled with INF.',
        examples: [
            { input: 'rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]', output: '[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]', explanation: 'Distances calculated via BFS.' },
            { input: 'rooms = [[-1]]', output: '[[-1]]', explanation: 'Just a wall.' }
        ],
        starterCode: `from typing import List
class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        pass`,
        solution: `from typing import List
from collections import deque

class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        if not rooms:
            return
        
        rows, cols = len(rooms), len(rooms[0])
        INF = 2147483647
        queue = deque()
        
        # Add all gates to queue
        for r in range(rows):
            for c in range(cols):
                if rooms[r][c] == 0:
                    queue.append((r, c))
        
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while queue:
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:
                    rooms[nr][nc] = rooms[r][c] + 1
                    queue.append((nr, nc))`,
        solutionExplanation: 'Multi-source BFS starting from all gates simultaneously. Each BFS level increases distance by 1. Only update cells with INF (empty rooms). This finds shortest distance to nearest gate for all rooms.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: []
    },
    {
        id: 'rotting-oranges',
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        functionName: 'orangesRotting',
        description: 'You are given an m x n grid where each cell has the following values: 0 empty cell, 1 fresh orange, 2 rotten orange. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.',
        examples: [
            { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4', explanation: 'Minute 0: Top-left rotten. Minute 4: All connected fresh oranges rot.' },
            { input: 'grid = [[0,2]]', output: '0', explanation: 'No fresh oranges to rot.' }
        ],
        starterCode: `from typing import List
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
from collections import deque

class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0
        
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        
        if fresh == 0:
            return 0
        
        minutes = 0
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while queue:
            minutes += 1
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))
        
        return minutes - 1 if fresh == 0 else -1`,
        solutionExplanation: 'Multi-source BFS starting from all rotten oranges simultaneously. Each BFS level represents one minute. Track fresh orange count; if any remain after BFS, return -1.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: [[[2,1,1],[1,1,0],[0,1,1]]], expected: 4 }]
    },
    {
        id: 'pacific-atlantic',
        title: 'Pacific Atlantic Water Flow',
        difficulty: 'Medium',
        functionName: 'pacificAtlantic',
        description: 'There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The top and left edges of the island border the Pacific Ocean, and the bottom and right edges border the Atlantic Ocean. Rain water can flow to neighboring cells directly north, south, east, and west if the neighboring cell\'s height is less than or equal to the current cell\'s height. Water can flow from any cell adjacent to an ocean into the ocean. Return a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from cell (ri, ci) to both the Pacific and Atlantic oceans.',
        examples: [
            { input: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]', explanation: 'Cells that can reach both oceans.' },
            { input: 'heights = [[1]]', output: '[[0,0]]', explanation: 'Can reach both.' }
        ],
        starterCode: `from typing import List
class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        pass`,
        solution: `from typing import List

class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pacific = set()
        atlantic = set()
        
        def dfs(r, c, visited, prev_height):
            if (r, c) in visited or r < 0 or r >= rows or c < 0 or c >= cols:
                return
            if heights[r][c] < prev_height:
                return
            visited.add((r, c))
            dfs(r + 1, c, visited, heights[r][c])
            dfs(r - 1, c, visited, heights[r][c])
            dfs(r, c + 1, visited, heights[r][c])
            dfs(r, c - 1, visited, heights[r][c])
        
        for c in range(cols):
            dfs(0, c, pacific, heights[0][c])
            dfs(rows - 1, c, atlantic, heights[rows-1][c])
        
        for r in range(rows):
            dfs(r, 0, pacific, heights[r][0])
            dfs(r, cols - 1, atlantic, heights[r][cols-1])
        
        return list(pacific & atlantic)`,
        solutionExplanation: 'Reverse the problem: start from ocean borders and DFS uphill (to cells with >= height). Find cells reachable from Pacific and Atlantic separately. Return intersection of both sets.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: [[[1]]], expected: [[0,0]] }]
    },
    {
        id: 'surrounded-regions',
        title: 'Surrounded Regions',
        difficulty: 'Medium',
        functionName: 'solve',
        description: 'Given an m x n matrix board containing \'X\' and \'O\', capture all regions that are 4-directionally surrounded by \'X\'. A region is captured by flipping all \'O\'s into \'X\'s in that surrounded region.',
        examples: [
            { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', explanation: 'Center Os are surrounded. Bottom O is connected to edge.' },
            { input: 'board = [["X"]]', output: '[["X"]]', explanation: 'No Os.' }
        ],
        starterCode: `from typing import List
class Solution:
    def solve(self, board: List[List[str]]) -> None:
        pass`,
        solution: `from typing import List

class Solution:
    def solve(self, board: List[List[str]]) -> None:
        if not board:
            return
        
        rows, cols = len(board), len(board[0])
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != 'O':
                return
            board[r][c] = 'T'  # Temporarily mark as safe
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        
        # Mark all O's connected to border as safe
        for r in range(rows):
            dfs(r, 0)
            dfs(r, cols - 1)
        for c in range(cols):
            dfs(0, c)
            dfs(rows - 1, c)
        
        # Capture surrounded regions and restore safe ones
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == 'O':
                    board[r][c] = 'X'
                elif board[r][c] == 'T':
                    board[r][c] = 'O'`,
        solutionExplanation: 'Reverse thinking: instead of finding surrounded regions, find unsurrounded ones (connected to border). DFS from all border O\'s and mark them as safe (T). Then flip remaining O\'s to X and restore T\'s to O.',
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: [[["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]], expected: [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]] }]
    },
    {
        id: 'course-schedule',
        title: 'Course Schedule',
        difficulty: 'Medium',
        functionName: 'canFinish',
        description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.',
        examples: [
            { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Take 0, then 1.' },
            { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'Cycle detected. Cannot finish.' }
        ],
        starterCode: `from typing import List
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        pass`,
        solution: `from typing import List
from collections import defaultdict

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = defaultdict(list)
        for course, prereq in prerequisites:
            graph[course].append(prereq)
        
        # 0: unvisited, 1: visiting, 2: visited
        state = [0] * numCourses
        
        def has_cycle(course):
            if state[course] == 1:  # Cycle detected
                return True
            if state[course] == 2:  # Already processed
                return False
            
            state[course] = 1
            for prereq in graph[course]:
                if has_cycle(prereq):
                    return True
            state[course] = 2
            return False
        
        for course in range(numCourses):
            if has_cycle(course):
                return False
        return True`,
        solutionExplanation: 'Model as directed graph. Use DFS with 3 states: unvisited, visiting (in current path), visited. If we encounter a "visiting" node, there is a cycle. No cycle means all courses can be completed.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        testCases: [{ input: [2, [[1,0]]], expected: true }, { input: [2, [[1,0],[0,1]]], expected: false }]
    },
    {
        id: 'course-schedule-ii',
        title: 'Course Schedule II',
        difficulty: 'Medium',
        functionName: 'findOrder',
        description: 'There are a total of numCourses courses you have to take. Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.',
        examples: [
            { input: 'numCourses = 2, prerequisites = [[1,0]]', output: '[0,1]', explanation: '0 then 1.' },
            { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,2,1,3]', explanation: 'One valid ordering.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        pass`,
        solution: `from typing import List
from collections import defaultdict

class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = defaultdict(list)
        for course, prereq in prerequisites:
            graph[course].append(prereq)
        
        result = []
        state = [0] * numCourses  # 0: unvisited, 1: visiting, 2: visited
        
        def dfs(course):
            if state[course] == 1:
                return False  # Cycle
            if state[course] == 2:
                return True
            
            state[course] = 1
            for prereq in graph[course]:
                if not dfs(prereq):
                    return False
            state[course] = 2
            result.append(course)
            return True
        
        for course in range(numCourses):
            if not dfs(course):
                return []
        
        return result`,
        solutionExplanation: 'Topological sort using DFS. Add course to result after all prerequisites are processed (post-order). If cycle detected, return empty array. Result is already in valid order due to post-order traversal.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        testCases: [{ input: [2, [[1,0]]], expected: [0,1] }]
    },
    {
        id: 'graph-valid-tree',
        title: 'Graph Valid Tree',
        difficulty: 'Medium',
        functionName: 'validTree',
        description: 'You have a graph of n nodes labeled from 0 to n - 1. You are given an integer n and a list of edges where edges[i] = [ai, bi] indicates that there is an undirected edge between nodes ai and bi in the graph. Return true if the edges of the given graph make up a valid tree, and false otherwise.',
        examples: [
            { input: 'n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]', output: 'true', explanation: 'No cycles and fully connected.' },
            { input: 'n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]', output: 'false', explanation: 'Cycle exists.' }
        ],
        starterCode: `from typing import List
class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        pass`,
        solution: `from typing import List

class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        # Tree must have exactly n-1 edges
        if len(edges) != n - 1:
            return False
        
        parent = list(range(n))
        
        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]
        
        def union(x, y):
            px, py = find(x), find(y)
            if px == py:
                return False  # Cycle detected
            parent[px] = py
            return True
        
        for a, b in edges:
            if not union(a, b):
                return False
        
        return True`,
        solutionExplanation: 'A valid tree has exactly n-1 edges and no cycles. Use Union-Find to detect cycles: if two nodes are already in the same component when processing an edge, there is a cycle. With n-1 edges and no cycles, the graph is connected.',
        timeComplexity: 'O(n * α(n))',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [5, [[0,1],[0,2],[0,3],[1,4]]], expected: true }]
    },
    {
        id: 'number-connected-components',
        title: 'Number of Connected Components in an Undirected Graph',
        difficulty: 'Medium',
        functionName: 'countComponents',
        description: 'You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph. Return the number of connected components in the graph.',
        examples: [
            { input: 'n = 5, edges = [[0,1],[1,2],[3,4]]', output: '2', explanation: '0-1-2 is one component. 3-4 is another.' },
            { input: 'n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]', output: '1', explanation: 'All connected.' }
        ],
        starterCode: `from typing import List
class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        parent = list(range(n))
        rank = [1] * n
        
        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]
        
        def union(x, y):
            px, py = find(x), find(y)
            if px == py:
                return 0
            if rank[px] < rank[py]:
                px, py = py, px
            parent[py] = px
            rank[px] += rank[py]
            return 1
        
        components = n
        for a, b in edges:
            components -= union(a, b)
        
        return components`,
        solutionExplanation: 'Use Union-Find. Start with n components (each node is its own component). For each edge, union the two nodes. If they were in different components, decrement count. Path compression and union by rank optimize performance.',
        timeComplexity: 'O(E * α(n))',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [5, [[0,1],[1,2],[3,4]]], expected: 2 }]
    },
    {
        id: 'redundant-connection',
        title: 'Redundant Connection',
        difficulty: 'Medium',
        functionName: 'findRedundantConnection',
        description: 'In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added. The added edge has two different vertices chosen from 1 to n, and was not an edge that already existed. Return an edge that can be removed so that the resulting graph is a tree of n nodes.',
        examples: [
            { input: 'edges = [[1,2],[1,3],[2,3]]', output: '[2,3]', explanation: 'Removing 2-3 leaves a tree 1-2, 1-3.' },
            { input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]', output: '[1,4]', explanation: 'Removing 1-4 breaks the cycle.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        pass`,
        solution: `from typing import List

class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        n = len(edges)
        parent = list(range(n + 1))
        rank = [1] * (n + 1)
        
        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]
        
        def union(x, y):
            px, py = find(x), find(y)
            if px == py:
                return False  # Already connected - this edge creates cycle
            if rank[px] < rank[py]:
                px, py = py, px
            parent[py] = px
            rank[px] += rank[py]
            return True
        
        for a, b in edges:
            if not union(a, b):
                return [a, b]
        
        return []`,
        solutionExplanation: 'Use Union-Find to process edges in order. The first edge that connects two already-connected nodes creates a cycle and is the redundant edge. Return that edge.',
        timeComplexity: 'O(n * α(n))',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[[1,2],[1,3],[2,3]]], expected: [2,3] }]
    },
    {
        id: 'word-ladder',
        title: 'Word Ladder',
        difficulty: 'Hard',
        functionName: 'ladderLength',
        description: 'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair differs by a single letter. Return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.',
        examples: [
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'hit -> hot -> dot -> dog -> cog.' },
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explanation: 'End word not in list.' }
        ],
        starterCode: `from typing import List
class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        pass`,
        solution: `from typing import List
from collections import deque

class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        if endWord not in wordList:
            return 0
        
        wordSet = set(wordList)
        queue = deque([(beginWord, 1)])
        visited = {beginWord}
        
        while queue:
            word, length = queue.popleft()
            
            if word == endWord:
                return length
            
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    next_word = word[:i] + c + word[i+1:]
                    if next_word in wordSet and next_word not in visited:
                        visited.add(next_word)
                        queue.append((next_word, length + 1))
        
        return 0`,
        solutionExplanation: 'BFS to find shortest path. For each word, try changing each character to every letter a-z. If the new word is in wordList and not visited, add to queue. BFS guarantees shortest path is found first.',
        timeComplexity: 'O(m² * n) where m is word length, n is wordList size',
        spaceComplexity: 'O(m * n)',
        testCases: [{ input: ["hit", "cog", ["hot","dot","dog","lot","log","cog"]], expected: 5 }]
    }
];

// --- 12. Advanced Graph ---
const ADVANCED_GRAPH: Problem[] = [
    {
        id: 'network-delay-time',
        title: 'Network Delay Time',
        difficulty: 'Medium',
        functionName: 'networkDelayTime',
        description: 'You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source node, vi is the target node, and wi is the time it takes for a signal to travel from source to target. We will send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal.',
        examples: [
            { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2', explanation: '2->1 (1s), 2->3 (1s), 3->4 (1s). Max path is 2s.' },
            { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1', explanation: '1->2 takes 1s.' }
        ],
        starterCode: `from typing import List
class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        pass`,
        solution: `from typing import List
import heapq
from collections import defaultdict

class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))
        
        dist = {k: 0}
        heap = [(0, k)]  # (time, node)
        
        while heap:
            time, node = heapq.heappop(heap)
            
            if time > dist.get(node, float('inf')):
                continue
            
            for neighbor, weight in graph[node]:
                new_time = time + weight
                if new_time < dist.get(neighbor, float('inf')):
                    dist[neighbor] = new_time
                    heapq.heappush(heap, (new_time, neighbor))
        
        if len(dist) == n:
            return max(dist.values())
        return -1`,
        solutionExplanation: 'Dijkstra\'s algorithm to find shortest paths from source k to all nodes. Use min-heap to always process the closest unvisited node. Return max distance (time for signal to reach farthest node), or -1 if not all nodes reachable.',
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V + E)',
        testCases: [{ input: [[[2,1,1],[2,3,1],[3,4,1]], 4, 2], expected: 2 }]
    },
    {
        id: 'reconstruct-itinerary',
        title: 'Reconstruct Itinerary',
        difficulty: 'Hard',
        functionName: 'findItinerary',
        description: 'You are given a list of airline tickets where tickets[i] = [from_i, to_i] represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it.',
        examples: [
            { input: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', output: '["JFK","MUC","LHR","SFO","SJC"]', explanation: 'Chain the flights.' },
            { input: 'tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]', output: '["JFK","ATL","JFK","SFO","ATL","SFO"]', explanation: 'Lexicographical order preferred.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        pass`,
        solution: `from typing import List
from collections import defaultdict

class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)
        
        result = []
        
        def dfs(airport):
            while graph[airport]:
                dfs(graph[airport].pop())
            result.append(airport)
        
        dfs("JFK")
        return result[::-1]`,
        solutionExplanation: 'Hierholzer\'s algorithm for Eulerian path. Sort destinations in reverse so pop() gives lexicographically smallest. DFS visits all edges exactly once. Build result in reverse order (post-order) then reverse at end.',
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(E)',
        testCases: [{ input: [[["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]], expected: ["JFK","MUC","LHR","SFO","SJC"] }]
    },
    {
        id: 'min-cost-connect-points',
        title: 'Min Cost to Connect All Points',
        difficulty: 'Medium',
        functionName: 'minCostConnectPoints',
        description: 'You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them: |xi - xj| + |yi - yj|. Return the minimum cost to make all points connected.',
        examples: [
            { input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', output: '20', explanation: 'Minimum Spanning Tree cost.' },
            { input: 'points = [[3,12],[-2,5],[-4,1]]', output: '18', explanation: 'Connect all points optimally.' }
        ],
        starterCode: `from typing import List
class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
import heapq

class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        visited = set()
        heap = [(0, 0)]  # (cost, point_index)
        total_cost = 0
        
        while len(visited) < n:
            cost, i = heapq.heappop(heap)
            if i in visited:
                continue
            
            visited.add(i)
            total_cost += cost
            
            for j in range(n):
                if j not in visited:
                    dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                    heapq.heappush(heap, (dist, j))
        
        return total_cost`,
        solutionExplanation: 'Prim\'s algorithm for Minimum Spanning Tree. Start from any point, greedily add the closest unvisited point. Use min-heap to efficiently find the minimum cost edge to an unvisited point.',
        timeComplexity: 'O(n² log n)',
        spaceComplexity: 'O(n²)',
        testCases: [{ input: [[[0,0],[2,2],[3,10],[5,2],[7,0]]], expected: 20 }]
    },
    {
        id: 'swim-in-rising-water',
        title: 'Swim in Rising Water',
        difficulty: 'Hard',
        functionName: 'swimInWater',
        description: 'You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). Rain starts to fall. At time t, the depth of the water everywhere is t. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most t. Return the least time t such that you can reach the bottom right square from top left.',
        examples: [
            { input: 'grid = [[0,2],[1,3]]', output: '3', explanation: 'Need time 3 to pass elevation 3.' },
            { input: 'grid = [[0,1,2,3,4],[24,23,22,21,5]...]', output: '16', explanation: 'Path finding minimizing max elevation.' }
        ],
        starterCode: `from typing import List
class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
import heapq

class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        visited = set()
        heap = [(grid[0][0], 0, 0)]  # (max_elevation, row, col)
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while heap:
            max_elev, r, c = heapq.heappop(heap)
            
            if r == n - 1 and c == n - 1:
                return max_elev
            
            if (r, c) in visited:
                continue
            visited.add((r, c))
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in visited:
                    new_max = max(max_elev, grid[nr][nc])
                    heapq.heappush(heap, (new_max, nr, nc))
        
        return -1`,
        solutionExplanation: 'Modified Dijkstra where we minimize the maximum elevation along the path. Use min-heap ordered by max elevation seen so far. Always expand the path with smallest max elevation. First path to reach destination is optimal.',
        timeComplexity: 'O(n² log n)',
        spaceComplexity: 'O(n²)',
        testCases: [{ input: [[[0,2],[1,3]]], expected: 3 }]
    },
    {
        id: 'alien-dictionary',
        title: 'Alien Dictionary',
        difficulty: 'Hard',
        functionName: 'alienOrder',
        description: 'There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you. You are given a list of strings words from the alien language\'s dictionary, where the strings in words are sorted lexicographically by the rules of this new language. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new rules. If there is no solution, return "".',
        examples: [
            { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"', explanation: 'Deduced order from word sorts.' },
            { input: 'words = ["z","x"]', output: '"zx"', explanation: 'z comes before x.' }
        ],
        starterCode: `from typing import List
class Solution:
    def alienOrder(self, words: List[str]) -> str:
        pass`,
        solution: `from typing import List
from collections import defaultdict, deque

class Solution:
    def alienOrder(self, words: List[str]) -> str:
        # Build graph
        graph = defaultdict(set)
        in_degree = {c: 0 for word in words for c in word}
        
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            min_len = min(len(w1), len(w2))
            
            # Invalid case: prefix comes after longer word
            if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
                return ""
            
            for j in range(min_len):
                if w1[j] != w2[j]:
                    if w2[j] not in graph[w1[j]]:
                        graph[w1[j]].add(w2[j])
                        in_degree[w2[j]] += 1
                    break
        
        # Topological sort (Kahn's algorithm)
        queue = deque([c for c in in_degree if in_degree[c] == 0])
        result = []
        
        while queue:
            c = queue.popleft()
            result.append(c)
            for neighbor in graph[c]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        if len(result) != len(in_degree):
            return ""  # Cycle detected
        
        return "".join(result)`,
        solutionExplanation: 'Build directed graph from adjacent word pairs - first differing character gives ordering. Use topological sort (Kahn\'s algorithm) to find valid ordering. Return empty string if cycle detected or invalid input.',
        timeComplexity: 'O(C) where C is total characters',
        spaceComplexity: 'O(1) - at most 26 letters',
        testCases: [{ input: [["wrt","wrf","er","ett","rftt"]], expected: "wertf" }]
    },
    {
        id: 'cheapest-flights',
        title: 'Cheapest Flights Within K Stops',
        difficulty: 'Medium',
        functionName: 'findCheapestPrice',
        description: 'There are n cities connected by some number of flights. You are given an array flights where flights[i] = [fromi, toi, pricei] indicates that there is a flight from city fromi to city toi with cost pricei. You are also given three integers src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.',
        examples: [
            { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1', output: '200', explanation: '0->1->2 costs 200.' },
            { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0', output: '500', explanation: 'Direct flight only allowed.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        pass`,
        solution: `from typing import List

class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        # Bellman-Ford with k+1 iterations
        prices = [float('inf')] * n
        prices[src] = 0
        
        for _ in range(k + 1):
            temp = prices.copy()
            for u, v, price in flights:
                if prices[u] != float('inf'):
                    temp[v] = min(temp[v], prices[u] + price)
            prices = temp
        
        return prices[dst] if prices[dst] != float('inf') else -1`,
        solutionExplanation: 'Modified Bellman-Ford algorithm. Run k+1 iterations (k stops = k+1 edges). Use temp array to ensure we only use edges from previous iteration. This guarantees at most k stops.',
        timeComplexity: 'O(k * E)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1], expected: 200 }]
    }
];

// --- 13. 1-D Dynamic Programming ---
const DP_1D: Problem[] = [
    {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        functionName: 'climbStairs',
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        examples: [
            { input: 'n = 2', output: '2', explanation: '1+1, 2.' }, 
            { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' }
        ],
        starterCode: `class Solution:
    def climbStairs(self, n: int) -> int:
        pass`,
        solution: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        
        prev2, prev1 = 1, 2
        for i in range(3, n + 1):
            current = prev1 + prev2
            prev2 = prev1
            prev1 = current
        
        return prev1`,
        solutionExplanation: 'Classic Fibonacci pattern. Ways to reach step n = ways to reach (n-1) + ways to reach (n-2). Use two variables to track previous two values for O(1) space.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [2], expected: 2 }, { input: [3], expected: 3 }]
    },
    {
        id: 'min-cost-climbing-stairs',
        title: 'Min Cost Climbing Stairs',
        difficulty: 'Easy',
        functionName: 'minCostClimbingStairs',
        description: 'You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor.',
        examples: [
            { input: 'cost = [10,15,20]', output: '15', explanation: 'Start at 1, pay 15, climb 2.' },
            { input: 'cost = [1,100,1,1,1,100,1,1,100,1]', output: '6', explanation: 'Skip 100s.' }
        ],
        starterCode: `from typing import List
class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        n = len(cost)
        if n <= 2:
            return min(cost)
        
        prev2, prev1 = cost[0], cost[1]
        for i in range(2, n):
            current = cost[i] + min(prev1, prev2)
            prev2 = prev1
            prev1 = current
        
        return min(prev1, prev2)`,
        solutionExplanation: 'At each step, the minimum cost is the step cost plus the minimum of the previous two steps. Can start from step 0 or 1, so return minimum of last two computed values.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[10,15,20]], expected: 15 }]
    },
    {
        id: 'house-robber',
        title: 'House Robber',
        difficulty: 'Medium',
        functionName: 'rob',
        description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
        examples: [
            { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4.' },
            { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob 2, 9, 1.' }
        ],
        starterCode: `from typing import List
class Solution:
    def rob(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        if len(nums) == 1:
            return nums[0]
        
        prev2, prev1 = 0, 0
        for num in nums:
            current = max(prev1, prev2 + num)
            prev2 = prev1
            prev1 = current
        
        return prev1`,
        solutionExplanation: 'At each house, decide: rob it (add to prev2) or skip it (keep prev1). Track max money without robbing adjacent houses using two variables.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,2,3,1]], expected: 4 }]
    },
    {
        id: 'house-robber-ii',
        title: 'House Robber II',
        difficulty: 'Medium',
        functionName: 'rob',
        description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Return the maximum amount of money you can rob tonight without alerting the police.',
        examples: [
            { input: 'nums = [2,3,2]', output: '3', explanation: 'Cannot rob 2 and 2 because they are neighbors in circle.' },
            { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Same as line, but check circle constraint.' }
        ],
        starterCode: `from typing import List
class Solution:
    def rob(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]
        
        def rob_linear(houses):
            prev2, prev1 = 0, 0
            for num in houses:
                current = max(prev1, prev2 + num)
                prev2 = prev1
                prev1 = current
            return prev1
        
        # Either rob houses 0 to n-2, or 1 to n-1
        return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))`,
        solutionExplanation: 'Since houses are circular, first and last are adjacent. Run House Robber I twice: once excluding first house, once excluding last house. Return maximum.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,3,2]], expected: 3 }]
    },
    {
        id: 'longest-palindromic-substring',
        title: 'Longest Palindromic Substring',
        difficulty: 'Medium',
        functionName: 'longestPalindrome',
        description: 'Given a string s, return the longest palindromic substring in s.',
        examples: [
            { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also valid.' },
            { input: 's = "cbbd"', output: '"bb"', explanation: 'Only "bb" is a palindrome.' }
        ],
        starterCode: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        pass`,
        solution: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
        
        def expand_around_center(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return s[left + 1:right]
        
        longest = ""
        for i in range(len(s)):
            # Odd length palindromes
            odd = expand_around_center(i, i)
            # Even length palindromes
            even = expand_around_center(i, i + 1)
            
            longest = max(longest, odd, even, key=len)
        
        return longest`,
        solutionExplanation: 'Expand around each center (both odd and even length). For each position, expand outward while characters match. Track the longest palindrome found.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["babad"], expected: "bab" }]
    },
    {
        id: 'palindromic-substrings',
        title: 'Palindromic Substrings',
        difficulty: 'Medium',
        functionName: 'countSubstrings',
        description: 'Given a string s, return the number of palindromic substrings in it. A string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string.',
        examples: [
            { input: 's = "abc"', output: '3', explanation: 'a, b, c.' },
            { input: 's = "aaa"', output: '6', explanation: 'a, a, a, aa, aa, aaa.' }
        ],
        starterCode: `class Solution:
    def countSubstrings(self, s: str) -> int:
        pass`,
        solution: `class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0
        
        def expand_around_center(left, right):
            nonlocal count
            while left >= 0 and right < len(s) and s[left] == s[right]:
                count += 1
                left -= 1
                right += 1
        
        for i in range(len(s)):
            expand_around_center(i, i)      # Odd length
            expand_around_center(i, i + 1)  # Even length
        
        return count`,
        solutionExplanation: 'Similar to longest palindrome, but count all palindromes found during expansion. Expand from each center for both odd and even length palindromes.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["abc"], expected: 3 }]
    },
    {
        id: 'decode-ways',
        title: 'Decode Ways',
        difficulty: 'Medium',
        functionName: 'numDecodings',
        description: 'A message containing letters from A-Z can be encoded into numbers using the mapping \'A\' -> "1", \'B\' -> "2", ... \'Z\' -> "26". Given a string s containing only digits, return the number of ways to decode it.',
        examples: [
            { input: 's = "12"', output: '2', explanation: '"AB" (1 2) or "L" (12).' },
            { input: 's = "226"', output: '3', explanation: '"BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).' }
        ],
        starterCode: `class Solution:
    def numDecodings(self, s: str) -> int:
        pass`,
        solution: `class Solution:
    def numDecodings(self, s: str) -> int:
        if not s or s[0] == '0':
            return 0
        
        prev2, prev1 = 1, 1
        
        for i in range(1, len(s)):
            current = 0
            # Single digit decode
            if s[i] != '0':
                current += prev1
            # Two digit decode
            two_digit = int(s[i-1:i+1])
            if 10 <= two_digit <= 26:
                current += prev2
            
            prev2 = prev1
            prev1 = current
        
        return prev1`,
        solutionExplanation: 'DP approach: ways[i] = ways[i-1] (if single digit valid) + ways[i-2] (if two digits valid). Use two variables to track previous states.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["12"], expected: 2 }]
    },
    {
        id: 'coin-change',
        title: 'Coin Change',
        difficulty: 'Medium',
        functionName: 'coinChange',
        description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
        examples: [
            { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '5+5+1.' },
            { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Impossible.' }
        ],
        starterCode: `from typing import List
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        
        for i in range(1, amount + 1):
            for coin in coins:
                if coin <= i:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        
        return dp[amount] if dp[amount] != float('inf') else -1`,
        solutionExplanation: 'Bottom-up DP. For each amount, try all coins and take minimum. dp[i] = min coins needed for amount i. If unreachable, return -1.',
        timeComplexity: 'O(amount × coins)',
        spaceComplexity: 'O(amount)',
        testCases: [{ input: [[1,2,5], 11], expected: 3 }]
    },
    {
        id: 'maximum-product-subarray',
        title: 'Maximum Product Subarray',
        difficulty: 'Medium',
        functionName: 'maxProduct',
        description: 'Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.',
        examples: [
            { input: 'nums = [2,3,-2,4]', output: '6', explanation: '2*3 = 6.' },
            { input: 'nums = [-2,0,-1]', output: '0', explanation: 'Result cannot be positive.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        if not nums:
            return 0
        
        max_prod = min_prod = result = nums[0]
        
        for i in range(1, len(nums)):
            num = nums[i]
            # Swap if current number is negative
            if num < 0:
                max_prod, min_prod = min_prod, max_prod
            
            max_prod = max(num, max_prod * num)
            min_prod = min(num, min_prod * num)
            result = max(result, max_prod)
        
        return result`,
        solutionExplanation: 'Track both max and min products (negative × negative = positive). When encountering negative number, swap max and min. Update result with max product.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,3,-2,4]], expected: 6 }]
    },
    {
        id: 'word-break',
        title: 'Word Break',
        difficulty: 'Medium',
        functionName: 'wordBreak',
        description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
        examples: [
            { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'leet code.' },
            { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: 'apple pen apple.' }
        ],
        starterCode: `from typing import List
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        word_set = set(wordDict)
        dp = [False] * (len(s) + 1)
        dp[0] = True
        
        for i in range(1, len(s) + 1):
            for j in range(i):
                if dp[j] and s[j:i] in word_set:
                    dp[i] = True
                    break
        
        return dp[len(s)]`,
        solutionExplanation: 'DP where dp[i] = true if s[0:i] can be segmented. For each position, check all previous positions: if dp[j] is true and s[j:i] is in dictionary, dp[i] = true.',
        timeComplexity: 'O(n² × m)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: ["leetcode", ["leet","code"]], expected: true }]
    },
     {
        id: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        functionName: 'lengthOfLIS',
        description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
        examples: [
            { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '2,3,7,18 or 2,3,7,101.' },
            { input: 'nums = [0,1,0,3,2,3]', output: '4', explanation: '0,1,2,3.' }
        ],
        starterCode: `from typing import List
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        if not nums:
            return 0
        
        dp = [1] * len(nums)
        
        for i in range(1, len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        
        return max(dp)`,
        solutionExplanation: 'DP where dp[i] = length of LIS ending at index i. For each element, check all previous elements: if smaller, extend that subsequence. Return maximum.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[10,9,2,5,3,7,101,18]], expected: 4 }]
    },
    {
        id: 'partition-equal-subset-sum',
        title: 'Partition Equal Subset Sum',
        difficulty: 'Medium',
        functionName: 'canPartition',
        description: 'Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.',
        examples: [
            { input: 'nums = [1,5,11,5]', output: 'true', explanation: '[1, 5, 5] and [11]. Sum is 11.' },
            { input: 'nums = [1,2,3,5]', output: 'false', explanation: 'Sum is 11, cannot split.' }
        ],
        starterCode: `from typing import List
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2 != 0:
            return False
        
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True
        
        for num in nums:
            for i in range(target, num - 1, -1):
                dp[i] = dp[i] or dp[i - num]
        
        return dp[target]`,
        solutionExplanation: 'Subset sum problem. If total is odd, impossible. Otherwise, find if we can make sum = total/2. Use DP to track achievable sums. Iterate backwards to avoid using same element twice.',
        timeComplexity: 'O(n × sum)',
        spaceComplexity: 'O(sum)',
        testCases: [{ input: [[1,5,11,5]], expected: true }]
    }
];

// --- 14. 2-D Dynamic Programming ---
const DP_2D: Problem[] = [
    {
        id: 'unique-paths',
        title: 'Unique Paths',
        difficulty: 'Medium',
        functionName: 'uniquePaths',
        description: 'There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.',
        examples: [
            { input: 'm = 3, n = 7', output: '28', explanation: '28 distinct paths.' },
            { input: 'm = 3, n = 2', output: '3', explanation: 'R-D-D, D-R-D, D-D-R.' }
        ],
        starterCode: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        pass`,
        solution: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        
        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = dp[i-1][j] + dp[i][j-1]
        
        return dp[m-1][n-1]`,
        solutionExplanation: 'Paths to cell (i,j) = paths from above + paths from left. Initialize first row and column to 1. Build up the grid using this recurrence.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: [3, 7], expected: 28 }]
    },
    {
        id: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        functionName: 'longestCommonSubsequence',
        description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
        examples: [
            { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: '"ace" is the subsequence.' },
            { input: 'text1 = "abc", text2 = "def"', output: '0', explanation: 'No common letters.' }
        ],
        starterCode: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        pass`,
        solution: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i-1] == text2[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        
        return dp[m][n]`,
        solutionExplanation: 'Classic 2D DP. If characters match, add 1 to diagonal. Otherwise, take max from top or left. dp[i][j] = LCS length for text1[0:i] and text2[0:j].',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: ["abcde", "ace"], expected: 3 }]
    },
    {
        id: 'best-time-cooldown',
        title: 'Best Time to Buy and Sell Stock with Cooldown',
        difficulty: 'Medium',
        functionName: 'maxProfit',
        description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete as many transactions as you like (i.e., buy one and sell one share of the stock multiple times) with the following restrictions: After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).',
        examples: [
            { input: 'prices = [1,2,3,0,2]', output: '3', explanation: 'Buy, Sell, Cooldown, Buy, Sell.' },
            { input: 'prices = [1]', output: '0', explanation: 'No trades.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        
        sold, held, reset = float('-inf'), float('-inf'), 0
        
        for price in prices:
            prev_sold = sold
            sold = held + price
            held = max(held, reset - price)
            reset = max(reset, prev_sold)
        
        return max(sold, reset)`,
        solutionExplanation: 'State machine DP with 3 states: sold (just sold), held (holding stock), reset (cooldown). Track transitions: can buy after reset, sell when holding, cooldown after selling.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,2,3,0,2]], expected: 3 }]
    },
    {
        id: 'coin-change-2',
        title: 'Coin Change II',
        difficulty: 'Medium',
        functionName: 'change',
        description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.',
        examples: [
            { input: 'amount = 5, coins = [1,2,5]', output: '4', explanation: '1+1+1+1+1, 1+1+1+2, 1+2+2, 5.' },
            { input: 'amount = 3, coins = [2]', output: '0', explanation: 'Impossible.' }
        ],
        starterCode: `from typing import List
class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1
        
        for coin in coins:
            for i in range(coin, amount + 1):
                dp[i] += dp[i - coin]
        
        return dp[amount]`,
        solutionExplanation: 'Unbounded knapsack. For each coin, update all amounts >= coin. dp[i] = number of ways to make amount i. Iterate coins in outer loop to avoid counting permutations.',
        timeComplexity: 'O(amount × coins)',
        spaceComplexity: 'O(amount)',
        testCases: [{ input: [5, [1,2,5]], expected: 4 }]
    },
    {
        id: 'target-sum',
        title: 'Target Sum',
        difficulty: 'Medium',
        functionName: 'findTargetSumWays',
        description: 'You are given an integer array nums and an integer target. You want to build an expression out of nums by adding one of the symbols \'+\' and \'-\' before each integer in nums and then concatenate all the integers. Return the number of different expressions that you can build, which evaluates to target.',
        examples: [
            { input: 'nums = [1,1,1,1,1], target = 3', output: '5', explanation: '5 ways to assign + and -.' },
            { input: 'nums = [1], target = 1', output: '1', explanation: '+1.' }
        ],
        starterCode: `from typing import List
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 != 0:
            return 0
        
        subset_sum = (total + target) // 2
        dp = [0] * (subset_sum + 1)
        dp[0] = 1
        
        for num in nums:
            for i in range(subset_sum, num - 1, -1):
                dp[i] += dp[i - num]
        
        return dp[subset_sum]`,
        solutionExplanation: 'Convert to subset sum: sum(P) - sum(N) = target, sum(P) + sum(N) = total. So sum(P) = (total + target) / 2. Count subsets with this sum.',
        timeComplexity: 'O(n × sum)',
        spaceComplexity: 'O(sum)',
        testCases: [{ input: [[1,1,1,1,1], 3], expected: 5 }]
    },
    {
        id: 'interleaving-string',
        title: 'Interleaving String',
        difficulty: 'Medium',
        functionName: 'isInterleave',
        description: 'Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2.',
        examples: [
            { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true', explanation: 's1 and s2 interleaved form s3.' },
            { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: 'false', explanation: 'Cannot form.' }
        ],
        starterCode: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        pass`,
        solution: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        if len(s1) + len(s2) != len(s3):
            return False
        
        dp = [[False] * (len(s2) + 1) for _ in range(len(s1) + 1)]
        dp[0][0] = True
        
        for i in range(len(s1) + 1):
            for j in range(len(s2) + 1):
                if i > 0 and s1[i-1] == s3[i+j-1]:
                    dp[i][j] = dp[i][j] or dp[i-1][j]
                if j > 0 and s2[j-1] == s3[i+j-1]:
                    dp[i][j] = dp[i][j] or dp[i][j-1]
        
        return dp[len(s1)][len(s2)]`,
        solutionExplanation: '2D DP where dp[i][j] = true if s1[0:i] and s2[0:j] can interleave to form s3[0:i+j]. Check if current char from s1 or s2 matches s3.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: ["aabcc", "dbbca", "aadbbcbcac"], expected: true }]
    },
    {
        id: 'longest-increasing-path-matrix',
        title: 'Longest Increasing Path in a Matrix',
        difficulty: 'Hard',
        functionName: 'longestIncreasingPath',
        description: 'Given an m x n integers matrix, return the length of the longest increasing path in matrix. From each cell, you can either move in four directions: left, right, up, or down. You may not move diagonally or move outside the boundary (i.e., wrap-around is not allowed).',
        examples: [
            { input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4', explanation: 'Path 1->2->6->9.' },
            { input: 'matrix = [[3,4,5],[3,2,6],[2,2,1]]', output: '4', explanation: 'Path 3->4->5->6.' }
        ],
        starterCode: `from typing import List
class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        if not matrix:
            return 0
        
        m, n = len(matrix), len(matrix[0])
        memo = {}
        
        def dfs(i, j):
            if (i, j) in memo:
                return memo[(i, j)]
            
            max_len = 1
            for di, dj in [(0,1), (1,0), (0,-1), (-1,0)]:
                ni, nj = i + di, j + dj
                if 0 <= ni < m and 0 <= nj < n and matrix[ni][nj] > matrix[i][j]:
                    max_len = max(max_len, 1 + dfs(ni, nj))
            
            memo[(i, j)] = max_len
            return max_len
        
        return max(dfs(i, j) for i in range(m) for j in range(n))`,
        solutionExplanation: 'DFS with memoization. For each cell, explore all 4 directions where value increases. Cache results to avoid recomputation. Return max path length across all cells.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: [[[9,9,4],[6,6,8],[2,1,1]]], expected: 4 }]
    },
    {
        id: 'distinct-subsequences',
        title: 'Distinct Subsequences',
        difficulty: 'Hard',
        functionName: 'numDistinct',
        description: 'Given two strings s and t, return the number of distinct subsequences of s which equals t.',
        examples: [
            { input: 's = "rabbbit", t = "rabbit"', output: '3', explanation: 'Three ways to form rabbit.' },
            { input: 's = "babgbag", t = "bag"', output: '5', explanation: 'Five ways.' }
        ],
        starterCode: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        pass`,
        solution: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = 1
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                dp[i][j] = dp[i-1][j]
                if s[i-1] == t[j-1]:
                    dp[i][j] += dp[i-1][j-1]
        
        return dp[m][n]`,
        solutionExplanation: 'DP where dp[i][j] = number of ways to form t[0:j] from s[0:i]. If chars match, add ways from dp[i-1][j-1]. Always include ways without using current char.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: ["rabbbit", "rabbit"], expected: 3 }]
    },
    {
        id: 'edit-distance',
        title: 'Edit Distance',
        difficulty: 'Hard',
        functionName: 'minDistance',
        description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.',
        examples: [
            { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse -> rose -> ros.' },
            { input: 'word1 = "intention", word2 = "execution"', output: '5', explanation: '5 operations needed.' }
        ],
        starterCode: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        pass`,
        solution: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i-1] == word2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
        
        return dp[m][n]`,
        solutionExplanation: 'Classic edit distance DP. If chars match, no operation needed. Otherwise, take min of: delete (dp[i-1][j]), insert (dp[i][j-1]), replace (dp[i-1][j-1]) + 1.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: ["horse", "ros"], expected: 3 }]
    },
    {
        id: 'burst-balloons',
        title: 'Burst Balloons',
        difficulty: 'Hard',
        functionName: 'maxCoins',
        description: 'You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. If you burst the ith balloon, you will get nums[i - 1] * nums[i] * nums[i + 1] coins. If i - 1 or i + 1 goes out of bounds of the array, then treat it as if there is a balloon with a 1 painted on it. Return the maximum coins you can collect by bursting the balloons wisely.',
        examples: [
            { input: 'nums = [3,1,5,8]', output: '167', explanation: '3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15 + 120 + 24 + 8 = 167.' },
            { input: 'nums = [1,5]', output: '10', explanation: 'Burst 1 then 5.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        nums = [1] + nums + [1]
        n = len(nums)
        dp = [[0] * n for _ in range(n)]
        
        for length in range(2, n):
            for left in range(n - length):
                right = left + length
                for i in range(left + 1, right):
                    dp[left][right] = max(
                        dp[left][right],
                        nums[left] * nums[i] * nums[right] + dp[left][i] + dp[i][right]
                    )
        
        return dp[0][n-1]`,
        solutionExplanation: 'Interval DP. Think backwards: which balloon to burst LAST in range [left, right]. Add padding 1s. For each interval, try bursting each balloon last, sum coins + subproblems.',
        timeComplexity: 'O(n³)',
        spaceComplexity: 'O(n²)',
        testCases: [{ input: [[3,1,5,8]], expected: 167 }]
    },
    {
        id: 'regular-expression-matching',
        title: 'Regular Expression Matching',
        difficulty: 'Hard',
        functionName: 'isMatch',
        description: 'Given an input string s and a pattern p, implement regular expression matching with support for \'.\' and \'*\' where: \'.\' Matches any single character. \'*\' Matches zero or more of the preceding element.',
        examples: [
            { input: 's = "aa", p = "a"', output: 'false', explanation: 'Does not match.' },
            { input: 's = "aa", p = "a*"', output: 'true', explanation: '* repeats a.' }
        ],
        starterCode: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        pass`,
        solution: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        
        for j in range(2, n + 1):
            if p[j-1] == '*':
                dp[0][j] = dp[0][j-2]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j-1] == '*':
                    dp[i][j] = dp[i][j-2]
                    if p[j-2] == '.' or p[j-2] == s[i-1]:
                        dp[i][j] = dp[i][j] or dp[i-1][j]
                elif p[j-1] == '.' or p[j-1] == s[i-1]:
                    dp[i][j] = dp[i-1][j-1]
        
        return dp[m][n]`,
        solutionExplanation: 'DP where dp[i][j] = s[0:i] matches p[0:j]. Handle * by: match 0 times (dp[i][j-2]) or match 1+ times (dp[i-1][j] if char matches). Handle . by matching any char.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        testCases: [{ input: ["aa", "a"], expected: false }]
    }
];

// --- 15. Greedy ---
const GREEDY: Problem[] = [
    {
        id: 'maximum-subarray',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        functionName: 'maxSubArray',
        description: 'Given an integer array nums, find the subarray which has the largest sum and return its sum.',
        examples: [
            { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
            { input: 'nums = [1]', output: '1', explanation: 'Single element.' }
        ],
        starterCode: `from typing import List
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        max_sum = current_sum = nums[0]
        
        for num in nums[1:]:
            current_sum = max(num, current_sum + num)
            max_sum = max(max_sum, current_sum)
        
        return max_sum`,
        solutionExplanation: 'Kadane\'s algorithm. At each position, decide: start new subarray or extend current. Track maximum sum seen. Greedy choice: if current sum becomes negative, start fresh.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 }]
    },
    {
        id: 'jump-game',
        title: 'Jump Game',
        difficulty: 'Medium',
        functionName: 'canJump',
        description: 'You are given an integer array nums. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
        examples: [
            { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 to index 1, then 3 to index 4.' },
            { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Stuck at index 3.' }
        ],
        starterCode: `from typing import List
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        max_reach = 0
        
        for i in range(len(nums)):
            if i > max_reach:
                return False
            max_reach = max(max_reach, i + nums[i])
            if max_reach >= len(nums) - 1:
                return True
        
        return True`,
        solutionExplanation: 'Track maximum reachable index. At each position, update max reach. If current index exceeds max reach, we\'re stuck. Greedy: always track furthest we can go.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,3,1,1,4]], expected: true }]
    },
    {
        id: 'jump-game-ii',
        title: 'Jump Game II',
        difficulty: 'Medium',
        functionName: 'jump',
        description: 'You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. Return the minimum number of jumps to reach nums[n - 1].',
        examples: [
            { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'Jump to index 1, then to index 4.' },
            { input: 'nums = [2,3,0,1,4]', output: '2', explanation: 'Jump to 1, then end.' }
        ],
        starterCode: `from typing import List
class Solution:
    def jump(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = 0
        current_end = 0
        farthest = 0
        
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            
            if i == current_end:
                jumps += 1
                current_end = farthest
        
        return jumps`,
        solutionExplanation: 'BFS-like greedy. Track current jump range and farthest reachable. When reaching end of current range, make a jump to farthest point. Greedy: always jump to position that reaches furthest.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,3,1,1,4]], expected: 2 }]
    },
    {
        id: 'gas-station',
        title: 'Gas Station',
        difficulty: 'Medium',
        functionName: 'canCompleteCircuit',
        description: 'There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations. Return the starting gas station\'s index if you can travel around the circuit once in the clockwise direction, otherwise return -1.',
        examples: [
            { input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3', explanation: 'Start at station 3 (index 3) and complete circle.' },
            { input: 'gas = [2,3,4], cost = [3,4,3]', output: '-1', explanation: 'Cannot complete.' }
        ],
        starterCode: `from typing import List
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1
        
        tank = 0
        start = 0
        
        for i in range(len(gas)):
            tank += gas[i] - cost[i]
            
            if tank < 0:
                start = i + 1
                tank = 0
        
        return start`,
        solutionExplanation: 'If total gas < total cost, impossible. Otherwise, find starting point: if tank goes negative at i, start must be after i. Greedy: reset start when we can\'t proceed.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,2,3,4,5], [3,4,5,1,2]], expected: 3 }]
    },
    {
        id: 'hand-of-straights',
        title: 'Hand of Straights',
        difficulty: 'Medium',
        functionName: 'isNStraightHand',
        description: 'Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards. Given an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return true if she can rearrange the cards, or false otherwise.',
        examples: [
            { input: 'hand = [1,2,3,6,2,3,4,7,8], groupSize = 3', output: 'true', explanation: '[1,2,3], [2,3,4], [6,7,8].' },
            { input: 'hand = [1,2,3,4,5], groupSize = 4', output: 'false', explanation: 'Cannot divide.' }
        ],
        starterCode: `from typing import List
class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize != 0:
            return False
        
        from collections import Counter
        count = Counter(hand)
        
        for card in sorted(count.keys()):
            if count[card] > 0:
                needed = count[card]
                for i in range(groupSize):
                    if count[card + i] < needed:
                        return False
                    count[card + i] -= needed
        
        return True`,
        solutionExplanation: 'Sort cards and use counter. Greedy: always form groups starting from smallest card. For each card, try to form groups with consecutive cards. If any consecutive card missing, impossible.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[1,2,3,6,2,3,4,7,8], 3], expected: true }]
    },
    {
        id: 'merge-triplets',
        title: 'Merge Triplets to Form Target Triplet',
        difficulty: 'Medium',
        functionName: 'mergeTriplets',
        description: 'A triplet is an array of three integers. You are given a 2D integer array triplets, where triplets[i] = [ai, bi, ci]. You are also given an integer array target = [x, y, z] that describes the triplet you want to obtain. To obtain target, you may apply the following operation on triplets any number of times (possibly zero): Choose two indices (0-indexed) i and j (i != j) and update triplets[j] to become [max(ai, aj), max(bi, bj), max(ci, cj)]. Return true if it is possible to obtain the target triplet [x, y, z] as an element of triplets, or false otherwise.',
        examples: [
            { input: 'triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]', output: 'true', explanation: 'Merge 1st and 3rd triplet.' },
            { input: 'triplets = [[2,3,4],[1,2,3]], target = [3,2,5]', output: 'false', explanation: 'Cannot reach target.' }
        ],
        starterCode: `from typing import List
class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        good = [False, False, False]
        
        for triplet in triplets:
            if all(triplet[i] <= target[i] for i in range(3)):
                for i in range(3):
                    if triplet[i] == target[i]:
                        good[i] = True
        
        return all(good)`,
        solutionExplanation: 'Greedy: only consider triplets where all values ≤ target (can\'t reduce values). Check if we can find target[0], target[1], target[2] in valid triplets. Need all three.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[2,5,3],[1,8,4],[1,7,5]], [2,7,5]], expected: true }]
    },
    {
        id: 'partition-labels',
        title: 'Partition Labels',
        difficulty: 'Medium',
        functionName: 'partitionLabels',
        description: 'You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Note that the partition is done so that after concatenating all the parts in order, the resultant string should be s. Return a list of integers representing the size of these parts.',
        examples: [
            { input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', explanation: '"ababcbaca", "defegde", "hijhklij".' },
            { input: 's = "eccbbbbdec"', output: '[10]', explanation: 'One part.' }
        ],
        starterCode: `from typing import List
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        pass`,
        solution: `from typing import List
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}
        result = []
        start = 0
        end = 0
        
        for i, c in enumerate(s):
            end = max(end, last[c])
            
            if i == end:
                result.append(end - start + 1)
                start = i + 1
        
        return result`,
        solutionExplanation: 'Record last occurrence of each char. Greedy: extend partition end to include last occurrence of all chars seen. When reaching partition end, cut and start new partition.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["ababcbacadefegdehijhklij"], expected: [9,7,8] }]
    },
    {
        id: 'valid-parenthesis-string',
        title: 'Valid Parenthesis String',
        difficulty: 'Medium',
        functionName: 'checkValidString',
        description: 'Given a string s containing only three types of characters: \'(\', \')\' and \'*\', return true if s is valid. \'*\' can be treated as \'(\', \')\' or empty string.',
        examples: [
            { input: 's = "(*))"', output: 'true', explanation: '* becomes (.' },
            { input: 's = ")*"', output: 'false', explanation: 'Start with close.' }
        ],
        starterCode: `class Solution:
    def checkValidString(self, s: str) -> bool:
        pass`,
        solution: `class Solution:
    def checkValidString(self, s: str) -> bool:
        low = high = 0
        
        for c in s:
            if c == '(':
                low += 1
                high += 1
            elif c == ')':
                low = max(0, low - 1)
                high -= 1
            else:  # *
                low = max(0, low - 1)
                high += 1
            
            if high < 0:
                return False
        
        return low == 0`,
        solutionExplanation: 'Track range of possible open parens. low = min opens (treat * as ) or empty), high = max opens (treat * as (). If high < 0, too many closes. At end, check if 0 opens possible.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: ["(*))"], expected: true }]
    }
];

// --- 16. Intervals ---
const INTERVALS: Problem[] = [
    {
        id: 'insert-interval',
        title: 'Insert Interval',
        difficulty: 'Medium',
        functionName: 'insert',
        description: 'You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval. Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).',
        examples: [
            { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]', explanation: 'Overlaps with [1,3].' },
            { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]', explanation: 'Merges 3 intervals.' }
        ],
        starterCode: `from typing import List
class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        pass`,
        solution: `from typing import List
class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []
        i = 0
        n = len(intervals)
        
        # Add all intervals before newInterval
        while i < n and intervals[i][1] < newInterval[0]:
            result.append(intervals[i])
            i += 1
        
        # Merge overlapping intervals
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        result.append(newInterval)
        
        # Add remaining intervals
        while i < n:
            result.append(intervals[i])
            i += 1
        
        return result`,
        solutionExplanation: 'Three phases: add intervals before new one, merge overlapping intervals with new one (update start/end), add remaining intervals. Linear scan through sorted intervals.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[[1,3],[6,9]], [2,5]], expected: [[1,5],[6,9]] }]
    },
    {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        functionName: 'merge',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        examples: [
            { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap.' },
            { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Touching intervals merge.' }
        ],
        starterCode: `from typing import List
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        pass`,
        solution: `from typing import List
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]
        
        for current in intervals[1:]:
            if current[0] <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], current[1])
            else:
                merged.append(current)
        
        return merged`,
        solutionExplanation: 'Sort by start time. Iterate through intervals: if current overlaps with last merged interval (start <= last end), extend last interval. Otherwise, add new interval.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] }]
    },
    {
        id: 'non-overlapping-intervals',
        title: 'Non-overlapping Intervals',
        difficulty: 'Medium',
        functionName: 'eraseOverlapIntervals',
        description: 'Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
        examples: [
            { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: 'Remove [1,3].' },
            { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2', explanation: 'Remove two [1,2].' }
        ],
        starterCode: `from typing import List
class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda x: x[1])
        count = 0
        end = float('-inf')
        
        for interval in intervals:
            if interval[0] >= end:
                end = interval[1]
            else:
                count += 1
        
        return count`,
        solutionExplanation: 'Greedy: sort by end time. Keep intervals that end earliest. If current overlaps with previous (start < prev end), remove current. Otherwise, update end time.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[1,2],[2,3],[3,4],[1,3]]], expected: 1 }]
    },
    {
        id: 'meeting-rooms',
        title: 'Meeting Rooms',
        difficulty: 'Easy',
        functionName: 'canAttendMeetings',
        description: 'Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...] (si < ei), determine if a person could attend all meetings.',
        examples: [
            { input: 'intervals = [[0,30],[5,10],[15,20]]', output: 'false', explanation: '0-30 overlaps with others.' },
            { input: 'intervals = [[7,10],[2,4]]', output: 'true', explanation: 'No overlap.' }
        ],
        starterCode: `from typing import List
class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        pass`,
        solution: `from typing import List
class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        intervals.sort(key=lambda x: x[0])
        
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i-1][1]:
                return False
        
        return True`,
        solutionExplanation: 'Sort by start time. Check if any meeting starts before previous one ends. If so, overlap exists and cannot attend all meetings.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[0,30],[5,10],[15,20]]], expected: false }]
    },
    {
        id: 'meeting-rooms-ii',
        title: 'Meeting Rooms II',
        difficulty: 'Medium',
        functionName: 'minMeetingRooms',
        description: 'Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...] (si < ei), find the minimum number of conference rooms required.',
        examples: [
            { input: 'intervals = [[0, 30],[5, 10],[15, 20]]', output: '2', explanation: 'Need 2 rooms.' },
            { input: 'intervals = [[7,10],[2,4]]', output: '1', explanation: 'One room sufficient.' }
        ],
        starterCode: `from typing import List
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0
        
        starts = sorted([i[0] for i in intervals])
        ends = sorted([i[1] for i in intervals])
        
        rooms = 0
        max_rooms = 0
        s = e = 0
        
        while s < len(starts):
            if starts[s] < ends[e]:
                rooms += 1
                max_rooms = max(max_rooms, rooms)
                s += 1
            else:
                rooms -= 1
                e += 1
        
        return max_rooms`,
        solutionExplanation: 'Separate and sort start/end times. Use two pointers: when meeting starts, need room (+1). When meeting ends, free room (-1). Track max concurrent meetings.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [[[0, 30],[5, 10],[15, 20]]], expected: 2 }]
    },
    {
        id: 'min-interval-query',
        title: 'Minimum Interval to Include Each Query',
        difficulty: 'Hard',
        functionName: 'minInterval',
        description: 'You are given a 2D integer array intervals, where intervals[i] = [lefti, righti] describes the ith interval starting at lefti and ending at righti (inclusive). You are also given an integer array queries. The answer to the jth query is the size of the smallest interval i such that lefti <= queries[j] <= righti. If no such interval exists, the answer is -1. Return an array containing the answers to the queries.',
        examples: [
            { input: 'intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]', output: '[3,3,1,4]', explanation: 'Smallest interval covering 2 is [2,4] (len 3).' },
            { input: 'intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]', output: '[2,-1,4,6]', explanation: 'No interval covers 19.' }
        ],
        starterCode: `from typing import List
class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        pass`,
        solution: `from typing import List
import heapq
class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        intervals.sort()
        sorted_queries = sorted((q, i) for i, q in enumerate(queries))
        result = [-1] * len(queries)
        min_heap = []
        i = 0
        
        for q, idx in sorted_queries:
            # Add all intervals that start <= q
            while i < len(intervals) and intervals[i][0] <= q:
                l, r = intervals[i]
                heapq.heappush(min_heap, (r - l + 1, r))
                i += 1
            
            # Remove intervals that end < q
            while min_heap and min_heap[0][1] < q:
                heapq.heappop(min_heap)
            
            # Get smallest valid interval
            if min_heap:
                result[idx] = min_heap[0][0]
        
        return result`,
        solutionExplanation: 'Sort intervals and queries. Use min heap by interval size. For each query, add intervals that start before it, remove intervals that end before it. Top of heap = smallest valid interval.',
        timeComplexity: 'O((n + m) log n)',
        spaceComplexity: 'O(n + m)',
        testCases: [{ input: [[[1,4],[2,4],[3,6],[4,4]], [2,3,4,5]], expected: [3,3,1,4] }]
    }
];

// --- 17. Math & Geometry ---
const MATH: Problem[] = [
    {
        id: 'rotate-image',
        title: 'Rotate Image',
        difficulty: 'Medium',
        functionName: 'rotate',
        description: 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.',
        examples: [
            { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]', explanation: 'Rows become columns.' },
            { input: 'matrix = [[5,1,9,11],[2,4,8,10]...]', output: '[[15,13,2,5]...]', explanation: '90 degree rotation.' }
        ],
        starterCode: `from typing import List
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        pass`,
        solution: `from typing import List
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        
        # Transpose the matrix
        for i in range(n):
            for j in range(i, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        
        # Reverse each row
        for i in range(n):
            matrix[i].reverse()`,
        solutionExplanation: 'To rotate 90 degrees clockwise: 1) Transpose the matrix (swap rows and columns). 2) Reverse each row. This achieves the rotation in-place with O(1) extra space.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[7,4,1],[8,5,2],[9,6,3]] }]
    },
    {
        id: 'spiral-matrix',
        title: 'Spiral Matrix',
        difficulty: 'Medium',
        functionName: 'spiralOrder',
        description: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
        examples: [
            { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]', explanation: 'Clockwise spiral.' },
            { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]', explanation: 'Standard spiral.' }
        ],
        starterCode: `from typing import List
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        pass`,
        solution: `from typing import List
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        if not matrix:
            return result
        
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        
        while top <= bottom and left <= right:
            # Traverse right
            for col in range(left, right + 1):
                result.append(matrix[top][col])
            top += 1
            
            # Traverse down
            for row in range(top, bottom + 1):
                result.append(matrix[row][right])
            right -= 1
            
            # Traverse left (if still valid)
            if top <= bottom:
                for col in range(right, left - 1, -1):
                    result.append(matrix[bottom][col])
                bottom -= 1
            
            # Traverse up (if still valid)
            if left <= right:
                for row in range(bottom, top - 1, -1):
                    result.append(matrix[row][left])
                left += 1
        
        return result`,
        solutionExplanation: 'Use four boundaries (top, bottom, left, right) and traverse in spiral order: right → down → left → up. After each direction, shrink the corresponding boundary. Continue until boundaries cross.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [1,2,3,6,9,8,7,4,5] }]
    },
    {
        id: 'set-matrix-zeroes',
        title: 'Set Matrix Zeroes',
        difficulty: 'Medium',
        functionName: 'setZeroes',
        description: 'Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0\'s. You must do it in place.',
        examples: [
            { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]', explanation: 'Center was 0.' },
            { input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]', explanation: 'Rows and cols with 0 cleared.' }
        ],
        starterCode: `from typing import List
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        pass`,
        solution: `from typing import List
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))
        
        # Use first row and column as markers
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = 0
                    matrix[0][j] = 0
        
        # Set zeros based on markers
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        
        # Handle first row and column
        if first_row_zero:
            for j in range(n):
                matrix[0][j] = 0
        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0`,
        solutionExplanation: 'Use the first row and column as markers to track which rows/columns should be zeroed. First, check if first row/column originally had zeros. Mark zeros in first row/column, then use those markers to set zeros. Finally, handle first row/column separately.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[[1,1,1],[1,0,1],[1,1,1]]], expected: [[1,0,1],[0,0,0],[1,0,1]] }]
    },
    {
        id: 'happy-number',
        title: 'Happy Number',
        difficulty: 'Easy',
        functionName: 'isHappy',
        description: 'Write an algorithm to determine if a number n is happy. A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1. Those numbers for which this process ends in 1 are happy.',
        examples: [
            { input: 'n = 19', output: 'true', explanation: '1^2+9^2=82 -> 8^2+2^2=68 -> ... -> 1.' },
            { input: 'n = 2', output: 'false', explanation: 'Loops endlessly.' }
        ],
        starterCode: `class Solution:
    def isHappy(self, n: int) -> bool:
        pass`,
        solution: `class Solution:
    def isHappy(self, n: int) -> bool:
        def get_next(num):
            total = 0
            while num > 0:
                digit = num % 10
                total += digit * digit
                num //= 10
            return total
        
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = get_next(n)
        
        return n == 1`,
        solutionExplanation: 'Use a hash set to detect cycles. Repeatedly compute sum of squares of digits. If we reach 1, it\'s happy. If we see a number we\'ve seen before (cycle), it\'s not happy.',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(log n)',
        testCases: [{ input: [19], expected: true }, { input: [2], expected: false }]
    },
    {
        id: 'plus-one',
        title: 'Plus One',
        difficulty: 'Easy',
        functionName: 'plusOne',
        description: 'You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0\'s. Increment the large integer by one and return the resulting array of digits.',
        examples: [
            { input: 'digits = [1,2,3]', output: '[1,2,4]', explanation: '123 + 1 = 124.' },
            { input: 'digits = [9]', output: '[1,0]', explanation: '9 + 1 = 10.' }
        ],
        starterCode: `from typing import List
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        pass`,
        solution: `from typing import List
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        n = len(digits)
        
        for i in range(n - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        
        # All digits were 9
        return [1] + digits`,
        solutionExplanation: 'Iterate from right to left. If digit < 9, increment and return. If digit is 9, set to 0 and continue (carry). If all digits were 9, prepend 1 to the array.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[1,2,3]], expected: [1,2,4] }]
    },
    {
        id: 'pow-x-n',
        title: 'Pow(x, n)',
        difficulty: 'Medium',
        functionName: 'myPow',
        description: 'Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).',
        examples: [
            { input: 'x = 2.00000, n = 10', output: '1024.00000', explanation: '2^10.' },
            { input: 'x = 2.00000, n = -2', output: '0.25000', explanation: '2^-2 = 1/4.' }
        ],
        starterCode: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        pass`,
        solution: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        def helper(x, n):
            if n == 0:
                return 1
            if n == 1:
                return x
            
            half = helper(x, n // 2)
            if n % 2 == 0:
                return half * half
            else:
                return half * half * x
        
        result = helper(x, abs(n))
        return result if n >= 0 else 1 / result`,
        solutionExplanation: 'Use binary exponentiation (fast power). Recursively compute x^(n/2), then square it. If n is odd, multiply by x once more. For negative n, return 1/result. This reduces O(n) to O(log n).',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(log n)',
        testCases: [{ input: [2.00000, 10], expected: 1024.00000 }]
    },
    {
        id: 'multiply-strings',
        title: 'Multiply Strings',
        difficulty: 'Medium',
        functionName: 'multiply',
        description: 'Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string. Note: You must not use any built-in BigInteger library or convert the inputs to integer directly.',
        examples: [
            { input: 'num1 = "2", num2 = "3"', output: '"6"', explanation: '2 * 3 = 6.' },
            { input: 'num1 = "123", num2 = "456"', output: '"56088"', explanation: '123 * 456.' }
        ],
        starterCode: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        pass`,
        solution: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"
        
        m, n = len(num1), len(num2)
        result = [0] * (m + n)
        
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                mul = int(num1[i]) * int(num2[j])
                pos1, pos2 = i + j, i + j + 1
                total = mul + result[pos2]
                
                result[pos2] = total % 10
                result[pos1] += total // 10
        
        # Skip leading zeros
        start = 0
        while start < len(result) and result[start] == 0:
            start += 1
        
        return ''.join(map(str, result[start:]))`,
        solutionExplanation: 'Simulate manual multiplication. Create result array of size m+n. For each digit pair, multiply and add to appropriate position. Handle carries. Skip leading zeros in final result.',
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m + n)',
        testCases: [{ input: ["2", "3"], expected: "6" }]
    },
    {
        id: 'detect-squares',
        title: 'Detect Squares',
        difficulty: 'Medium',
        functionName: 'DetectSquares',
        description: 'You are given a stream of points on the X-Y plane. Design an algorithm that: Adds new points from the stream into a data structure. Counts the number of ways to form a axis-aligned square with point (px, py) as query.',
        examples: [
            { input: 'add([3, 10]); add([11, 2]); add([3, 2]); count([11, 10]);', output: '1', explanation: 'Forms square.' },
            { input: 'count([14, 8]);', output: '0', explanation: 'No square.' }
        ],
        starterCode: `from typing import List
class DetectSquares:
    def __init__(self):
        pass
    def add(self, point: List[int]) -> None:
        pass
    def count(self, point: List[int]) -> int:
        pass`,
        solution: `from typing import List
from collections import defaultdict

class DetectSquares:
    def __init__(self):
        self.points = defaultdict(int)
    
    def add(self, point: List[int]) -> None:
        self.points[tuple(point)] += 1
    
    def count(self, point: List[int]) -> int:
        px, py = point
        total = 0
        
        for (x, y), count in self.points.items():
            # Check if this point can form a diagonal
            if abs(px - x) != abs(py - y) or px == x or py == y:
                continue
            
            # Check if other two corners exist
            total += count * self.points[(px, y)] * self.points[(x, py)]
        
        return total`,
        solutionExplanation: 'Store points in a hash map with counts. For each query point, iterate through all stored points. If a point forms a valid diagonal (equal x and y distance, not same row/col), check if the other two corners exist. Multiply their counts.',
        timeComplexity: 'O(n) per count',
        spaceComplexity: 'O(n)',
        testCases: []
    }
];

// --- 18. Bit Manipulation ---
const BIT_MANIPULATION: Problem[] = [
    {
        id: 'single-number',
        title: 'Single Number',
        difficulty: 'Easy',
        functionName: 'singleNumber',
        description: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
        examples: [
            { input: 'nums = [2,2,1]', output: '1', explanation: '2 appears twice, 1 once.' },
            { input: 'nums = [4,1,2,1,2]', output: '4', explanation: '4 is the single one.' }
        ],
        starterCode: `from typing import List
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for num in nums:
            result ^= num
        return result`,
        solutionExplanation: 'Use XOR operation. XOR has properties: a ^ a = 0 and a ^ 0 = a. XORing all numbers cancels out duplicates, leaving only the single number.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[2,2,1]], expected: 1 }]
    },
    {
        id: 'number-of-1-bits',
        title: 'Number of 1 Bits',
        difficulty: 'Easy',
        functionName: 'hammingWeight',
        description: 'Write a function that takes an unsigned integer and returns the number of \'1\' bits it has (also known as the Hamming weight).',
        examples: [
            { input: 'n = 00000000000000000000000000001011', output: '3', explanation: 'Binary has 3 ones.' },
            { input: 'n = 00000000000000000000000010000000', output: '1', explanation: 'One 1.' }
        ],
        starterCode: `class Solution:
    def hammingWeight(self, n: int) -> int:
        pass`,
        solution: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1  # Clear the rightmost 1 bit
            count += 1
        return count`,
        solutionExplanation: 'Use Brian Kernighan\'s algorithm: n & (n-1) clears the rightmost 1 bit. Count how many times we can do this until n becomes 0. More efficient than checking each bit.',
        timeComplexity: 'O(k) where k is number of 1 bits',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'counting-bits',
        title: 'Counting Bits',
        difficulty: 'Easy',
        functionName: 'countBits',
        description: 'Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1\'s in the binary representation of i.',
        examples: [
            { input: 'n = 2', output: '[0,1,1]', explanation: '0->0, 1->1, 2->10(1).' },
            { input: 'n = 5', output: '[0,1,1,2,1,2]', explanation: '0 to 5 counts.' }
        ],
        starterCode: `from typing import List
class Solution:
    def countBits(self, n: int) -> List[int]:
        pass`,
        solution: `from typing import List
class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)
        return ans`,
        solutionExplanation: 'Use dynamic programming. For number i, count of 1s = count of (i//2) + (1 if i is odd else 0). i>>1 is i//2, and i&1 checks if last bit is 1. Build up from smaller numbers.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        testCases: [{ input: [2], expected: [0,1,1] }]
    },
    {
        id: 'reverse-bits',
        title: 'Reverse Bits',
        difficulty: 'Easy',
        functionName: 'reverseBits',
        description: 'Reverse bits of a given 32 bits unsigned integer.',
        examples: [
            { input: 'n = 00000010100101000001111010011100', output: '964176192', explanation: 'Reversed binary string value.' },
            { input: 'n = 11111111111111111111111111111101', output: '3221225471', explanation: 'Reversed.' }
        ],
        starterCode: `class Solution:
    def reverseBits(self, n: int) -> int:
        pass`,
        solution: `class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for i in range(32):
            bit = (n >> i) & 1
            result |= (bit << (31 - i))
        return result`,
        solutionExplanation: 'Iterate through all 32 bits. Extract each bit from position i using right shift and AND. Place it at position (31-i) in result using left shift and OR. This reverses the bit order.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        testCases: []
    },
    {
        id: 'missing-number',
        title: 'Missing Number',
        difficulty: 'Easy',
        functionName: 'missingNumber',
        description: 'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
        examples: [
            { input: 'nums = [3,0,1]', output: '2', explanation: 'Range [0,3]. 2 is missing.' },
            { input: 'nums = [0,1]', output: '2', explanation: 'Range [0,2]. 2 is missing.' }
        ],
        starterCode: `from typing import List
class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        pass`,
        solution: `from typing import List
class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        expected_sum = n * (n + 1) // 2
        actual_sum = sum(nums)
        return expected_sum - actual_sum`,
        solutionExplanation: 'Use Gauss formula: sum of 0 to n = n*(n+1)/2. Calculate expected sum and actual sum. The difference is the missing number. Alternative: XOR all indices and values.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [[3,0,1]], expected: 2 }]
    },
    {
        id: 'sum-two-integers',
        title: 'Sum of Two Integers',
        difficulty: 'Medium',
        functionName: 'getSum',
        description: 'Given two integers a and b, return the sum of the two integers without using the operators + and -.',
        examples: [
            { input: 'a = 1, b = 2', output: '3', explanation: '1+2=3.' },
            { input: 'a = 2, b = 3', output: '5', explanation: '2+3=5.' }
        ],
        starterCode: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        pass`,
        solution: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xFFFFFFFF
        
        while b != 0:
            carry = (a & b) << 1
            a = (a ^ b) & mask
            b = carry & mask
        
        # Handle negative numbers in Python
        return a if a <= 0x7FFFFFFF else ~(a ^ mask)`,
        solutionExplanation: 'Use bit manipulation: XOR gives sum without carry, AND gives carry positions. Shift carry left and repeat until no carry. Mask handles Python\'s arbitrary precision integers for 32-bit simulation.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [1, 2], expected: 3 }]
    },
    {
        id: 'reverse-integer',
        title: 'Reverse Integer',
        difficulty: 'Medium',
        functionName: 'reverse',
        description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
        examples: [
            { input: 'x = 123', output: '321', explanation: 'Digits reversed.' },
            { input: 'x = -123', output: '-321', explanation: 'Sign preserved.' }
        ],
        starterCode: `class Solution:
    def reverse(self, x: int) -> int:
        pass`,
        solution: `class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        x = abs(x)
        result = 0
        
        while x:
            digit = x % 10
            x //= 10
            
            # Check for overflow before adding digit
            if result > (2**31 - 1) // 10:
                return 0
            
            result = result * 10 + digit
        
        result *= sign
        
        # Check final bounds
        if result < -2**31 or result > 2**31 - 1:
            return 0
        
        return result`,
        solutionExplanation: 'Extract digits one by one using modulo and division. Build reversed number by multiplying by 10 and adding digit. Check for overflow before each operation. Handle sign separately.',
        timeComplexity: 'O(log x)',
        spaceComplexity: 'O(1)',
        testCases: [{ input: [123], expected: 321 }]
    }
];

// --- 19. Machine Learning ---
const MACHINE_LEARNING: Problem[] = [
  {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    difficulty: 'Easy',
    functionName: 'gradient_descent',
    visualization: 'gradient-descent',
    description: `Imagine you are standing on top of a mountain in dense fog, and you want to get to the lowest valley (minimum error). You can't see the bottom, but you can feel the slope of the ground under your feet.

**Gradient Descent** is the algorithm for taking steps downhill.
1. **Calculate Slope (Gradient)**: Determine which way is "down".
2. **Step Size (Learning Rate)**: Decide how big a step to take. Too big, and you might jump over the valley. Too small, and it takes forever.
3. **Update**: Move your position.
4. **Repeat**: Keep doing this until the ground is flat (slope is 0).

Your task is to implement this loop to find the minimum of a function f(x) = (x-3)^2.`,
    examples: [
      { input: 'start=10, lr=0.1, steps=100', output: 'approx 3.0', explanation: 'Converges to the minimum at x=3.' },
      { input: 'start=0, lr=0.01, steps=1000', output: 'approx 3.0', explanation: 'Smaller steps, but eventually reaches 3.' }
    ],
    constraints: ['steps > 0', 'lr > 0'],
    timeComplexity: 'O(steps)',
    spaceComplexity: 'O(1)',
    starterCode: `def gradient_descent(start_x: float, learning_rate: float, steps: int) -> float:
    # Derivative of (x-3)^2 is 2*(x-3)
    x = start_x
    for _ in range(steps):
        pass
    return x`,
    solution: `def gradient_descent(start_x: float, learning_rate: float, steps: int) -> float:
    x = start_x
    for _ in range(steps):
        gradient = 2 * (x - 3)  # Derivative of (x-3)^2
        x = x - learning_rate * gradient  # Update step
    return x`,
    solutionExplanation: 'Compute the gradient (derivative) at current position. The gradient tells us the direction of steepest ascent, so we subtract it to go downhill. Multiply by learning rate to control step size. Repeat until convergence.',
    testCases: []
  },
  {
      id: 'linear-regression-forward',
      title: 'Linear Regression (Forward)',
      difficulty: 'Easy',
      functionName: 'forward',
      visualization: 'linear-regression',
      description: 'Implement the forward pass for linear regression: y = wx + b. Given input x, weight w, and bias b, return the prediction.',
      examples: [
          { input: 'x=2, w=3, b=1', output: '7', explanation: '3*2 + 1 = 7' },
          { input: 'x=0, w=5, b=-2', output: '-2', explanation: '5*0 - 2 = -2' }
      ],
      starterCode: `def forward(x: float, w: float, b: float) -> float:
    pass`,
      solution: `def forward(x: float, w: float, b: float) -> float:
    return w * x + b`,
      solutionExplanation: 'Linear regression forward pass is simply y = wx + b. Multiply input by weight, add bias. This is the fundamental equation for a straight line.',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      testCases: [{ input: [2,3,1], expected: 7 }]
  },
  {
    id: 'linear-regression-training',
    title: 'Linear Regression (Training)',
    difficulty: 'Medium',
    functionName: 'train',
    visualization: 'linear-regression',
    description: `We have a scattering of data points, and we want to draw the "best fit" straight line through them. This line allows us to predict values for data we haven't seen yet.

The line is defined by y = wx + b.
- **w (weight)**: The slope of the line.
- **b (bias)**: Where the line crosses the y-axis.

We want to adjust w and b to minimize the distance between our line and the dots.

Task: Implement a training loop using PyTorch to find optimal w and b.`,
    examples: [
      { input: 'Data points around y=2x+1', output: 'w≈2, b≈1', explanation: 'The model learns the underlying pattern.' },
      { input: 'Data points around y=-x+5', output: 'w≈-1, b≈5', explanation: 'Negative slope learned.' }
    ],
    constraints: ['Use torch.optim', 'Use MSELoss'],
    timeComplexity: 'O(epochs * N)',
    spaceComplexity: 'O(1)',
    starterCode: `import torch
import torch.nn as nn
import torch.optim as optim

def train(X, y, epochs=100, lr=0.01):
    # X and y are torch tensors
    w = torch.randn(1, requires_grad=True)
    b = torch.randn(1, requires_grad=True)
    
    for epoch in range(epochs):
        # 1. Forward pass: y_pred = w*x + b
        # 2. Compute loss
        # 3. Backward pass
        # 4. Update parameters
        pass
    return w, b`,
    solution: `import torch
import torch.nn as nn
import torch.optim as optim

def train(X, y, epochs=100, lr=0.01):
    w = torch.randn(1, requires_grad=True)
    b = torch.randn(1, requires_grad=True)
    optimizer = optim.SGD([w, b], lr=lr)
    criterion = nn.MSELoss()
    
    for epoch in range(epochs):
        # Forward pass
        y_pred = w * X + b
        
        # Compute loss
        loss = criterion(y_pred, y)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        
        # Update parameters
        optimizer.step()
    
    return w, b`,
    solutionExplanation: 'Initialize w and b randomly. For each epoch: 1) Forward pass computes predictions. 2) Loss measures error (MSE). 3) Backward pass computes gradients. 4) Optimizer updates w and b. Gradients flow automatically via autograd.',
    testCases: []
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks (MLP)',
    difficulty: 'Easy',
    functionName: 'MLP',
    visualization: 'neural-network',
    description: `A Neural Network is inspired by the human brain. It consists of layers of "neurons" connected by "weights".

- **Input Layer**: Receives the raw data (like pixels of an image).
- **Hidden Layers**: The "thinking" part. They transform the data to find patterns.
- **Output Layer**: Gives the final answer (e.g., "Cat" or "Dog").

Data flows forward through the network (Forward Pass).
Task: Create a simple 3-layer network (Input -> Hidden -> Output) using torch.nn.`,
    examples: [
      { input: 'input_dim=10, hidden=5, output=1', output: 'Model Architecture', explanation: 'A standard MLP.' },
      { input: 'input_dim=784, hidden=128, output=10', output: 'Model Architecture', explanation: 'Typical for MNIST digit classification.' }
    ],
    constraints: ['Use torch.nn.Linear', 'Use ReLU activation'],
    timeComplexity: 'O(layers * neurons)',
    spaceComplexity: 'O(parameters)',
    starterCode: `import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        # Define layers here
        
    def forward(self, x):
        # Implement forward pass
        pass`,
    solution: `import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x`,
    solutionExplanation: 'Define two linear layers (fc1, fc2) and ReLU activation. Forward pass: input → fc1 → ReLU → fc2 → output. ReLU adds non-linearity, allowing the network to learn complex patterns. Without it, multiple linear layers collapse to a single linear transformation.',
    testCases: []
  },
  {
      id: 'pytorch-basics',
      title: 'PyTorch Basics',
      difficulty: 'Easy',
      functionName: 'tensor_ops',
      description: 'Create a tensor of shape (2,3) filled with ones, and then multiply it by 5.',
      examples: [
          { input: 'None', output: '[[5,5,5],[5,5,5]]', explanation: 'Ones * 5' }
      ],
      starterCode: `import torch
def tensor_ops():
    pass`,
      solution: `import torch
def tensor_ops():
    tensor = torch.ones(2, 3)
    result = tensor * 5
    return result`,
      solutionExplanation: 'torch.ones(2, 3) creates a 2x3 tensor filled with 1s. Multiply by 5 using standard Python operator. PyTorch supports element-wise operations on tensors.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      testCases: []
  },
  {
      id: 'digit-classifier',
      title: 'Digit Classifier',
      difficulty: 'Medium',
      functionName: 'DigitNet',
      visualization: 'neural-network',
      description: 'Build a neural network to classify MNIST digits. Input size is 784 (28x28 images), output is 10 classes.',
      examples: [
          { input: 'image tensor (1, 784)', output: 'tensor (1, 10)', explanation: 'Logits for 10 classes' }
      ],
      starterCode: `import torch.nn as nn
class DigitNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Add layers
        )
    def forward(self, x):
        return self.net(x)`,
      solution: `import torch.nn as nn
class DigitNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(784, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 10)
        )
    def forward(self, x):
        return self.net(x)`,
      solutionExplanation: 'Build a 3-layer MLP: 784 → 128 → 64 → 10. Input is flattened 28x28 image. Two hidden layers with ReLU. Output layer has 10 neurons (one per digit). Use nn.Sequential for clean architecture. No softmax needed (handled by loss function).',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      testCases: []
  },
  {
      id: 'pytorch-training',
      title: 'PyTorch Training Loop',
      difficulty: 'Medium',
      functionName: 'train_step',
      description: 'Implement a single training step: Zero gradients, Forward pass, Compute Loss, Backward pass, Optimizer step.',
      examples: [
          { input: 'model, x, y, optimizer, criterion', output: 'loss', explanation: 'Returns the loss value' }
      ],
      starterCode: `def train_step(model, x, y, optimizer, criterion):
    # Implement step
    return loss`,
      solution: `def train_step(model, x, y, optimizer, criterion):
    # Zero gradients from previous step
    optimizer.zero_grad()
    
    # Forward pass
    outputs = model(x)
    
    # Compute loss
    loss = criterion(outputs, y)
    
    # Backward pass (compute gradients)
    loss.backward()
    
    # Update weights
    optimizer.step()
    
    return loss.item()`,
      solutionExplanation: 'Standard PyTorch training step: 1) Zero gradients (they accumulate by default). 2) Forward pass through model. 3) Compute loss. 4) Backward pass computes gradients. 5) Optimizer updates weights using gradients. Return loss value for monitoring.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      testCases: []
  },
  {
      id: 'intro-nlp',
      title: 'Intro to NLP',
      difficulty: 'Easy',
      functionName: 'bag_of_words',
      description: 'Convert a sentence into a bag-of-words vector based on a vocabulary.',
      examples: [
          { input: 'vocab={"hello":0, "world":1}, sent="hello hello"', output: '[2, 0]', explanation: 'hello appears twice' }
      ],
      starterCode: `from typing import Dict, List
def bag_of_words(sentence: str, vocab: Dict[str, int]) -> List[int]:
    pass`,
      solution: `from typing import Dict, List
def bag_of_words(sentence: str, vocab: Dict[str, int]) -> List[int]:
    vector = [0] * len(vocab)
    words = sentence.lower().split()
    
    for word in words:
        if word in vocab:
            idx = vocab[word]
            vector[idx] += 1
    
    return vector`,
      solutionExplanation: 'Create a zero vector of vocab size. Split sentence into words. For each word in vocab, increment its position in the vector. This represents word frequency, ignoring order (hence "bag"). Simple but effective for basic NLP tasks.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(v)',
      testCases: []
  },
  {
      id: 'sentiment-analysis',
      title: 'Sentiment Analysis',
      difficulty: 'Medium',
      functionName: 'SentimentRNN',
      description: 'Build a simple RNN to classify sentiment (Positive/Negative).',
      examples: [
          { input: 'seq_len=10, batch=32', output: 'shape (32, 1)', explanation: 'Probability of positive sentiment' }
      ],
      starterCode: `import torch.nn as nn
class SentimentRNN(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        # Embedding, RNN, Linear
    def forward(self, x):
        pass`,
      solution: `import torch.nn as nn
class SentimentRNN(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.RNN(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        # x: (batch, seq_len)
        embedded = self.embedding(x)  # (batch, seq_len, embed_dim)
        output, hidden = self.rnn(embedded)  # output: (batch, seq_len, hidden)
        last_hidden = hidden[-1]  # (batch, hidden)
        out = self.fc(last_hidden)  # (batch, 1)
        return self.sigmoid(out)`,
      solutionExplanation: 'Embedding layer converts word indices to vectors. RNN processes sequence, maintaining hidden state. Use last hidden state for classification. Linear layer outputs single value. Sigmoid converts to probability (0-1). RNN captures sequential dependencies in text.',
      timeComplexity: 'O(seq_len × hidden_dim)',
      spaceComplexity: 'O(vocab_size × embed_dim)',
      testCases: []
  },
  {
      id: 'gpt-dataset',
      title: 'GPT Dataset',
      difficulty: 'Medium',
      functionName: 'get_batch',
      description: 'Implement a function to generate random batches of inputs (x) and targets (y) for language modeling. y is x shifted by one.',
      examples: [
        { input: 'data=[0,1,2,3,4], block_size=2', output: 'x=[0,1], y=[1,2]', explanation: 'Predict next token' }
      ],
      starterCode: `import torch
def get_batch(data, batch_size, block_size):
    pass`,
      solution: `import torch
def get_batch(data, batch_size, block_size):
    # Generate random starting indices
    ix = torch.randint(len(data) - block_size, (batch_size,))
    
    # Extract sequences
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    
    return x, y`,
      solutionExplanation: 'Generate random starting positions in data. For each position, extract block_size tokens for x. Target y is same sequence shifted by 1 (next token prediction). Stack into batches. This is how GPT learns: predict next token given context.',
      timeComplexity: 'O(batch_size × block_size)',
      spaceComplexity: 'O(batch_size × block_size)',
      testCases: []
  },
  {
    id: 'self-attention',
    title: 'Self-Attention',
    difficulty: 'Hard',
    functionName: 'SelfAttention',
    visualization: 'attention',
    description: `When you read the sentence "The animal didn't cross the street because **it** was too tired", how do you know what "**it**" refers to?

You intuitively pay attention to "animal" when reading "it". This is **Self-Attention**.
It allows a model to look at other words in the sentence to build context for the current word.

Mathematically, every word asks a question (Query) and checks every other word's answer (Key). If they match, they share information (Value).

Task: Implement the scaled dot-product attention mechanism.`,
    examples: [
      { input: 'Sequence of vectors', output: 'Context-aware vectors', explanation: 'Words now contain context from their neighbors.' },
      { input: 'Batch of sentences', output: 'Contextualized embeddings', explanation: 'Parallel processing of attention.' }
    ],
    constraints: ['Use torch.matmul', 'Softmax'],
    timeComplexity: 'O(T^2 * D)',
    spaceComplexity: 'O(T^2)',
    starterCode: `import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, embed_size, head_size):
        super().__init__()
        self.key = nn.Linear(embed_size, head_size, bias=False)
        self.query = nn.Linear(embed_size, head_size, bias=False)
        self.value = nn.Linear(embed_size, head_size, bias=False)

    def forward(self, x):
        # B: Batch, T: Time (Sequence Length), C: Channels (Embed Size)
        B, T, C = x.shape
        
        # 1. Compute Key, Query, Value
        # 2. Compute scores (Q @ K^T)
        # 3. Apply mask (optional) and Softmax
        # 4. Multiply by Value
        pass`,
    solution: `import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, embed_size, head_size):
        super().__init__()
        self.key = nn.Linear(embed_size, head_size, bias=False)
        self.query = nn.Linear(embed_size, head_size, bias=False)
        self.value = nn.Linear(embed_size, head_size, bias=False)
        self.head_size = head_size

    def forward(self, x):
        B, T, C = x.shape
        
        # Compute Q, K, V
        k = self.key(x)    # (B, T, head_size)
        q = self.query(x)  # (B, T, head_size)
        v = self.value(x)  # (B, T, head_size)
        
        # Compute attention scores
        scores = q @ k.transpose(-2, -1)  # (B, T, T)
        scores = scores / math.sqrt(self.head_size)  # Scale
        
        # Apply softmax
        attn_weights = torch.softmax(scores, dim=-1)  # (B, T, T)
        
        # Apply attention to values
        out = attn_weights @ v  # (B, T, head_size)
        
        return out`,
    solutionExplanation: 'Compute Q, K, V projections. Calculate attention scores: Q @ K^T (how much each token attends to others). Scale by sqrt(head_size) for stability. Softmax converts to probabilities. Multiply by V to get weighted sum. Each token now contains context from all others.',
    testCases: []
  },
  {
      id: 'multi-head-attention',
      title: 'Multi-Headed Self Attention',
      difficulty: 'Hard',
      functionName: 'MultiHeadAttention',
      visualization: 'attention',
      description: 'Implement Multi-Head Attention by running multiple self-attention heads in parallel and concatenating their outputs.',
      examples: [
          { input: 'x shape (B,T,C)', output: 'shape (B,T,C)', explanation: 'Context from multiple perspectives' }
      ],
      starterCode: `class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads, head_size):
        super().__init__()
        # Create heads
        # Proj layer
    def forward(self, x):
        pass`,
      solution: `import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads, head_size, embed_size):
        super().__init__()
        self.num_heads = num_heads
        self.head_size = head_size
        self.embed_size = embed_size
        
        # Create separate K, Q, V projections for each head
        self.keys = nn.ModuleList([
            nn.Linear(embed_size, head_size, bias=False) 
            for _ in range(num_heads)
        ])
        self.queries = nn.ModuleList([
            nn.Linear(embed_size, head_size, bias=False) 
            for _ in range(num_heads)
        ])
        self.values = nn.ModuleList([
            nn.Linear(embed_size, head_size, bias=False) 
            for _ in range(num_heads)
        ])
        
        # Output projection
        self.proj = nn.Linear(num_heads * head_size, embed_size)
    
    def forward(self, x):
        B, T, C = x.shape
        head_outputs = []
        
        # Run each attention head
        for i in range(self.num_heads):
            # Compute Q, K, V for this head
            k = self.keys[i](x)      # (B, T, head_size)
            q = self.queries[i](x)   # (B, T, head_size)
            v = self.values[i](x)    # (B, T, head_size)
            
            # Scaled dot-product attention
            scores = q @ k.transpose(-2, -1)  # (B, T, T)
            scores = scores / math.sqrt(self.head_size)
            attn_weights = torch.softmax(scores, dim=-1)
            head_out = attn_weights @ v  # (B, T, head_size)
            
            head_outputs.append(head_out)
        
        # Concatenate all heads
        out = torch.cat(head_outputs, dim=-1)  # (B, T, num_heads * head_size)
        
        # Project back to embed_size
        out = self.proj(out)  # (B, T, embed_size)
        return out`,
      solutionExplanation: 'Create separate K, Q, V projections for each head. For each head: compute attention scores, apply softmax, multiply by values. Concatenate all head outputs. Project back to original dimension. Multiple heads learn different attention patterns simultaneously.',
      timeComplexity: 'O(T^2 × D)',
      spaceComplexity: 'O(T^2)',
      testCases: []
  },
   {
    id: 'transformer-block',
    title: 'Transformer Block',
    difficulty: 'Medium',
    functionName: 'Block',
    description: `A Transformer is built by stacking many "Blocks".
Each block has two main parts:
1. **Communication**: The tokens talk to each other (Multi-Head Attention).
2. **Computation**: Each token thinks about what it learned (Feed Forward Network).

Crucially, we use **Residual Connections** (adding the input to the output) so gradients can flow easily during training.

Task: Assemble a Transformer block.`,
    examples: [
      { input: 'x (Batch, Time, Channel)', output: 'Same shape', explanation: 'Information is processed but shape stays constant.' },
      { input: 'x with mask', output: 'Same shape', explanation: 'Causal masking supported.' }
    ],
    constraints: ['LayerNorm', 'Residuals'],
    timeComplexity: 'O(C^2)',
    spaceComplexity: 'O(C)',
    starterCode: `import torch.nn as nn

class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        # self.sa = MultiHeadAttention(...)
        # self.ffwd = FeedForward(...)
        # self.ln1 = nn.LayerNorm(...)
        # self.ln2 = nn.LayerNorm(...)

    def forward(self, x):
        pass`,
    solution: `import torch
import torch.nn as nn
import math

class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        head_size = n_embd // n_head
        self.num_heads = n_head
        self.head_size = head_size
        
        # Multi-Head Attention components
        self.keys = nn.ModuleList([
            nn.Linear(n_embd, head_size, bias=False) 
            for _ in range(n_head)
        ])
        self.queries = nn.ModuleList([
            nn.Linear(n_embd, head_size, bias=False) 
            for _ in range(n_head)
        ])
        self.values = nn.ModuleList([
            nn.Linear(n_embd, head_size, bias=False) 
            for _ in range(n_head)
        ])
        self.attn_proj = nn.Linear(n_head * head_size, n_embd)
        
        # Feed Forward Network
        self.ffwd = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd)
        )
        
        # Layer Normalization
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)

    def forward(self, x):
        B, T, C = x.shape
        
        # Multi-Head Attention with residual
        x_norm = self.ln1(x)
        head_outputs = []
        
        for i in range(self.num_heads):
            k = self.keys[i](x_norm)
            q = self.queries[i](x_norm)
            v = self.values[i](x_norm)
            
            scores = q @ k.transpose(-2, -1) / math.sqrt(self.head_size)
            attn_weights = torch.softmax(scores, dim=-1)
            head_out = attn_weights @ v
            head_outputs.append(head_out)
        
        attn_out = torch.cat(head_outputs, dim=-1)
        attn_out = self.attn_proj(attn_out)
        x = x + attn_out  # Residual connection
        
        # Feed Forward with residual
        x = x + self.ffwd(self.ln2(x))  # Residual connection
        
        return x`,
    solutionExplanation: 'Complete Transformer block with inline multi-head attention. LayerNorm → Multi-Head Attention (with K,Q,V for each head) → Residual. Then LayerNorm → FeedForward (expand 4x, ReLU, project back) → Residual. Residuals enable gradient flow. This is GPT\'s core building block.',
    testCases: []
  },
  {
      id: 'code-gpt',
      title: 'Code GPT',
      difficulty: 'Hard',
      functionName: 'GPT',
      description: 'Assemble the full GPT model: Embeddings -> Blocks -> LayerNorm -> Linear Head.',
      examples: [
          { input: 'idx (B, T)', output: 'logits (B, T, Vocab)', explanation: 'Predicts next token probabilities' }
      ],
      starterCode: `class GPT(nn.Module):
    def __init__(self):
        super().__init__()
        # Assemble parts
    def forward(self, idx, targets=None):
        pass`,
      solution: `import torch.nn as nn

class GPT(nn.Module):
    def __init__(self, vocab_size, n_embd, n_head, n_layer, block_size):
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, n_embd)
        self.position_embedding = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head) for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)
        
    def forward(self, idx, targets=None):
        B, T = idx.shape
        
        # Embeddings
        tok_emb = self.token_embedding(idx)  # (B, T, n_embd)
        pos_emb = self.position_embedding(torch.arange(T, device=idx.device))  # (T, n_embd)
        x = tok_emb + pos_emb  # (B, T, n_embd)
        
        # Transformer blocks
        x = self.blocks(x)
        x = self.ln_f(x)
        
        # Language model head
        logits = self.lm_head(x)  # (B, T, vocab_size)
        
        return logits`,
      solutionExplanation: 'Full GPT architecture: Token + Position embeddings give each token identity and location. Stack of Transformer blocks process information. Final LayerNorm. Linear head projects to vocabulary for next-token prediction. This is the complete autoregressive language model.',
      timeComplexity: 'O(n_layer × T^2 × n_embd)',
      spaceComplexity: 'O(vocab_size × n_embd)',
      testCases: []
  },
  {
      id: 'make-gpt-talk',
      title: 'Make GPT Talk Back',
      difficulty: 'Hard',
      functionName: 'generate',
      description: 'Implement the generation loop. Take the current context, predict the next token, sample from the distribution, append to context, and repeat.',
      examples: [
          { input: 'context="Hello"', output: '"Hello world"', explanation: 'Autoregressive generation' }
      ],
      starterCode: `def generate(model, idx, max_new_tokens):
    for _ in range(max_new_tokens):
        # Get preds
        # Sample
        # Append
        pass
    return idx`,
      solution: `import torch

def generate(model, idx, max_new_tokens, block_size):
    model.eval()
    for _ in range(max_new_tokens):
        # Crop context to block_size
        idx_cond = idx[:, -block_size:]
        
        # Get predictions
        with torch.no_grad():
            logits = model(idx_cond)
        
        # Focus on last time step
        logits = logits[:, -1, :]  # (B, vocab_size)
        
        # Apply softmax to get probabilities
        probs = torch.softmax(logits, dim=-1)
        
        # Sample from distribution
        idx_next = torch.multinomial(probs, num_samples=1)  # (B, 1)
        
        # Append to sequence
        idx = torch.cat((idx, idx_next), dim=1)  # (B, T+1)
    
    return idx`,
      solutionExplanation: 'Autoregressive generation: 1) Crop context to max length. 2) Get model predictions. 3) Take last token logits. 4) Convert to probabilities with softmax. 5) Sample next token. 6) Append to sequence. Repeat. This is how GPT generates text one token at a time.',
      timeComplexity: 'O(max_new_tokens × T^2)',
      spaceComplexity: 'O(T)',
      testCases: []
  }
];

export const CATEGORIES: Category[] = [
    { id: 'arrays', name: 'Arrays & Hashing', problems: ARRAYS },
    { id: 'two-pointers', name: 'Two Pointers', problems: TWO_POINTERS },
    { id: 'sliding-window', name: 'Sliding Window', problems: SLIDING_WINDOW },
    { id: 'stack', name: 'Stack', problems: STACK },
    { id: 'binary-search', name: 'Binary Search', problems: BINARY_SEARCH },
    { id: 'linked-list', name: 'Linked List', problems: LINKED_LIST },
    { id: 'trees', name: 'Trees', problems: TREES },
    { id: 'heap', name: 'Heap / Priority Queue', problems: HEAP },
    { id: 'backtracking', name: 'Backtracking', problems: BACKTRACKING },
    { id: 'tries', name: 'Tries', problems: TRIES },
    { id: 'graph', name: 'Graph', problems: GRAPH },
    { id: 'advanced-graph', name: 'Advanced Graph', problems: ADVANCED_GRAPH },
    { id: 'dp-1d', name: '1-D Dynamic Programming', problems: DP_1D },
    { id: 'dp-2d', name: '2-D Dynamic Programming', problems: DP_2D },
    { id: 'greedy', name: 'Greedy', problems: GREEDY },
    { id: 'intervals', name: 'Intervals', problems: INTERVALS },
    { id: 'math', name: 'Math & Geometry', problems: MATH },
    { id: 'bit-manipulation', name: 'Bit Manipulation', problems: BIT_MANIPULATION },
    { id: 'machine-learning', name: 'Machine Learning', problems: MACHINE_LEARNING }
];