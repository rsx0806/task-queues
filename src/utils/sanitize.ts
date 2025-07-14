import sanitizeHtml from 'sanitize-html';

export function sanitize(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export function sanitizeTaskInput<T extends { title?: string; description?: string }>(input: T): T {
  return {
    ...input,
    title: input.title ? sanitize(input.title) : input.title,
    description: input.description ? sanitize(input.description) : input.description,
  };
} 