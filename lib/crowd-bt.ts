// Parameters chosen according to experiments in paper
// http://people.stern.nyu.edu/xchen3/images/crowd_pairwise.pdf
export const GAMMA = 0.1; // tradeoff parameter
export const LAMBDA = 1.0; // regularization parameter
export const KAPPA = 0.0001; // to ensure positivity of variance
export const MU_PRIOR = 0.0;
export const SIGMA_SQ_PRIOR = 1.0;
export const ALPHA_PRIOR = 10.0;
export const BETA_PRIOR = 1.0;
export const EPSILON = 0.25; // epsilon-greedy

export function argmax<T>(f: (item: T) => number, items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, current) => {
    return f(current) > f(best) ? current : best;
  }, items[0]);
}

// via https://en.wikipedia.org/wiki/Normal_distribution
export function divergenceGaussian(
  mu1: number,
  sigmaSq1: number,
  mu2: number,
  sigmaSq2: number
): number {
  const ratio = sigmaSq1 / sigmaSq2;
  return (
    Math.pow(mu1 - mu2, 2) / (2 * sigmaSq2) +
    (ratio - 1 - Math.log(ratio)) / 2
  );
}

// via https://en.wikipedia.org/wiki/Beta_distribution
export function divergenceBeta(
  alpha1: number,
  beta1: number,
  alpha2: number,
  beta2: number
): number {
  return (
    lnBeta(alpha2, beta2) -
    lnBeta(alpha1, beta1) +
    (alpha1 - alpha2) * digamma(alpha1) +
    (beta1 - beta2) * digamma(beta1) +
    (alpha2 - alpha1 + beta2 - beta1) * digamma(alpha1 + beta1)
  );
}

// Approximation of the logarithm of the beta function
function lnBeta(a: number, b: number): number {
  return Math.log(gamma(a)) + Math.log(gamma(b)) - Math.log(gamma(a + b));
}

// Approximation of the gamma function
function gamma(z: number): number {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }

  const t = z + p.length - 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Approximation of the digamma function
function digamma(x: number): number {
  // For x > 2, use recurrence relation: psi(x + 1) = psi(x) + 1/x
  let result = 0;
  while (x < 10) {
    result -= 1 / x;
    x += 1;
  }

  // Asymptotic expansion for large x
  result += Math.log(x) - 0.5 / x;
  const r = 1 / x;
  const r2 = r * r;
  result -= r2 * (1 / 12 - r2 * (1 / 120 - r2 * (1 / 252)));
  return result;
}

