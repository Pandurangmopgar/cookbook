import { Problem } from '@/types';

// Interview-specific problem type with additional fields
export interface InterviewProblem extends Problem {
  company?: string[];
  frequency?: 'high' | 'medium' | 'low';
  followUps?: string[];
  interviewTips?: string[];
  timeLimit?: number; // in minutes
}

// Common coding interview problems organized by pattern
export const INTERVIEW_PROBLEMS: InterviewProblem[] = [
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    functionName: 'reverseList',
    company: ['Meta', 'Amazon', 'Microsoft', 'Google'],
    frequency: 'high',
    timeLimit: 15,
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

This is one of the most common interview questions. Interviewers often ask follow-ups about iterative vs recursive approaches.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'The list is reversed.' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' }
    ],
    constraints: ['The number of nodes is in range [0, 5000]', '-5000 <= Node.val <= 5000'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) iterative, O(n) recursive',
    starterCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        pass`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None
        curr = head
        
        while curr:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        
        return prev`,
    solutionExplanation: 'Use three pointers: prev, curr, and next_temp. For each node, save the next pointer, reverse the current pointer to point to prev, then advance both prev and curr.',
    testCases: [
      { input: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
      { input: [[1,2]], expected: [2,1] }
    ],
    followUps: [
      'Can you do it recursively?',
      'What if you need to reverse only a portion of the list (between positions m and n)?',
      'How would you reverse in groups of k?'
    ],
    interviewTips: [
      'Draw the pointers on a whiteboard first',
      'Walk through with a small example (3 nodes)',
      'Mention both iterative and recursive approaches',
      'Discuss trade-offs: iterative is O(1) space, recursive is O(n) stack space'
    ]
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    functionName: 'mergeTwoLists',
    company: ['Amazon', 'Microsoft', 'Apple', 'Bloomberg'],
    frequency: 'high',
    timeLimit: 15,
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' }
    ],
    starterCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1: ListNode, list2: ListNode) -> ListNode:
        pass`,
    solution: `class Solution:
    def mergeTwoLists(self, list1: ListNode, list2: ListNode) -> ListNode:
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
    solutionExplanation: 'Use a dummy node to simplify edge cases. Compare nodes from both lists, attach the smaller one to result, advance that pointer. When one list is exhausted, attach the remaining list.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: [[1,2,4], [1,3,4]], expected: [1,1,2,3,4,4] }
    ],
    followUps: [
      'What if you need to merge k sorted lists?',
      'Can you do it recursively?'
    ],
    interviewTips: [
      'Use a dummy node to avoid edge cases with empty lists',
      'This is the merge step of merge sort',
      'Mention the k-lists follow-up uses a heap'
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    functionName: 'isValid',
    company: ['Amazon', 'Meta', 'Bloomberg', 'Google'],
    frequency: 'high',
    timeLimit: 10,
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
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
                if not stack or stack[-1] != mapping[char]:
                    return False
                stack.pop()
            else:
                stack.append(char)
        
        return len(stack) == 0`,
    solutionExplanation: 'Use a stack. Push opening brackets. For closing brackets, check if top of stack matches. If not, invalid. At end, stack should be empty.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [
      { input: ['()'], expected: true },
      { input: ['()[]{}'], expected: true },
      { input: ['(]'], expected: false }
    ],
    followUps: [
      'What if you need to find the minimum number of insertions to make it valid?',
      'What if you need to remove minimum brackets to make it valid?'
    ],
    interviewTips: [
      'Classic stack problem - mention LIFO property',
      'Use a hash map for bracket matching',
      'Don\'t forget to check if stack is empty at the end'
    ]
  },

  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'Medium',
    functionName: 'LRUCache',
    company: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Apple'],
    frequency: 'high',
    timeLimit: 25,
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if it exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if it exists. Otherwise, add the key-value pair. If the number of keys exceeds the capacity, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.`,
    examples: [
      { 
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"][[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', 
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]' 
      }
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
        self.capacity = capacity
        self.cache = OrderedDict()

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
    solutionExplanation: 'Use OrderedDict (or implement with HashMap + Doubly Linked List). OrderedDict maintains insertion order. move_to_end() marks as recently used. popitem(last=False) removes least recently used.',
    timeComplexity: 'O(1) for both get and put',
    spaceComplexity: 'O(capacity)',
    testCases: [],
    followUps: [
      'Implement without using OrderedDict (use HashMap + Doubly Linked List)',
      'How would you implement LFU (Least Frequently Used) cache?',
      'How would you make this thread-safe?'
    ],
    interviewTips: [
      'This is a VERY common interview question',
      'Know both OrderedDict solution and manual implementation',
      'Draw the doubly linked list structure',
      'Explain why you need both HashMap and LinkedList'
    ]
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    functionName: 'numIslands',
    company: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Bloomberg'],
    frequency: 'high',
    timeLimit: 20,
    description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      { 
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', 
        output: '1' 
      },
      { 
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', 
        output: '3' 
      }
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
        
        count = 0
        rows, cols = len(grid), len(grid[0])
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0':
                return
            grid[r][c] = '0'  # Mark as visited
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
    solutionExplanation: 'Use DFS/BFS to explore each island. When we find a "1", increment count and use DFS to mark all connected land as visited (change to "0"). This prevents counting the same island twice.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n) worst case for recursion stack',
    testCases: [],
    followUps: [
      'What if you can\'t modify the input grid?',
      'How would you find the maximum area of an island?',
      'What if islands can be connected diagonally?'
    ],
    interviewTips: [
      'Classic graph traversal problem',
      'Mention both DFS and BFS approaches',
      'Discuss space complexity of recursion vs iteration',
      'Ask if you can modify the input grid'
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    functionName: 'coinChange',
    company: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    frequency: 'high',
    timeLimit: 20,
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' }
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
        
        for coin in coins:
            for x in range(coin, amount + 1):
                dp[x] = min(dp[x], dp[x - coin] + 1)
        
        return dp[amount] if dp[amount] != float('inf') else -1`,
    solutionExplanation: 'Classic DP problem. dp[i] = minimum coins needed for amount i. For each coin, update dp[x] = min(dp[x], dp[x-coin] + 1). This is unbounded knapsack pattern.',
    timeComplexity: 'O(amount * len(coins))',
    spaceComplexity: 'O(amount)',
    testCases: [
      { input: [[1,2,5], 11], expected: 3 },
      { input: [[2], 3], expected: -1 }
    ],
    followUps: [
      'What if you need to count the number of ways to make the amount?',
      'What if each coin can only be used once?'
    ],
    interviewTips: [
      'Recognize this as unbounded knapsack',
      'Explain the recurrence relation clearly',
      'Mention greedy doesn\'t work (counterexample: coins=[1,3,4], amount=6)'
    ]
  }
];

// Interview categories
export interface InterviewCategory {
  id: string;
  name: string;
  description: string;
  problems: InterviewProblem[];
}

export const INTERVIEW_CATEGORIES: InterviewCategory[] = [
  {
    id: 'arrays-strings',
    name: 'Arrays & Strings',
    description: 'Foundation problems - most common in interviews',
    problems: INTERVIEW_PROBLEMS.filter(p => ['two-sum', 'valid-parentheses'].includes(p.id))
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Pointer manipulation and list operations',
    problems: INTERVIEW_PROBLEMS.filter(p => ['reverse-linked-list', 'merge-two-sorted-lists'].includes(p.id))
  },
  {
    id: 'graphs-trees',
    name: 'Graphs & Trees',
    description: 'DFS, BFS, and tree traversals',
    problems: INTERVIEW_PROBLEMS.filter(p => ['number-of-islands'].includes(p.id))
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimization and counting problems',
    problems: INTERVIEW_PROBLEMS.filter(p => ['coin-change'].includes(p.id))
  },
  {
    id: 'system-design-coding',
    name: 'Design Problems',
    description: 'Data structure design questions',
    problems: INTERVIEW_PROBLEMS.filter(p => ['lru-cache'].includes(p.id))
  }
];

export function getInterviewProblemById(id: string): InterviewProblem | undefined {
  return INTERVIEW_PROBLEMS.find(p => p.id === id);
}
