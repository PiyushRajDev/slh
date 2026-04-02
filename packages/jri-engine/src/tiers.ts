export function computeTier(score: number): string {
    if (score >= 90) return 'Legend';
    if (score >= 80) return 'Elite';
    if (score >= 70) return 'Pro';
    if (score >= 60) return 'Rising';
    if (score >= 45) return 'Challenger';
    return 'Rookie';
}

export function tierColor(tier: string): string {
    switch (tier) {
        case 'Legend': return '#eab308';
        case 'Elite': return '#8b5cf6';
        case 'Pro': return '#3b82f6';
        case 'Rising': return '#10b981';
        case 'Challenger': return '#f59e0b';
        default: return '#6b7280';
    }
}
