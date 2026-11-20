export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const rem = abs % 10

  if (abs > 10 && abs < 20) {
    return forms[2]
  }
  if (rem > 1 && rem < 5) {
    return forms[1]
  }
  if (rem === 1) {
    return forms[0]
  }
  return forms[2]
}
