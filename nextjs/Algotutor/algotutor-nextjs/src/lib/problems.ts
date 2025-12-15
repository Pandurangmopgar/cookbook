export interface TestCase {
  input: any[];
  expected: any;
  description?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  functionName: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  concepts: string[];
  commonMistakes: string[];
  // Solution reveal fields
  solution?: string;
  solutionExplanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'easy',
    category: 'Binary Search',
    functionName: 'binary_search',
    description: `Given a sorted array of integers \`nums\` and a target value \`target\`, return the index of \`target\` if it exists in the array, otherwise return \`-1\`.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums at index 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums' },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique',
      'nums is sorted in ascending order',
    ],
    starterCode: `def binary_search(nums, target):
    """
    Find target in sorted array nums.
    Return index if found, -1 otherwise.
    """
    # Your code here
    pass`,
    solution: `def binary_search(nums, target):
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
    testCases: [
      { input: [[-1,0,3,5,9,12], 9], expected: 4 },
      { input: [[-1,0,3,5,9,12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[2,5], 5], expected: 1 },
      { input: [[1,2,3,4,5,6,7,8,9,10], 1], expected: 0 },
    ],
    hints: [
      'Think about how you would search for a word in a dictionary - you don\'t start from page 1!',
      'What if you always looked at the middle element first?',
      'If the middle element is too big, which half should you search next?',
      'You need two pointers: one for the start, one for the end of your search range',
      'The loop should continue while left <= right',
    ],
    concepts: ['binary search', 'divide and conquer', 'logarithmic time'],
    commonMistakes: [
      'Using left < right instead of left <= right (misses single element)',
      'Calculating mid as (left + right) / 2 (can overflow in some languages)',
      'Not updating left/right correctly after comparison',
      'Infinite loop due to wrong pointer updates',
    ],
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Hash Map',
    functionName: 'two_sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

You may assume each input has exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists',
    ],
    starterCode: `def two_sum(nums, target):
    """
    Find two numbers that add up to target.
    Return their indices.
    """
    # Your code here
    pass`,
    solution: `def two_sum(nums, target):
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
    testCases: [
      { input: [[2,7,11,15], 9], expected: [0, 1] },
      { input: [[3,2,4], 6], expected: [1, 2] },
      { input: [[3,3], 6], expected: [0, 1] },
    ],
    hints: [
      'The brute force approach checks every pair - can you do better?',
      'For each number, what other number would you need to reach the target?',
      'How can you quickly check if a number exists in the array?',
      'A hash map (dictionary) allows O(1) lookups!',
      'Store numbers you\'ve seen and their indices as you iterate',
    ],
    concepts: ['hash map', 'complement', 'one-pass solution'],
    commonMistakes: [
      'Using the same element twice',
      'Not handling duplicate values correctly',
      'Returning values instead of indices',
      'Using nested loops when hash map is more efficient',
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    category: 'Stack',
    functionName: 'is_valid',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

A string is valid if:
1. Open brackets are closed by the same type of brackets
2. Open brackets are closed in the correct order
3. Every close bracket has a corresponding open bracket`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only',
    ],
    starterCode: `def is_valid(s):
    """
    Check if parentheses string is valid.
    Return True if valid, False otherwise.
    """
    # Your code here
    pass`,
    solution: `def is_valid(s):
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
    testCases: [
      { input: ['()'], expected: true },
      { input: ['()[]{}'], expected: true },
      { input: ['(]'], expected: false },
      { input: ['([)]'], expected: false },
      { input: ['{[]}'], expected: true },
      { input: [''], expected: true },
    ],
    hints: [
      'What data structure follows "last in, first out" order?',
      'When you see an opening bracket, what should you do with it?',
      'When you see a closing bracket, what should match it?',
      'A stack is perfect for matching pairs!',
      'Don\'t forget to check if the stack is empty at the end',
    ],
    concepts: ['stack', 'matching pairs', 'LIFO'],
    commonMistakes: [
      'Not checking if stack is empty before popping',
      'Forgetting to check if stack is empty at the end',
      'Wrong bracket matching logic',
      'Not handling empty string case',
    ],
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    functionName: 'max_subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    starterCode: `def max_subarray(nums):
    """
    Find the contiguous subarray with largest sum.
    Return the maximum sum.
    """
    # Your code here
    pass`,
    solution: `def max_subarray(nums):
    max_sum = nums[0]
    current_sum = nums[0]
    
    for i in range(1, len(nums)):
        # Either extend the previous subarray or start fresh
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum`,
    solutionExplanation: "Kadane's algorithm: At each position, we decide whether to extend the previous subarray or start a new one. If the previous sum is negative, it's better to start fresh. We track both the current running sum and the maximum sum seen so far. This greedy approach works because a negative prefix can never improve our answer.",
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5,4,-1,7,8]], expected: 23 },
      { input: [[-1]], expected: -1 },
      { input: [[-2,-1]], expected: -1 },
    ],
    hints: [
      'Think about it: at each position, you have a choice...',
      'Should you extend the previous subarray or start fresh?',
      'If the previous sum is negative, is it worth keeping?',
      'This is Kadane\'s algorithm - track current sum and max sum',
      'current_sum = max(num, current_sum + num)',
    ],
    concepts: ['dynamic programming', 'Kadane\'s algorithm', 'greedy'],
    commonMistakes: [
      'Initializing max_sum to 0 (fails for all-negative arrays)',
      'Not considering starting a new subarray',
      'Trying to track subarray indices when only sum is needed',
      'Using O(n²) brute force instead of O(n) DP',
    ],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    category: 'Linked List',
    functionName: 'reverse_list',
    description: `Given the head of a singly linked list, reverse the list and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes is in range [0, 5000]',
      '-5000 <= Node.val <= 5000',
    ],
    starterCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    """
    Reverse a singly linked list.
    Return the new head.
    """
    # Your code here
    pass`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    current = head
    
    while current:
        next_node = current.next  # Save next
        current.next = prev       # Reverse pointer
        prev = current            # Move prev forward
        current = next_node       # Move current forward
    
    return prev`,
    solutionExplanation: 'We use three pointers: prev (initially None), current (starts at head), and next_node (temporary). For each node, we save its next pointer, reverse its pointer to point to prev, then advance both prev and current. When current becomes None, prev points to the new head (the original tail).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
      { input: [[1,2]], expected: [2,1] },
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
    ],
    hints: [
      'You need to change where each node points to',
      'What happens if you just change one pointer? You lose the rest!',
      'You need to save the "next" node before changing the pointer',
      'Use three pointers: prev, current, and next',
      'prev starts as None, current starts as head',
    ],
    concepts: ['linked list', 'pointer manipulation', 'iterative vs recursive'],
    commonMistakes: [
      'Losing reference to the rest of the list',
      'Not handling empty list or single node',
      'Returning wrong node as new head',
      'Infinite loop due to not advancing pointers',
    ],
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find(p => p.id === id);
}

