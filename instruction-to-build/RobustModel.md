A Robust Model
We can look to psychology research to find good models for reasoning about paired comparison data. We turn to probabilistic choice models, using Thurstone’s statistical model of judgements, a widely accepted model that will allow us to derive interval scale measurements from which we can extract rankings.

Thurstone’s model assumes that the quality of every choice is a Gaussian random variable. The model dictates that when a person judges the relative quality of two options, they sample from each of the corresponding quality distributions, and they choose the option with the higher measured quality. This is a pretty nice property in modeling the real world — when two options are very different in terms of quality, it’s easy to pick out the better one; however, when options are very similar in terms of quality, there will be a much smaller difference in the probability of choosing one over the other.

Quality DistributionsQuality Distributions
An option’s true quality is the mean of the corresponding Gaussian. Given whatever data we have, if we can figure out the means of the Gaussians, we will have relative scores for every option, so we’ll be able to determine a global ranking.

As an example, consider two options with Gaussian random variables 
X
X and 
Y
Y: