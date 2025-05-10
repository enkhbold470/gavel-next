
Representations of Measurements
Before designing a model, it’s necessary to think about the form and representation of the results of many pairwise comparisons. We need to keep in mind that any given pair of entries may be compared with each other zero or more times, and that judges may have conflicting opinions about the comparative quality of entries.

The results of a pairwise comparisons between entries 
e
1
,
e
2
,
…
,
e
n
e 
1
​
 ,e 
2
​
 ,…,e 
n
​
  is a multiset of tuples where the element 
(
e
j
,
e
i
)
,
j
≠
i
(e 
j
​
 ,e 
i
​
 ),j

=i represents a single judging decision where entry 
e
i
e 
i
​
  was judged to be better than entry 
e
j
e 
j
​
 .

We can also think of the measurements as a directed graph on 
n
n nodes 
e
1
,
e
2
,
…
,
e
n
e 
1
​
 ,e 
2
​
 ,…,e 
n
​
 , representing the entries, having nonnegative integer edge weights, with edge 
(
e
j
,
e
i
)
(e 
j
​
 ,e 
i
​
 ) having weight 
w
i
j
w 
ij
​
  equal to the number of times entry 
e
i
e 
i
​
  was judged to be better than 
e
j
e 
j
​
 , so arrows point to better entries.

It’s also useful to consider a matrix representation of the data that follows naturally from the graph representation — we have a matrix 
S
S with nonnegative integer entries, where 
S
i
j
S 
ij
​
  is equal to the number of times entry 
e
i
e 
i
​
  was judged to be better than 
e
j
e 
j
​
 .

