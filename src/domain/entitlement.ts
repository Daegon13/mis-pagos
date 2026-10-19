export type Entitlement = 'free' | 'pro';

/** An external provider can be substituted without exposing it to feature code. */
export interface EntitlementSource {
  getEntitlement(): Entitlement | Promise<Entitlement>;
}

/** Unknown or unavailable entitlement never removes Free functionality. */
export async function resolveEntitlement(source?: EntitlementSource): Promise<Entitlement> {
  if (!source) return 'free';

  try {
    return (await source.getEntitlement()) === 'pro' ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}
