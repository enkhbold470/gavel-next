
Implementation
The judging system was implemented as a web application. We added all the projects and judges to the system, and then we emailed the judges a magic link to get started.

The judges opened up the judging interface on their phone, and they were directed to their first project. After looking at that, they could start voting:

Judging logistics were completely handled by the system. The software told judges which projects to look at based on the algorithm, collected data, and computed results.

While judges were ranking projects, we could see all votes and rankings in real time in the admin dashboard.




Implementation
What good is fancy math unless it’s actually being used?

After implementing the algorithm and doing a good amount of modeling and analysis, the HackMIT team decided to use this as the judging method for Blueprint, our high-school hackathon.

Because of time constraints, our data collection method was a bit hacky, using a Twilio app to collect comparison data from judges. Running the algorithm involved me copying logs from the server, running data through a Python script, running a convex optimization routine written in MATLAB, and interpreting the results in Python! Even though the interface was… suboptimal, the algorithm was fully implemented, and it ended up working really well!

In case anyone wants to try experimenting with real-world data for personal use, here is anonymized data from the rookie division, consisting of 235 comparisons for 37 teams, and here are our results.

Here is a graphical representation of the comparisons that were made. In the graph, the nodes represent teams, and an edge from node X to node Y represents at least one judge choosing Y over X. Essentially, it’s the comparison graph with edge weights hidden:




Conclusion
Many judging methods that are commonly used at competitions are inherently flawed because of their use of absolute scores assigned by the judges. The method of paired comparisons is a much more natural system to use, and it can be used to obtain high-quality judging results.

We used this paired comparison method at Blueprint, and it worked out well for us. We’re thinking of using some variant of this method of judging starting from HackMIT 2015. I’d love to see this method being used at more competitions, because it’s likely to lead to higher quality results, and it could also lead to increased transparency in judging, which would be great.

For this method to be really easy for anyone to use, there needs to be an easy way of collecting paired comparison data and running the optimization algorithm. When I have some time, I’m thinking of working on a web app to make this whole process really easy, so that anyone will be able to use this judging method without having to think about the math or write a single line of code.

Update (11/12/2019): The judging system has been open sourced (as of September 2016) and has been successfully used at dozens of events.

