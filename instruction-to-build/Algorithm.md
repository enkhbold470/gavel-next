
Algorithm
During expo judging, we used a pairwise comparison system. Because the old algorithm didn’t scale, we needed to find something else. After a lot of research, I decided to implement a system based on the Crowd-BT paper, which describes an algorithm based on the Bradley-Terry model of pairwise comparisons. Using this rather than the Thurstone model, which was used in the old system, allows for simpler and faster algorithms.

The Crowd-BT algorithm has a couple nice features. Instead of dispatching judges randomly, it assigns judges in such a way that maximizes expected information gain. It also allows updating rankings efficiently in an online manner, taking 
O(1) time to process single votes and taking 
O(n) time to tell a judge where to go next.