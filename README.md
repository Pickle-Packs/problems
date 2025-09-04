# Problem Details (RFC 7807) helpers

Tiny helpers to create RFC 7807 problem objects with correct shape, status codes, and optional `extensions`.

Uses `Maybe` from **@pickle-packs/nads**. See: https://github.com/Pickle-Packs/nads

## Problem shape

```ts
export type Problem = Readonly<{
  detail: string;
  extensions: Record<string, unknown> | undefined;
  instance: string;
  status: StatusCode;
  title: string;
  type: string;
}>;
```
## API

All creators return `Problem`.

Creators that accept `errors` and merge them into `extensions`:
- `badRequest(instance, type, detail, errors, maybeExtensions)`
- `internalServerError(instance, type, detail, errors, maybeExtensions)`
- `preconditionFailed(instance, type, detail, errors, maybeExtensions)`
- `unprocessableContent(instance, type, detail, errors, maybeExtensions)`

Creators that do not take `errors`:
- `conflict(instance, type, detail, maybeExtensions)`
- `forbidden(instance, type, detail, maybeExtensions)`
- `gone(instance, type, detail, maybeExtensions)`
- `methodNotAllowed(instance, type, detail, maybeExtensions)`
- `notAcceptable(instance, type, detail, maybeExtensions)`
- `notFound(instance, type, detail, maybeExtensions)`
- `notImplemented(instance, type, detail, maybeExtensions)`
- `paymentRequired(instance, type, detail, maybeExtensions)`
- `preconditionRequired(instance, type, detail, maybeExtensions)`
- `requestTimeout(instance, type, detail, maybeExtensions)`
- `serviceUnavailable(instance, type, detail, maybeExtensions)`
- `tooManyRequests(instance, type, detail, maybeExtensions)`
- `unauthorized(instance, type, detail, maybeExtensions)`
- `unavailableForLegalReasons(instance, type, detail, maybeExtensions)`
- `unsupportedMediaType(instance, type, detail, maybeExtensions)`

Utility:
- `contentType` for your `Content-Type` header.
- `statusCodes` and `StatusCode` type.

## Usage

Adjust the import path to wherever you export these helpers.

### With fetch or Web API

```ts
import { badRequest, contentType, type Problem } from '<your-export>';
import { none, some } from '@pickle-packs/nads/maybe';

export function handle(req: Request): Response {
  // Example: validation failure with field errors and custom extras
  const errors: Readonly<Record<string, string[]>> = {
    'user.email': ['must be an email', 'too long'],
  };

  const extras = some({
    requestId: 'abc-123',
    trace: '00-5af...-01',
  });

  const problem: Problem = badRequest(
    '/users',
    'https://httpstatuses.io/400',
    'Invalid input',
    errors,
    extras
  );

  return new Response(JSON.stringify(problem), {
    status: problem.status,
    headers: { 'content-type': contentType },
  });
}
```

### With Express

```ts
import type { Request, Response } from 'express';
import { conflict, contentType } from '<your-export>';
import { none } from '@pickle-packs/nads/maybe';

export function create(req: Request, res: Response) {
  const problem = conflict(
    `/users/${req.body.email}`,
    'https://example.com/problems/user-conflict',
    'User already exists',
    none
  );

  res.status(problem.status)
     .type(contentType)
     .send(problem);
}
```

### Omitting `extensions`

Pass `none` to omit the `extensions` property entirely:

```ts
import { notFound } from '<your-export>';
import { none } from '@pickle-packs/nads/maybe';

const p = notFound('/widgets/42', 'about:blank', 'Widget not found', none);
// p.extensions === undefined
```

### Adding `extensions` without errors

```ts
import { unauthorized } from '<your-export>';
import { some } from '@pickle-packs/nads/maybe';

const p = unauthorized(
  '/auth',
  'https://httpstatuses.io/401',
  'Authentication required',
  some({ authScheme: 'Bearer', requestId: 'r-1' })
);
```

### Adding field errors

Errors are merged under `extensions.errors`:

```ts
import { unprocessableContent } from '<your-export>';
import { some, none } from '@pickle-packs/nads/maybe';

const errors: Readonly<Record<string, unknown>> = {
  'profile.age': ['must be >= 18'],
};

const p1 = unprocessableContent('/profiles', 'about:blank', 'Validation failed', errors, none);
// p1.extensions.errors['profile.age'] -> [...]

const p2 = unprocessableContent(
  '/profiles',
  'about:blank',
  'Validation failed',
  errors,
  some({ requestId: 'abc' })
);
// p2.extensions merges both: { errors: {...}, requestId: 'abc' }
```

## Conventions

- `type`: stable URI for the problem category. Use `about:blank` or a resolvable URL you control.
- `title`: short summary tied to `type`. Do not vary per occurrence.
- `instance`: URI for this occurrence. Often a request path or an ID.
- `detail`: human-readable explanation for this occurrence.

## Tests reference

Behavior verified with Vitest:
- `extensions` is omitted when `none` is provided.
- When `errors` are provided, they appear in `extensions.errors`.
- Arbitrary `extensions` merge with `errors` when both are present.