export function getProblemsByCategory(category: string): Problem[] {
  return PROBLEMS.filter(p => p.category === category);
}

export function getCategories(): string[] {
  return Array.from(new Set(PROBLEMS.map(p => p.category)));
}


// Additional problems
export const MORE_PROBLEMS: Problem[] = [
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    functionName: 'climb_stairs',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1' },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: `def climb_stairs(n):
    """
    Return the number of distinct ways to climb n stairs.
    """
    # Your code here
    pass`,
    solution: `def climb_stairs(n):
    if n <= 2:
        return n
    
    prev2, prev1 = 1, 2
    
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1`,
    solutionExplanation: 'This is essentially the Fibonacci sequence! To reach step n, you can come from step n-1 (1 step) or step n-2 (2 steps). So ways(n) = ways(n-1) + ways(n-2). We use two variables to track the previous two values, avoiding the overhead of recursion or an array.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [4], expected: 5 },
      { input: [5], expected: 8 },
    ],
    hints: [
      'Think about how you reach step n - where could you have come from?',
      'You can reach step n from step n-1 (1 step) or step n-2 (2 steps)',
      'This means ways(n) = ways(n-1) + ways(n-2)',
      'Does this pattern remind you of something? (Fibonacci!)',
      'You can solve this iteratively to avoid recursion overhead',
    ],
    concepts: ['dynamic programming', 'fibonacci', 'memoization'],
    commonMistakes: [
      'Using pure recursion without memoization (exponential time)',
      'Off-by-one errors in base cases',
      'Not handling n=1 case correctly',
    ],
  },
  {
    id: 'merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'easy',
    category: 'Two Pointers',
    functionName: 'merge_arrays',
    description: `Given two sorted integer arrays \`nums1\` and \`nums2\`, merge them into a single sorted array.

Return the merged array.`,
    examples: [
      { input: 'nums1 = [1,2,4], nums2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'nums1 = [1], nums2 = []', output: '[1]' },
    ],
    constraints: [
      '0 <= nums1.length, nums2.length <= 200',
      '-10^9 <= nums1[i], nums2[i] <= 10^9',
      'Both arrays are sorted in non-decreasing order',
    ],
    starterCode: `def merge_arrays(nums1, nums2):
    """
    Merge two sorted arrays into one sorted array.
    """
    # Your code here
    pass`,
    solution: `def merge_arrays(nums1, nums2):
    result = []
    i, j = 0, 0
    
    while i < len(nums1) and j < len(nums2):
        if nums1[i] <= nums2[j]:
            result.append(nums1[i])
            i += 1
        else:
            result.append(nums2[j])
            j += 1
    
    # Add remaining elements
    result.extend(nums1[i:])
    result.extend(nums2[j:])
    
    return result`,
    solutionExplanation: 'We use two pointers, one for each array. At each step, we compare the elements at both pointers and add the smaller one to our result. After one array is exhausted, we append all remaining elements from the other array. This is the merge step from merge sort.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    testCases: [
      { input: [[1,2,4], [1,3,4]], expected: [1,1,2,3,4,4] },
      { input: [[1], []], expected: [1] },
      { input: [[], [1]], expected: [1] },
      { input: [[1,3,5], [2,4,6]], expected: [1,2,3,4,5,6] },
    ],
    hints: [
      'Since both arrays are sorted, think about which element should come first',
      'Use two pointers, one for each array',
      'Compare elements at both pointers, take the smaller one',
      'Don\'t forget to handle when one array is exhausted',
    ],
    concepts: ['two pointers', 'merge sort', 'sorted arrays'],
    commonMistakes: [
      'Not handling empty arrays',
      'Forgetting to add remaining elements after one array is done',
      'Index out of bounds errors',
    ],
  },
];

// Add more problems to the main list
PROBLEMS.push(...MORE_PROBLEMS);
