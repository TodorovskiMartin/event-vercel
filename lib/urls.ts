export function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

export function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function publicEventPath(slug: string) {
  return `/e/${encodePathSegment(slug)}`;
}

export function publicResultsPath(slug: string) {
  return `${publicEventPath(slug)}/results`;
}

export function projectorPath(slug: string) {
  return `/present/${encodePathSegment(slug)}`;
}

export function audienceResultsPath(slug: string) {
  return `/audience/${encodePathSegment(slug)}`;
}
