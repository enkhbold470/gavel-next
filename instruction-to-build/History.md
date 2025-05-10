
Designing a Better Judging System
7 Mar 2015 — shared on Reddit
Competition judging is hard. Coming up with fair methods to select rankings is difficult, and it’s especially hard to design judging methods for large-scale events.

As an attendee of many hackathons, and as an organizer of HackMIT, I wanted to figure out a way to improve the quality of judging at hackathons and large-scale competitions in general. Sometimes, poor judging is a result of neglect or lack of organization. However, most judging methods themselves are inherently flawed. It’s possible to do a lot better.

When trying to design a good judging system, large-scale events in particular pose a unique challenge. Because the events are so large, no single judge can judge all the entries. In fact, at HackMIT, the average judge looked at only 5% of the projects. The challenge is to figure out what data to collect and how to combine the data to come up with good overall judging results.

Given the size of the event, the number of judges, and the amount of time there is for judging to take place, there is a fundamental limit on how much data it’s possible to collect. The question is: given the constraints, how do we produce the highest-quality judging results possible?

It turns out that we can radically change the judging model, and instead of having judges produce absolute scores, we can ask judges to perform pairwise comparisons. Using statistical inference methods, it’s possible to take data of this form and produce high-quality judging results.

The method of pairwise comparisons actually works pretty well in practice! We relied on this method for judging at Blueprint, HackMIT’s high school hackathon, and we’re thinking of using some form of this judging method starting from HackMIT 2015 as well.



Implementing a Scalable Judging System
9 Nov 2015
I’ve written about good competition judging methods before. It’s hard to do well, but it can be done.

It turns out that it’s hard to scale.

Given that the algorithm used at Blueprint worked pretty well, naturally, I wanted to use the same general method for HackMIT. However, the requirements for a 1000-person event are pretty different from a 200-person event.

The old algorithm does not scale: by a rough estimate, it would take roughly 3 years to solve a 300 team case of the convex optimization problem. Our Matlab implementation, which used CVX with the SDPT3 solver, seemed to be taking exponential time. It wasn’t clear how to optimize it — having the normal CDF inside the objective function makes things hard for numerical optimization.

Also, the logistics of dealing with over a thousand people are a lot more complicated than dealing with a couple hundred people.






Averaging: A First Attempt
Perhaps the most straightforward judging method is to have numerical scores and average them. It’s really easy to have judges assign numerical scores to each entry they judge, average the scores per entry, and rank the entries by average score.

Because this method is so easy to implement, it’s no wonder that it’s so common! The vast majority of events use something like this. However, this method is deeply flawed.

What does it mean when judge A gives entry X a 7/10, and judge B gives entry Y a 4/10? Does it mean that X was objectively better, or does it mean that judge B was particularly harsh? This is just one of the many problems with this method.



