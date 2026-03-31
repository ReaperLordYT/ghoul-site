export const scorePattern = /^\d+:\d+$/;

export const normalizeScoreInput = (value: string) =>
  value.replace(/[^\d:]/g, "").replace(/:{2,}/g, ":");

export const isValidScore = (value: string) => scorePattern.test(value.trim());

export const parseScore = (value?: string) => {
  if (!value || !isValidScore(value)) return null;
  const [a, b] = value.split(":").map((v) => Number(v));
  return { a, b };
};
