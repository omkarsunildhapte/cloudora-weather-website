/**
 * Minimal Trusted Types surface.
 *
 * TypeScript's DOM lib does not declare these, and the only alternative is a
 * `@types/trusted-types` dependency for what amounts to two method signatures.
 * Narrowed to what this site actually calls — `createPolicy` with a
 * `createScript` factory — rather than mirroring the full spec.
 */
export interface TrustedScriptValue {
  readonly __brand: 'TrustedScript';
}

export interface TrustedTypePolicy {
  createScript(input: string): TrustedScriptValue;
}

export interface TrustedTypePolicyFactory {
  createPolicy(name: string, rules: { createScript(input: string): string }): TrustedTypePolicy;
}

/** A `window` that may expose the Trusted Types factory. */
export interface WindowWithTrustedTypes {
  trustedTypes?: TrustedTypePolicyFactory;
}
