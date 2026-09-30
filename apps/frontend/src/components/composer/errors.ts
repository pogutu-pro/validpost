/**
 * Turns a failed composer request into something a person can act on.
 * Server messages are only passed through for client errors (4xx validation),
 * where the API writes them for users; anything technical becomes plain copy.
 */
type Translate = (key: string, fallback: string) => string;

// Signs of an internal/technical message that should never reach the UI.
const TECHNICAL = /(^|\s)(error:|exception|stack|at \S+\.\w+ \(|ECONN|ETIMEDOUT|ENOTFOUND|prisma|sql|undefined|null pointer)/i;

export const friendlyComposerError = (
  status: number,
  serverMessage: string | undefined,
  fallback: string,
  t: Translate
): string => {
  if (status === 401 || status === 403) {
    return t(
      'composer_err_forbidden',
      "You don't have permission to publish here. Ask a workspace admin."
    );
  }
  if (status === 404 && /not available|not found/i.test(serverMessage || '')) {
    return t(
      'composer_err_channel_unavailable',
      "This channel isn't ready to publish yet. Finish connecting it in Settings → Channels."
    );
  }
  if (status === 429) {
    return t(
      'composer_err_rate_limited',
      'Slow down a little — too many requests. Try again in a minute.'
    );
  }
  if (status >= 500) {
    return t(
      'composer_err_server',
      'Something went wrong on our side. Your post is safe — try again in a moment.'
    );
  }
  const message = (serverMessage || '').trim();
  if (message && message.length <= 200 && !TECHNICAL.test(message)) {
    return message;
  }
  return fallback;
};
