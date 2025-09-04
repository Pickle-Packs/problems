import {
    match, type Maybe, some,
} from '@pickle-packs/nads/maybe';

/**
 * RFC 7807 Problem Details envelope.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export type Problem = Readonly<{
    /** Human-readable explanation specific to this occurrence. */
    detail: string;
    /** Application-specific members. Put structured data here (e.g., { errors: [...] }). */
    extensions: Record<string, unknown> | undefined;
    /** URI for this occurrence. Often a request path, ID, or link to logs/traces. */
    instance: string;
    /** HTTP status code for this occurrence. Mirrors the response status. */
    status: StatusCode;
    /** Short summary tied to the `type`. Should not vary per occurrence. */
    title: string;
    /** URI identifying the problem type. Stable and preferably dereferenceable. Defaults to "about:blank". */
    type: string;
}>;

export type StatusCode = (typeof statusCodes)[keyof typeof statusCodes];

export function badRequest(
    instance: string,
    type: string,
    detail: string,
    errors: Readonly<Record<string, Array<string>>>,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    const extensionsWithErrors = {
        [extensionsErrorKey]: errors,
        ...getExtensionsOrEmpty(maybeExtensions),
    };

    return buildProblem(
        statusCodes.badRequest,
        'Bad Request',
        type,
        instance,
        detail,
        some(extensionsWithErrors),
    );
}

export function conflict(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.conflict,
        'Conflict',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function forbidden(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.forbidden,
        'Forbidden',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function gone(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.gone,
        'Gone',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function internalServerError(
    instance: string,
    type: string,
    detail: string,
    errors: Readonly<Record<string, Array<string>>>,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    const extensionsWithErrors = {
        [extensionsErrorKey]: errors,
        ...getExtensionsOrEmpty(maybeExtensions),
    };

    return buildProblem(
        statusCodes.internalServerError,
        'Internal Server Error',
        type,
        instance,
        detail,
        some(extensionsWithErrors),
    );
}

export function methodNotAllowed(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.methodNotAllowed,
        'Method Not Allowed',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function notAcceptable(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.notAcceptable,
        'Not Acceptable',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function notFound(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.notFound,
        'Not Found',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function notImplemented(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.notImplemented,
        'Not Implemented',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function paymentRequired(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.paymentRequired,
        'Payment Required',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function preconditionFailed(
    instance: string,
    type: string,
    detail: string,
    errors: Readonly<Record<string, Array<string>>>,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    const extensionsWithErrors = {
        [extensionsErrorKey]: errors,
        ...getExtensionsOrEmpty(maybeExtensions),
    };

    return buildProblem(
        statusCodes.preconditionFailed,
        'Precondition Failed',
        type,
        instance,
        detail,
        some(extensionsWithErrors),
    );
}

export function preconditionRequired(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.preconditionRequired,
        'Precondition Required',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function requestTimeout(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.requestTimeout,
        'Request Timeout',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function serviceUnavailable(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.serviceUnavailable,
        'Service Unavailable',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function tooManyRequests(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.tooManyRequests,
        'Too Many Requests',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function unauthorized(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.unauthorized,
        'Unauthorized',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function unavailableForLegalReasons(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.unavailableForLegalReasons,
        'Unavailable For Legal Reasons',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

export function unprocessableContent(
    instance: string,
    type: string,
    detail: string,
    errors: Readonly<Record<string, unknown>>,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    const extensionsWithErrors = {
        [extensionsErrorKey]: errors,
        ...getExtensionsOrEmpty(maybeExtensions),
    };

    return buildProblem(
        statusCodes.unprocessableContent,
        'Unprocessable Content',
        type,
        instance,
        detail,
        some(extensionsWithErrors),
    );
}

export function unsupportedMediaType(
    instance: string,
    type: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return buildProblem(
        statusCodes.unsupportedMediaType,
        'Unsupported Media Type',
        type,
        instance,
        detail,
        maybeExtensions,
    );
}

function buildProblem(
    status: StatusCode,
    title: string,
    type: string,
    instance: string,
    detail: string,
    maybeExtensions: Maybe<Readonly<Record<string, unknown>>>,
): Problem {
    return {
        detail: detail,
        extensions: resolveExtensions(maybeExtensions),
        instance: instance,
        status: status,
        title: title,
        type: type,
    } as const;
}

function getExtensionsOrEmpty(maybeExtensions: Maybe<Readonly<Record<string, unknown>>>): Readonly<Record<string, unknown>> {
    return match(
        maybeExtensions,
        (x): Record<string, unknown> => ({ ...x }),
        {},
    );
}

function resolveExtensions(maybeExtensions: Maybe<Readonly<Record<string, unknown>>>): Readonly<Record<string, unknown>> | undefined {
    return match(
        maybeExtensions,
        (x): Record<string, unknown> => ({ ...x }),
        undefined,
    );
}

export const contentType = 'application/problem+json; charset=utf-8';

const extensionsErrorKey: string = 'errors';

export const statusCodes = {
    badRequest: 400,
    conflict: 409,
    forbidden: 403,
    gone: 410,
    internalServerError: 500,
    methodNotAllowed: 405,
    notAcceptable: 406,
    notFound: 404,
    notImplemented: 501,
    paymentRequired: 402,
    preconditionFailed: 412,
    preconditionRequired: 428,
    requestTimeout: 408,
    serviceUnavailable: 503,
    tooManyRequests: 429,
    unauthorized: 401,
    unavailableForLegalReasons: 451,
    unprocessableContent: 422,
    unsupportedMediaType: 415,
} as const;
