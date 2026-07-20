export function parseItalianDecimal(value: string | number): number {
  if (typeof value === 'number') return value
  const normalized = value.trim().replace(',', '.')
  return normalized === '' ? Number.NaN : Number(normalized)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 3 }).format(value)
}
