/**
 * Sanitize a value before writing it to Firestore.
 *
 * WHY: Firestore's `ignoreUndefinedProperties` only strips `undefined` *object
 * fields* — it does NOT remove `null`/`undefined` elements inside arrays. A
 * `null` array element gets stored, and on read-back the Firestore SDK (10.x)
 * throws an UNCAUGHT internal assertion:
 *
 *   TypeError: Cannot use 'in' operator to search for 'nullValue' in null
 *   FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state
 *
 * That poisons the whole Firestore instance, so every subsequent read fails and
 * pages render blank until a full page refresh. This recursively removes
 * `null`/`undefined` array elements and `undefined` object fields so a malformed
 * value can never be persisted in the first place.
 *
 * Non-plain objects (Date, Firestore Timestamp/FieldValue, etc.) are passed
 * through untouched.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== undefined && v !== null)
      .map((v) => sanitizeForFirestore(v)) as unknown as T;
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      if (v === undefined) continue; // also handled by ignoreUndefinedProperties
      out[key] = sanitizeForFirestore(v);
    }
    return out as unknown as T;
  }

  return value;
}
