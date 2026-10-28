/* Maths mock-test banks, added to window.PhysicaMockBank after tutor-exam.js (same bundle). */
(() => {
'use strict';
window.PhysicaMockBank=window.PhysicaMockBank||{};
Object.assign(window.PhysicaMockBank,{
'Sets, Relations and Functions':{
  topics:{sets:'Sets and Venn diagrams',rel:'Relations',func:'Functions',dr:'Domain, range and graphs'},
  jee:[
    {tp:'sets',q:"In a survey, n(A) = 40, n(B) = 35 and n(A ∩ B) = 15. Then n(A ∪ B) is:",o:["60","75","50","90"],c:0,s:"n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = 40 + 35 − 15 = 60."},
    {tp:'sets',q:"The number of subsets of {1, 2, 3, 4, 5, 6} that contain 1 and 2 but do not contain 3 is:",o:["16","8","4","12"],c:1,s:"1 and 2 are fixed in, 3 is fixed out. Each of the remaining 4, 5, 6 may be in or out: 2³ = 8."},
    {tp:'sets',q:"The number of non-empty proper subsets of a set with 6 elements is:",o:["64","63","62","60"],c:2,s:"Total subsets 2⁶ = 64. Remove the empty set and the set itself: 64 − 2 = 62."},
    {tp:'sets',q:"In a class of 100 students, 60 like tea, 50 like coffee and 20 like neither. The number who like both is:",o:["10","40","20","30"],c:3,s:"Like at least one = 100 − 20 = 80. Both = 60 + 50 − 80 = 30."},
    {tp:'sets',q:"For any sets A and B, the set A ∩ (A ∪ B)′ equals:",o:["∅","A","B′","A ∩ B′"],c:0,s:"(A ∪ B)′ = A′ ∩ B′ (De Morgan). Then A ∩ A′ ∩ B′ = ∅."},
    {tp:'sets',q:"If A = {x ∈ ℕ : x² < 30}, the number of elements of the power set of A is:",o:["25","32","64","30"],c:1,s:"x² < 30 gives x = 1, 2, 3, 4, 5, so n(A) = 5 and n(P(A)) = 2⁵ = 32."},
    {tp:'sets',q:"If n(A) = 12, n(B) = 9 and n(A ∩ B) = 4, then the number of elements in the symmetric difference A △ B (elements in exactly one of A, B) is:",o:["17","21","13","9"],c:2,s:"n(A △ B) = n(A) + n(B) − 2n(A ∩ B) = 12 + 9 − 8 = 13."},
    {tp:'sets',q:"The number of ordered pairs (X, Y) of subsets of {1, 2, 3, 4} with X ∪ Y = {1, 2, 3, 4} is:",o:["64","256","16","81"],c:3,s:"Each element lies in X only, Y only, or both (not in neither): 3 choices. Total 3⁴ = 81."},
    {tp:'sets',q:"For three sets, n(A) = 21, n(B) = 17, n(C) = 11, n(A ∩ B) = 7, n(B ∩ C) = 6, n(A ∩ C) = 5 and n(A ∩ B ∩ C) = 2. Find n(A ∪ B ∪ C). Give the answer as an integer.",n:33,s:"Sum of singles = 49; subtract pair overlaps (18) = 31; add the triple overlap 2: 33."},
    {tp:'sets',q:"Find the number of subsets of {1, 2, ..., 10} (including the empty set) that contain no two consecutive integers. Give the answer as an integer.",n:144,s:"Let a(n) = a(n−1) + a(n−2) (n in the set or not), a(0) = 1, a(1) = 2. Then a(2) = 3, 5, 8, 13, 21, 34, 55, 89, a(10) = 144."},
    {tp:'sets',q:"The number of even integers in the set {x ∈ ℤ : |x − 2| ≤ 5} is. Give the answer as an integer.",n:5,s:"−3 ≤ x ≤ 7. Even values: −2, 0, 2, 4, 6, which is 5."},
    {tp:'rel',q:"The number of relations from the set A = {1, 2, 3} to itself is:",o:["512","9","64","256"],c:0,s:"A × A has 9 elements; each relation is a subset: 2⁹ = 512."},
    {tp:'rel',q:"On A = {1, 2, 3}, R = {(1,1), (2,2), (3,3), (1,2), (2,3)}. The minimum number of ordered pairs to be added so that R becomes an equivalence relation is:",o:["2","4","3","6"],c:1,s:"R is reflexive. For symmetry add (2,1), (3,2). Transitivity then forces (1,3) and (3,1). Total 4 pairs."},
    {tp:'rel',q:"On ℕ, define a R b if a divides b. Then R is:",o:["an equivalence relation","symmetric and transitive but not reflexive","reflexive and transitive but not symmetric","reflexive and symmetric but not transitive"],c:2,s:"a | a, so reflexive. a | b and b | c give a | c. But 2 | 4 while 4 ∤ 2, so not symmetric."},
    {tp:'rel',q:"The number of reflexive relations on a set of 3 elements is:",o:["512","8","63","64"],c:3,s:"The 3 pairs (a,a) must be present; the other 6 pairs are free: 2⁶ = 64."},
    {tp:'rel',q:"The number of symmetric relations on a set of 4 elements is:",o:["1024","65536","4096","256"],c:0,s:"Choose each of the 4 pairs (a,a) and each of the 6 unordered pairs {a,b}: 10 free choices, 2¹⁰ = 1024."},
    {tp:'rel',q:"The number of equivalence relations on {1, 2, 3} is:",o:["3","5","6","8"],c:1,s:"Equivalence relations correspond to partitions: {123}, {1|23}, {2|13}, {3|12}, {1|2|3}: 5."},
    {tp:'rel',q:"On ℝ define x R y if xy ≥ 0. Then R is:",o:["an equivalence relation","symmetric only","reflexive and symmetric but not transitive","transitive only"],c:2,s:"x·x ≥ 0 and xy = yx, so reflexive and symmetric. But 1 R 0 and 0 R (−1) while 1·(−1) < 0, so not transitive."},
    {tp:'rel',q:"Find the number of antisymmetric relations on a set of 3 elements. Give the answer as an integer.",n:216,s:"Each (a,a) is free: 2³. For each of the 3 unordered pairs {a,b}, choose none, (a,b) or (b,a) only: 3³. Total 8 × 27 = 216."},
    {tp:'rel',q:"On {1, 2, ..., 20}, a R b if a − b is divisible by 6. How many elements are in the equivalence class of 4? Give the answer as an integer.",n:3,s:"Elements ≡ 4 (mod 6): 4, 10, 16. So 3."},
    {tp:'rel',q:"Let R = {(a, b) : a, b ∈ {1, 2, ..., 6}, a + b is divisible by 3}. Find n(R). Give the answer as an integer.",n:12,s:"Residues mod 3 each occur twice. a+b ≡ 0: (0,0): 2×2 = 4, (1,2): 4, (2,1): 4. Total 12."},
    {tp:'rel',q:"Find the number of equivalence relations on {1, 2, 3, 4} that have exactly two equivalence classes. Give the answer as an integer.",n:7,s:"Partitions into 2 blocks: sizes 1+3 (4 ways) and 2+2 (3 ways): 7."},
    {tp:'func',q:"The number of functions from a set with 3 elements to a set with 4 elements is:",o:["12","81","24","64"],c:3,s:"Each of 3 elements has 4 possible images: 4³ = 64."},
    {tp:'func',q:"The number of one-one functions from {1, 2, 3} to {1, 2, 3, 4, 5} is:",o:["60","125","10","15"],c:0,s:"5 × 4 × 3 = 60."},
    {tp:'func',q:"The number of onto functions from a 4-element set to a 3-element set is:",o:["81","36","24","72"],c:1,s:"Total 3⁴ = 81. Subtract those missing at least one image: 3·2⁴ − 3·1 = 45. So 81 − 45 = 36."},
    {tp:'func',q:"If f(x) = 3x − 2 and g(x) = x² + 1, then (g ∘ f)(2) is:",o:["13","5","17","37"],c:2,s:"f(2) = 4, g(4) = 17."},
    {tp:'func',q:"If f(x) = (2x + 3)/(x − 1), x ≠ 1, then f⁻¹(x) is:",o:["(x − 3)/(x − 2)","(x + 3)/(x + 2)","(2x + 3)/(x − 1)","(x + 3)/(x − 2)"],c:3,s:"y = (2x+3)/(x−1) gives xy − y = 2x + 3, so x(y − 2) = y + 3, x = (y+3)/(y−2)."},
    {tp:'func',q:"Which of the following functions from ℝ to ℝ is both one-one and onto?",o:["f(x) = x³","f(x) = x²","f(x) = |x|","f(x) = sin x"],c:0,s:"x² and |x| are many-one (f(−1) = f(1)) and not onto; sin x is many-one and its range is [−1, 1]. x³ is strictly increasing with range ℝ."},
    {tp:'func',q:"The function f : [3, ∞) → B, f(x) = x² − 6x + 11, is onto if B equals:",o:["[3, ∞)","[2, ∞)","[11, ∞)","ℝ"],c:1,s:"f(x) = (x − 3)² + 2 is increasing for x ≥ 3 with f(3) = 2, so the range is [2, ∞)."},
    {tp:'func',q:"The number of strictly increasing functions f from {1, 2, 3} to {1, 2, 3, 4, 5, 6} is:",o:["120","216","20","15"],c:2,s:"A strictly increasing function is fixed by the choice of 3 distinct images: C(6,3) = 20."},
    {tp:'func',q:"Find the number of bijections f of {1, 2, 3, 4} onto itself with f(i) ≠ i for every i. Give the answer as an integer.",n:9,s:"Derangements: D₄ = 4!(1 − 1 + 1/2 − 1/6 + 1/24) = 12 − 4 + 1 = 9."},
    {tp:'func',q:"If f(x) = 2x + 1, find f(f(f(1))). Give the answer as an integer.",n:15,s:"f(1) = 3, f(3) = 7, f(7) = 15."},
    {tp:'func',q:"A function f(x) = ax + b with a > 0 satisfies f(f(x)) = 4x + 9. Find f(5). Give the answer as an integer.",n:13,s:"f(f(x)) = a²x + ab + b. a² = 4, a = 2; 3b = 9, b = 3. f(5) = 13."},
    {tp:'func',q:"Find the number of functions f : {1, 2, 3, 4} → {1, 2, 3, 4} with f(f(x)) = x for all x. Give the answer as an integer.",n:10,s:"f is an involution: choose k disjoint swaps. k = 0: 1; k = 1: C(4,2) = 6; k = 2: 3. Total 10."},
    {tp:'dr',q:"The domain of f(x) = √(x − 2) + √(6 − x) is:",o:["(2, 6)","[2, ∞)","(−∞, 6]","[2, 6]"],c:3,s:"x − 2 ≥ 0 and 6 − x ≥ 0 give 2 ≤ x ≤ 6."},
    {tp:'dr',q:"The domain of f(x) = log(x² − 5x + 6) is:",o:["(−∞, 2) ∪ (3, ∞)","(2, 3)","[2, 3]","(−∞, 2] ∪ [3, ∞)"],c:0,s:"x² − 5x + 6 = (x − 2)(x − 3) > 0 for x < 2 or x > 3 (strict, as log needs a positive argument)."},
    {tp:'dr',q:"The range of f(x) = 1/(1 + x²), x ∈ ℝ, is:",o:["[0, 1]","(0, 1]","(0, 1)","[1, ∞)"],c:1,s:"1 + x² ≥ 1, so 0 < f(x) ≤ 1; the value 1 is attained at x = 0 and 0 never."},
    {tp:'dr',q:"The function f(x) = log(x + √(x² + 1)) is:",o:["even","neither even nor odd","odd","both even and odd"],c:2,s:"f(−x) = log(√(x²+1) − x) = log(1/(√(x²+1) + x)) = −f(x)."},
    {tp:'dr',q:"The fundamental period of f(x) = sin 3x + cos 2x is:",o:["π","2π/3","6π","2π"],c:3,s:"Periods 2π/3 and π; their LCM is 2π (3 × 2π/3 = 2 × π = 2π)."},
    {tp:'dr',q:"The range of f(x) = [x] + [−x], x ∈ ℝ, where [·] is the greatest integer function, is:",o:["{−1, 0}","{0}","{−1}","ℤ"],c:0,s:"For integer x: x − x = 0. For non-integer x: [−x] = −[x] − 1, so the sum is −1."},
    {tp:'dr',q:"The domain of f(x) = 1/√([x]² − [x] − 6), where [·] is the greatest integer function, is:",o:["(−∞, −2] ∪ [4, ∞)","(−∞, −2) ∪ [4, ∞)","(−∞, −3) ∪ (3, ∞)","(−2, 4)"],c:1,s:"[x]² − [x] − 6 = ([x] − 3)([x] + 2) > 0 gives [x] ≥ 4 or [x] ≤ −3, i.e. x ≥ 4 or x < −2."},
    {tp:'dr',q:"Find the number of integers in the range of f(x) = 3 − 2 sin x. Give the answer as an integer.",n:5,s:"−1 ≤ sin x ≤ 1 gives 1 ≤ f(x) ≤ 5. Integers 1, 2, 3, 4, 5: 5."},
    {tp:'dr',q:"Evaluate [1/3] + [2/3] + [3/3] + ... + [10/3], where [·] is the greatest integer function. Give the answer as an integer.",n:15,s:"Values for k = 1..10: 0, 0, 1, 1, 1, 2, 2, 2, 3, 3. Sum = 15."},
    {tp:'dr',q:"Find the number of real solutions of {x} = x/5, where {x} is the fractional part of x. Give the answer as an integer.",n:4,s:"x − [x] = x/5 gives [x] = 4x/5, so x = 5n/4 with n = [x]. Need n ≤ 5n/4 < n + 1, i.e. 0 ≤ n < 4: n = 0, 1, 2, 3."},
    {tp:'dr',q:"Find the number of integers in the domain of f(x) = √(16 − x²) + log(x + 2). Give the answer as an integer.",n:6,s:"−4 ≤ x ≤ 4 and x > −2 gives −2 < x ≤ 4. Integers −1, 0, 1, 2, 3, 4: 6."}
  ]}
});
})();