// Returns new values after an update (alpha, beta, mu_winner, sigma_sq_winner, mu_loser, sigma_sq_loser)
export function update(
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number, number, number, number, number] {
  const [updatedAlpha, updatedBeta, _] = updatedAnnotator(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  
  const [updatedMuWinner, updatedMuLoser] = updatedMus(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  
  const [updatedSigmaSqWinner, updatedSigmaSqLoser] = updatedSigmaSqs(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  
  return [
    updatedAlpha,
    updatedBeta,
    updatedMuWinner,
    updatedSigmaSqWinner,
    updatedMuLoser,
    updatedSigmaSqLoser,
  ];
}

export function expectedInformationGain(
  alpha: number,
  beta: number,
  muA: number,
  sigmaSqA: number,
  muB: number,
  sigmaSqB: number
): number {
  const [alpha1, beta1, c] = updatedAnnotator(
    alpha,
    beta,
    muA,
    sigmaSqA,
    muB,
    sigmaSqB
  );
  
  const [muA1, muB1] = updatedMus(
    alpha,
    beta,
    muA,
    sigmaSqA,
    muB,
    sigmaSqB
  );
  
  const [sigmaSqA1, sigmaSqB1] = updatedSigmaSqs(
    alpha,
    beta,
    muA,
    sigmaSqA,
    muB,
    sigmaSqB
  );
  
  const probARankedAbove = c;
  
  const [alpha2, beta2, _] = updatedAnnotator(
    alpha,
    beta,
    muB,
    sigmaSqB,
    muA,
    sigmaSqA
  );
  
  const [muB2, muA2] = updatedMus(
    alpha,
    beta,
    muB,
    sigmaSqB,
    muA,
    sigmaSqA
  );
  
  const [sigmaSqB2, sigmaSqA2] = updatedSigmaSqs(
    alpha,
    beta,
    muB,
    sigmaSqB,
    muA,
    sigmaSqA
  );

  return (
    probARankedAbove *
      (divergenceGaussian(muA1, sigmaSqA1, muA, sigmaSqA) +
        divergenceGaussian(muB1, sigmaSqB1, muB, sigmaSqB) +
        GAMMA * divergenceBeta(alpha1, beta1, alpha, beta)) +
    (1 - probARankedAbove) *
      (divergenceGaussian(muA2, sigmaSqA2, muA, sigmaSqA) +
        divergenceGaussian(muB2, sigmaSqB2, muB, sigmaSqB) +
        GAMMA * divergenceBeta(alpha2, beta2, alpha, beta))
  );
}

// Returns (updated mu of winner, updated mu of loser)
function updatedMus(
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number] {
  const mult =
    (alpha * Math.exp(muWinner)) /
      (alpha * Math.exp(muWinner) + beta * Math.exp(muLoser)) -
    Math.exp(muWinner) / (Math.exp(muWinner) + Math.exp(muLoser));
    
  const updatedMuWinner = muWinner + sigmaSqWinner * mult;
  const updatedMuLoser = muLoser - sigmaSqLoser * mult;

  return [updatedMuWinner, updatedMuLoser];
}

// Returns (updated sigma squared of winner, updated sigma squared of loser)
function updatedSigmaSqs(
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number] {
  const mult =
    (alpha * Math.exp(muWinner) * beta * Math.exp(muLoser)) /
      Math.pow(alpha * Math.exp(muWinner) + beta * Math.exp(muLoser), 2) -
    (Math.exp(muWinner) * Math.exp(muLoser)) /
      Math.pow(Math.exp(muWinner) + Math.exp(muLoser), 2);

  const updatedSigmaSqWinner =
    sigmaSqWinner * Math.max(1 + sigmaSqWinner * mult, KAPPA);
  const updatedSigmaSqLoser =
    sigmaSqLoser * Math.max(1 + sigmaSqLoser * mult, KAPPA);

  return [updatedSigmaSqWinner, updatedSigmaSqLoser];
}

// Returns (updated alpha, updated beta, pr i >k j which is c)
function updatedAnnotator(
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number, number] {
  const c1 =
    Math.exp(muWinner) / (Math.exp(muWinner) + Math.exp(muLoser)) +
    0.5 *
      (sigmaSqWinner + sigmaSqLoser) *
      (Math.exp(muWinner) *
        Math.exp(muLoser) *
        (Math.exp(muLoser) - Math.exp(muWinner))) /
      Math.pow(Math.exp(muWinner) + Math.exp(muLoser), 3);
      
  const c2 = 1 - c1;
  const c = (c1 * alpha + c2 * beta) / (alpha + beta);

  const expt =
    (c1 * (alpha + 1) * alpha + c2 * alpha * beta) /
    (c * (alpha + beta + 1) * (alpha + beta));
    
  const exptSq =
    (c1 * (alpha + 2) * (alpha + 1) * alpha + c2 * (alpha + 1) * alpha * beta) /
    (c * (alpha + beta + 2) * (alpha + beta + 1) * (alpha + beta));

  const variance = exptSq - Math.pow(expt, 2);
  const updatedAlpha = ((expt - exptSq) * expt) / variance;
  const updatedBeta = ((expt - exptSq) * (1 - expt)) / variance;

  return [updatedAlpha, updatedBeta, c];
} 