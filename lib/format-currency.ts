// Format number to Indonesian Rupiah (IDR)
export function formatIDR(amount: number | string): string {
  // Parse amount if it's a string (remove non-numeric chars except minus)
  let numericAmount: number

  if (typeof amount === 'string') {
    // Remove all non-numeric characters except minus
    const cleaned = amount.replace(/[^0-9-]/g, '')
    numericAmount = parseInt(cleaned) || 0
  } else if (typeof amount === 'number') {
    numericAmount = amount
  } else {
    // Fallback for null/undefined/other types
    return 'N/A'
  }

  // Format with thousand separator (dot) and "Rp" prefix
  return `Rp ${numericAmount.toLocaleString('id-ID')}`
}

// Parse budget string to number
export function parseBudget(budget: string): number {
  // Remove "Rp" and all non-numeric characters except minus
  const cleaned = budget.replace(/[^0-9-]/g, '')
  return parseInt(cleaned) || 0
}

// Format compact number (e.g., 1.5M, 2.3B)
export function formatCompactIDR(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseBudget(amount) : amount
  
  if (numericAmount >= 1000000000) {
    return `Rp ${(numericAmount / 1000000000).toFixed(1)}M`
  }
  if (numericAmount >= 1000000) {
    return `Rp ${(numericAmount / 1000000).toFixed(1)}M`
  }
  if (numericAmount >= 1000) {
    return `Rp ${(numericAmount / 1000).toFixed(0)}K`
  }
  return `Rp ${numericAmount.toLocaleString('id-ID')}`
}

// Format number with proper thousand separator for display
export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID')
}
