import { describe, it, expect } from 'vitest';
// @ts-ignore
import {
    badRequest,
    conflict,
    forbidden,
    gone,
    internalServerError,
    methodNotAllowed,
    notAcceptable,
    notFound,
    notImplemented,
    paymentRequired,
    preconditionFailed,
    preconditionRequired,
    requestTimeout,
    serviceUnavailable,
    tooManyRequests,
    unauthorized,
    unavailableForLegalReasons,
    unprocessableContent,
    unsupportedMediaType,
    type Problem,
} from '../src';
import { none, some } from '@pickle-packs/nads/maybe';

describe('problem', () => {
    describe('badRequest', () => {
        describe('when providing errors', () => {
            it('should be included as an extension', () => {
                const instance = 'instance';
                const type = 'type';
                const detail = 'detail';
                const messages = ['a', 'b', 'c'];
                const errors: Record<string, string[]> = { ['field.property']: messages };

                const problem = badRequest(instance, type, detail, errors, none);
                const obj = JSON.parse(JSON.stringify(problem)) as Problem;

                expect(obj).toBeDefined();
                expect(obj.instance).toBe(instance);
                expect(obj.type).toBe(type);
                expect(obj.detail).toBe(detail);
                expect(obj.extensions?.['errors']?.['field.property']).toStrictEqual(messages);
            });
        });
        describe('when providing errors and extensions', () => {
            it('should be included as an extension with extensions', () => {
                const instance = 'instance';
                const type = 'type';
                const detail = 'detail';
                const messages = ['a', 'b', 'c'];
                const errors: Record<string, string[]> = { ['field.property']: messages };
                const alphaValue = 0;
                const betaValue = '1';
                const gammaValue = [0, 1, 2];
                const deltaValue = {
                    hello: 'world',
                };
                const extensions = some({
                    alpha: alphaValue,
                    beta: betaValue,
                    gamma: gammaValue,
                    delta: deltaValue,
                });

                const problem = badRequest(instance, type, detail, errors, extensions);
                const obj = JSON.parse(JSON.stringify(problem)) as Problem;

                expect(obj).toBeDefined();
                expect(obj.instance).toBe(instance);
                expect(obj.type).toBe(type);
                expect(obj.detail).toBe(detail);
                expect(obj.extensions?.['errors']?.['field.property']).toStrictEqual(messages);
                expect(obj.extensions?.['alpha']).toStrictEqual(alphaValue);
                expect(obj.extensions?.['beta']).toStrictEqual(betaValue);
                expect(obj.extensions?.['gamma']).toStrictEqual(gammaValue);
                expect(obj.extensions?.['delta']).toStrictEqual(deltaValue);
            });
        });
    });

    describe('internalServerError', () => {
        describe('when providing errors', () => {
            it('should be included as an extension', () => {
                const instance = 'instance';
                const type = 'type';
                const detail = 'detail';
                const messages = ['a', 'b', 'c'];
                const errors: Record<string, string[]> = { ['field.property']: messages };

                const problem = internalServerError(instance, type, detail, errors, none);
                const obj = JSON.parse(JSON.stringify(problem)) as Problem;

                expect(obj).toBeDefined();
                expect(obj.instance).toBe(instance);
                expect(obj.type).toBe(type);
                expect(obj.detail).toBe(detail);
                expect(obj.extensions?.['errors']?.['field.property']).toStrictEqual(messages);
            });
        });
    });

    describe('preconditionFailed', () => {
        describe('when providing errors', () => {
            it('should be included as an extension', () => {
                const instance = 'instance';
                const type = 'type';
                const detail = 'detail';
                const messages = ['a', 'b', 'c'];
                const errors: Record<string, string[]> = { ['field.property']: messages };

                const problem = preconditionFailed(instance, type, detail, errors, none);
                const obj = JSON.parse(JSON.stringify(problem)) as Problem;

                expect(obj).toBeDefined();
                expect(obj.instance).toBe(instance);
                expect(obj.type).toBe(type);
                expect(obj.detail).toBe(detail);
                expect(obj.extensions?.['errors']?.['field.property']).toStrictEqual(messages);
            });
        });
    });

    describe('unprocessableContent', () => {
        describe('when providing errors', () => {
            it('should be included as an extension', () => {
                const instance = 'instance';
                const type = 'type';
                const detail = 'detail';
                const messages = ['a', 'b', 'c'];
                const errors: Record<string, unknown> = { ['field.property']: messages };

                const problem = unprocessableContent(instance, type, detail, errors, none);
                const obj = JSON.parse(JSON.stringify(problem)) as Problem;

                expect(obj).toBeDefined();
                expect(obj.instance).toBe(instance);
                expect(obj.type).toBe(type);
                expect(obj.detail).toBe(detail);
                expect(obj.extensions?.['errors']?.['field.property']).toStrictEqual(messages);
            });
        });
    });

    describe('conflict', () => {
        it('should omit extensions when none', () => {
            const problem = conflict('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;

            expect(obj).toBeDefined();
            expect(obj.instance).toBe('instance');
            expect(obj.type).toBe('type');
            expect(obj.detail).toBe('detail');
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('forbidden', () => {
        it('should omit extensions when none', () => {
            const problem = forbidden('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('gone', () => {
        it('should omit extensions when none', () => {
            const problem = gone('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('methodNotAllowed', () => {
        it('should omit extensions when none', () => {
            const problem = methodNotAllowed('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('notAcceptable', () => {
        it('should omit extensions when none', () => {
            const problem = notAcceptable('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('notFound', () => {
        it('should omit extensions when none', () => {
            const problem = notFound('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('notImplemented', () => {
        it('should omit extensions when none', () => {
            const problem = notImplemented('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('paymentRequired', () => {
        it('should omit extensions when none', () => {
            const problem = paymentRequired('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('preconditionRequired', () => {
        it('should omit extensions when none', () => {
            const problem = preconditionRequired('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('requestTimeout', () => {
        it('should omit extensions when none', () => {
            const problem = requestTimeout('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('serviceUnavailable', () => {
        it('should omit extensions when none', () => {
            const problem = serviceUnavailable('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('tooManyRequests', () => {
        it('should omit extensions when none', () => {
            const problem = tooManyRequests('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('unauthorized', () => {
        it('should omit extensions when none', () => {
            const problem = unauthorized('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('unavailableForLegalReasons', () => {
        it('should omit extensions when none', () => {
            const problem = unavailableForLegalReasons('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });

    describe('unsupportedMediaType', () => {
        it('should omit extensions when none', () => {
            const problem = unsupportedMediaType('instance', 'type', 'detail', none);
            const obj = JSON.parse(JSON.stringify(problem)) as Problem;
            expect(obj.extensions).toBeUndefined();
        });
    });
});
