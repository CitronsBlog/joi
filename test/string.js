'use strict';

// Load modules

const Lab = require('lab');
const Code = require('code');
const Joi = require('../lib');
const Helper = require('./helper');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('string', () => {

    it('fails on boolean', (done) => {

        const schema = Joi.string();
        Helper.validate(schema, [
            [true, false, null, '"value" must be a string'],
            [false, false, null, '"value" must be a string']
        ], done);
    });

    it('fails on integer', (done) => {

        const schema = Joi.string();
        Helper.validate(schema, [
            [123, false, null, '"value" must be a string'],
            [0, false, null, '"value" must be a string'],
            ['123', true],
            ['0', true]
        ], done);
    });

    describe('valid()', () => {

        it('validates case sensitive values', (done) => {

            Helper.validate(Joi.string().valid('a', 'b'), [
                ['a', true],
                ['b', true],
                ['A', false, null, '"value" must be one of [a, b]'],
                ['B', false, null, '"value" must be one of [a, b]']
            ], done);
        });

        it('validates case insensitive values', (done) => {

            Helper.validate(Joi.string().valid('a', 'b').insensitive(), [
                ['a', true],
                ['b', true],
                ['A', true],
                ['B', true],
                [4, false, null, '"value" must be a string']
            ], done);
        });

        it('validates case insensitive values with non-strings', (done) => {

            Helper.validate(Joi.string().valid('a', 'b', 5).insensitive(), [
                ['a', true],
                ['b', true],
                ['A', true],
                ['B', true],
                [4, false, null, '"value" must be a string'],
                [5, true]
            ], done);
        });
    });

    describe('invalid()', () => {

        it('invalidates case sensitive values', (done) => {

            Helper.validate(Joi.string().invalid('a', 'b'), [
                ['a', false, null, '"value" contains an invalid value'],
                ['b', false, null, '"value" contains an invalid value'],
                ['A', true],
                ['B', true]
            ], done);
        });

        it('invalidates case insensitive values', (done) => {

            Helper.validate(Joi.string().invalid('a', 'b').insensitive(), [
                ['a', false, null, '"value" contains an invalid value'],
                ['b', false, null, '"value" contains an invalid value'],
                ['A', false, null, '"value" contains an invalid value'],
                ['B', false, null, '"value" contains an invalid value']
            ], done);
        });
    });

    describe('min()', () => {

        it('throws when limit is not a number', (done) => {

            expect(() => {

                Joi.string().min('a');
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not an integer', (done) => {

            expect(() => {

                Joi.string().min(1.2);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not a positive integer', (done) => {

            expect(() => {

                Joi.string().min(-1);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('enforces a limit using byte count', (done) => {

            const schema = Joi.string().min(2, 'utf8');
            Helper.validate(schema, [
                ['\u00bd', true],
                ['a', false, null, '"value" length must be at least 2 characters long']
            ], done);
        });

        it('accepts references as min length', (done) => {

            const schema = Joi.object({ a: Joi.number(), b: Joi.string().min(Joi.ref('a'), 'utf8') });
            Helper.validate(schema, [
                [{ a: 2, b: '\u00bd' }, true],
                [{ a: 2, b: 'a' }, false, null, 'child "b" fails because ["b" length must be at least 2 characters long]']
            ], done);
        });

        it('accepts context references as min length', (done) => {

            const schema = Joi.object({ b: Joi.string().min(Joi.ref('$a'), 'utf8') });
            Helper.validate(schema, [
                [{ b: '\u00bd' }, true, { context: { a: 2 } }],
                [{ b: 'a' }, false, { context: { a: 2 } }, 'child "b" fails because ["b" length must be at least 2 characters long]']
            ], done);
        });

        it('errors if reference is not a number', (done) => {

            const schema = Joi.object({ a: Joi.any(), b: Joi.string().min(Joi.ref('a'), 'utf8') });

            Helper.validate(schema, [
                [{ a: 'Hi there', b: '\u00bd' }, false, null, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });

        it('errors if context reference is not a number', (done) => {

            const schema = Joi.object({ b: Joi.string().min(Joi.ref('$a'), 'utf8') });

            Helper.validate(schema, [
                [{ b: '\u00bd' }, false, { context: { a: 'Hi there' } }, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });
    });

    describe('max()', () => {

        it('throws when limit is not a number', (done) => {

            expect(() => {

                Joi.string().max('a');
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not an integer', (done) => {

            expect(() => {

                Joi.string().max(1.2);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not a positive integer', (done) => {

            expect(() => {

                Joi.string().max(-1);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('enforces a limit using byte count', (done) => {

            const schema = Joi.string().max(1, 'utf8');
            Helper.validate(schema, [
                ['\u00bd', false, null, '"value" length must be less than or equal to 1 characters long'],
                ['a', true]
            ], done);
        });

        it('accepts references as min length', (done) => {

            const schema = Joi.object({ a: Joi.number(), b: Joi.string().max(Joi.ref('a'), 'utf8') });
            Helper.validate(schema, [
                [{ a: 2, b: '\u00bd' }, true],
                [{ a: 2, b: 'three' }, false, null, 'child "b" fails because ["b" length must be less than or equal to 2 characters long]']
            ], done);
        });

        it('accepts context references as min length', (done) => {

            const schema = Joi.object({ b: Joi.string().max(Joi.ref('$a'), 'utf8') });
            Helper.validate(schema, [
                [{ b: '\u00bd' }, true, { context: { a: 2 } }],
                [{ b: 'three' }, false, { context: { a: 2 } }, 'child "b" fails because ["b" length must be less than or equal to 2 characters long]']
            ], done);
        });

        it('errors if reference is not a number', (done) => {

            const schema = Joi.object({ a: Joi.any(), b: Joi.string().max(Joi.ref('a'), 'utf8') });

            Helper.validate(schema, [
                [{ a: 'Hi there', b: '\u00bd' }, false, null, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });

        it('errors if context reference is not a number', (done) => {

            const schema = Joi.object({ b: Joi.string().max(Joi.ref('$a'), 'utf8') });

            Helper.validate(schema, [
                [{ b: '\u00bd' }, false, { context: { a: 'Hi there' } }, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });
    });

    describe('creditCard()', () => {

        it('should validate credit card', (done) => {

            const t = Joi.string().creditCard();
            t.validate('4111111111111112', (err, value) => {

                expect(err.message).to.equal('"value" must be a credit card');

                Helper.validate(t, [
                    ['378734493671000', true],  // american express
                    ['371449635398431', true],  // american express
                    ['378282246310005', true],  // american express
                    ['341111111111111', true],  // american express
                    ['5610591081018250', true], // australian bank
                    ['5019717010103742', true], // dankort pbs
                    ['38520000023237', true],   // diners club
                    ['30569309025904', true],   // diners club
                    ['6011000990139424', true], // discover
                    ['6011111111111117', true], // discover
                    ['6011601160116611', true], // discover
                    ['3566002020360505', true], // jbc
                    ['3530111333300000', true], // jbc
                    ['5105105105105100', true], // mastercard
                    ['5555555555554444', true], // mastercard
                    ['5431111111111111', true], // mastercard
                    ['6331101999990016', true], // switch/solo paymentech
                    ['4222222222222', true],    // visa
                    ['4012888888881881', true], // visa
                    ['4111111111111111', true], // visa
                    ['4111111111111112', false, null, '"value" must be a credit card'],
                    [null, false, null, '"value" must be a string']
                ], done);
            });
        });
    });

    describe('length()', () => {

        it('throws when limit is not a number', (done) => {

            expect(() => {

                Joi.string().length('a');
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not an integer', (done) => {

            expect(() => {

                Joi.string().length(1.2);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('throws when limit is not a positive integer', (done) => {

            expect(() => {

                Joi.string().length(-42);
            }).to.throw('limit must be a positive integer or reference');
            done();
        });

        it('enforces a limit using byte count', (done) => {

            const schema = Joi.string().length(2, 'utf8');
            Helper.validate(schema, [
                ['\u00bd', true],
                ['a', false, null, '"value" length must be 2 characters long']
            ], done);
        });

        it('accepts references as length', (done) => {

            const schema = Joi.object({ a: Joi.number(), b: Joi.string().length(Joi.ref('a'), 'utf8') });
            Helper.validate(schema, [
                [{ a: 2, b: '\u00bd' }, true],
                [{ a: 2, b: 'a' }, false, null, 'child "b" fails because ["b" length must be 2 characters long]']
            ], done);
        });

        it('accepts context references as length', (done) => {

            const schema = Joi.object({ b: Joi.string().length(Joi.ref('$a'), 'utf8') });
            Helper.validate(schema, [
                [{ b: '\u00bd' }, true, { context: { a: 2 } }],
                [{ b: 'a' }, false, { context: { a: 2 } }, 'child "b" fails because ["b" length must be 2 characters long]'],
                [{ b: 'a' }, false, { context: { a: 2 } }, 'child "b" fails because ["b" length must be 2 characters long]', '']
            ], done);
        });

        it('errors if reference is not a number', (done) => {

            const schema = Joi.object({ a: Joi.any(), b: Joi.string().length(Joi.ref('a'), 'utf8') });

            Helper.validate(schema, [
                [{ a: 'Hi there', b: '\u00bd' }, false, null, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });

        it('errors if context reference is not a number', (done) => {

            const schema = Joi.object({ a: Joi.any(), b: Joi.string().length(Joi.ref('$a'), 'utf8') });

            Helper.validate(schema, [
                [{ b: '\u00bd' }, false, { context: { a: 'Hi there' } }, 'child "b" fails because ["b" references "a" which is not a number]']
            ], done);
        });
    });

    describe('email()', () => {

        it('throws when options are not an object', (done) => {

            expect(() => {

                const emailOptions = true;
                Joi.string().email(emailOptions);
            }).to.throw('email options must be an object');
            done();
        });

        it('throws when checkDNS option is enabled', (done) => {

            expect(() => {

                const emailOptions = { checkDNS: true };
                Joi.string().email(emailOptions);
            }).to.throw('checkDNS option is not supported');
            done();
        });

        it('throws when tldWhitelist is not an array or object', (done) => {

            expect(() => {

                const emailOptions = { tldWhitelist: 'domain.tld' };
                Joi.string().email(emailOptions);
            }).to.throw('tldWhitelist must be an array or object');
            done();
        });

        it('throws when minDomainAtoms is not a number', (done) => {

            expect(() => {

                const emailOptions = { minDomainAtoms: '1' };
                Joi.string().email(emailOptions);
            }).to.throw('minDomainAtoms must be a positive integer');
            done();
        });

        it('throws when minDomainAtoms is not an integer', (done) => {

            expect(() => {

                const emailOptions = { minDomainAtoms: 1.2 };
                Joi.string().email(emailOptions);
            }).to.throw('minDomainAtoms must be a positive integer');
            done();
        });

        it('throws when minDomainAtoms is not positive', (done) => {

            expect(() => {

                const emailOptions = { minDomainAtoms: 0 };
                Joi.string().email(emailOptions);
            }).to.throw('minDomainAtoms must be a positive integer');
            done();
        });

        it('does not throw when minDomainAtoms is a positive integer', (done) => {

            expect(() => {

                const emailOptions = { minDomainAtoms: 1 };
                Joi.string().email(emailOptions);
            }).to.not.throw();
            done();
        });

        it('throws when errorLevel is not an integer or boolean', (done) => {

            expect(() => {

                const emailOptions = { errorLevel: 1.2 };
                Joi.string().email(emailOptions);
            }).to.throw('errorLevel must be a non-negative integer or boolean');
            done();
        });

        it('throws when errorLevel is negative', (done) => {

            expect(() => {

                const emailOptions = { errorLevel: -1 };
                Joi.string().email(emailOptions);
            }).to.throw('errorLevel must be a non-negative integer or boolean');
            done();
        });

        it('does not throw when errorLevel is 0', (done) => {

            expect(() => {

                const emailOptions = { errorLevel: 0 };
                Joi.string().email(emailOptions);
            }).to.not.throw();
            done();
        });

        it('validates email', (done) => {

            const schema = Joi.string().email();
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['"joe"@example.com', true],
                ['@iaminvalid.com', false, null, '"value" must be a valid email'],
                ['joe@[IPv6:2a00:1450:4001:c02::1b]', true],
                ['12345678901234567890123456789012345678901234567890123456789012345@walmartlabs.com', false, null, '"value" must be a valid email'],
                ['123456789012345678901234567890123456789012345678901234567890@12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345.toolong.com', false, null, '"value" must be a valid email']
            ], done);
        });

        it('validates email with tldWhitelist as array', (done) => {

            const schema = Joi.string().email({ tldWhitelist: ['com', 'org'] });
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['joe@example.org', true],
                ['joe@example.edu', false, null, '"value" must be a valid email']
            ], done);
        });

        it('validates email with tldWhitelist as object', (done) => {

            const schema = Joi.string().email({ tldWhitelist: { com: true, org: true } });
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['joe@example.org', true],
                ['joe@example.edu', false, null, '"value" must be a valid email']
            ], done);
        });

        it('validates email with minDomainAtoms', (done) => {

            const schema = Joi.string().email({ minDomainAtoms: 4 });
            Helper.validate(schema, [
                ['joe@example.com', false, null, '"value" must be a valid email'],
                ['joe@www.example.com', false, null, '"value" must be a valid email'],
                ['joe@sub.www.example.com', true]
            ], done);
        });

        it('validates email with errorLevel as boolean', (done) => {

            let schema = Joi.string().email({ errorLevel: false });
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['joe@www.example.com', true],
                ['joe@localhost', true],
                ['joe', false, null, '"value" must be a valid email']
            ]);

            schema = Joi.string().email({ errorLevel: true });
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['joe@www.example.com', true],
                ['joe@localhost', false, null, '"value" must be a valid email'],
                ['joe', false, null, '"value" must be a valid email']
            ], done);
        });

        it('validates email with errorLevel as integer', (done) => {

            const schema = Joi.string().email({ errorLevel: 10 });
            Helper.validate(schema, [
                ['joe@example.com', true],
                ['joe@www.example.com', true],
                ['joe@localhost', true],
                ['joe', false, null, '"value" must be a valid email']
            ], done);
        });

        it('validates email with a friendly error message', (done) => {

            const schema = { item: Joi.string().email() };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('must be a valid email');
                done();
            });
        });
    });

    describe('hostname()', () => {

        it('validates hostnames', (done) => {

            const schema = Joi.string().hostname();
            Helper.validate(schema, [
                ['www.example.com', true],
                ['domain.local', true],
                ['3domain.local', true],
                ['hostname', true],
                ['host:name', false, null, '"value" must be a valid hostname'],
                ['-', false, null, '"value" must be a valid hostname'],
                ['2387628', true],
                ['01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789', false, null, '"value" must be a valid hostname'],
                ['::1', true],
                ['0:0:0:0:0:0:0:1', true],
                ['0:?:0:0:0:0:0:1', false, null, '"value" must be a valid hostname']
            ], done);
        });
    });

    describe('lowercase()', () => {

        it('only allows strings that are entirely lowercase', (done) => {

            const schema = Joi.string().lowercase();
            Helper.validateOptions(schema, [
                ['this is all lowercase', true],
                ['5', true],
                ['lower\tcase', true],
                ['Uppercase', false, null, '"value" must only contain lowercase characters'],
                ['MixEd cAsE', false, null, '"value" must only contain lowercase characters'],
                [1, false, null, '"value" must be a string']
            ], { convert: false }, done);
        });

        it('coerce string to lowercase before validation', (done) => {

            const schema = Joi.string().lowercase();
            schema.validate('UPPER TO LOWER', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('upper to lower');
                done();
            });
        });

        it('should work in combination with a trim', (done) => {

            const schema = Joi.string().lowercase().trim();
            Helper.validate(schema, [
                [' abc', true],
                [' ABC', true],
                ['ABC', true],
                [1, false, null, '"value" must be a string']
            ], done);
        });

        it('should work in combination with a replacement', (done) => {

            const schema = Joi.string().lowercase().replace(/\s+/g, ' ');
            Helper.validate(schema, [
                ['a\r b\n c', true, null, 'a b c'],
                ['A\t B  C', true, null, 'a b c'],
                ['ABC', true, null, 'abc'],
                [1, false, null, '"value" must be a string']
            ], done);
        });
    });

    describe('uppercase()', () => {

        it('only allow strings that are entirely uppercase', (done) => {

            const schema = Joi.string().uppercase();
            Helper.validateOptions(schema, [
                ['THIS IS ALL UPPERCASE', true],
                ['5', true],
                ['UPPER\nCASE', true],
                ['lOWERCASE', false, null, '"value" must only contain uppercase characters'],
                ['MixEd cAsE', false, null, '"value" must only contain uppercase characters'],
                [1, false, null, '"value" must be a string']
            ], { convert: false }, done);
        });

        it('coerce string to uppercase before validation', (done) => {

            const schema = Joi.string().uppercase();
            schema.validate('lower to upper', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('LOWER TO UPPER');
                done();
            });
        });

        it('works in combination with a forced trim', (done) => {

            const schema = Joi.string().uppercase().trim();
            Helper.validate(schema, [
                [' abc', true],
                [' ABC', true],
                ['ABC', true],
                [1, false, null, '"value" must be a string']
            ], done);
        });

        it('works in combination with a forced replacement', (done) => {

            const schema = Joi.string().uppercase().replace(/\s+/g, ' ');
            Helper.validate(schema, [
                ['a\r b\n c', true, null, 'A B C'],
                ['A\t B  C', true, null, 'A B C'],
                ['ABC', true, null, 'ABC'],
                [1, false, null, '"value" must be a string']
            ], done);
        });
    });

    describe('trim()', () => {

        it('only allow strings that have no leading or trailing whitespace', (done) => {

            const schema = Joi.string().trim();
            Helper.validateOptions(schema, [
                [' something', false, null, '"value" must not have leading or trailing whitespace'],
                ['something ', false, null, '"value" must not have leading or trailing whitespace'],
                ['something\n', false, null, '"value" must not have leading or trailing whitespace'],
                ['some thing', true],
                ['something', true]
            ], { convert: false }, done);
        });

        it('removes leading and trailing whitespace before validation', (done) => {

            const schema = Joi.string().trim();
            schema.validate(' trim this ', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('trim this');
                done();
            });
        });

        it('removes leading and trailing whitespace before validation', (done) => {

            const schema = Joi.string().trim().allow('');
            schema.validate('     ', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('');
                done();
            });
        });

        it('should work in combination with min', (done) => {

            const schema = Joi.string().min(4).trim();
            Helper.validate(schema, [
                [' a ', false, null, '"value" length must be at least 4 characters long'],
                ['abc ', false, null, '"value" length must be at least 4 characters long'],
                ['abcd ', true]
            ], done);
        });

        it('should work in combination with max', (done) => {

            const schema = Joi.string().max(4).trim();
            Helper.validate(schema, [
                [' abcde ', false, null, '"value" length must be less than or equal to 4 characters long'],
                ['abc ', true],
                ['abcd ', true]
            ], done);
        });

        it('should work in combination with length', (done) => {

            const schema = Joi.string().length(4).trim();
            Helper.validate(schema, [
                [' ab ', false, null, '"value" length must be 4 characters long'],
                ['abc ', false, null, '"value" length must be 4 characters long'],
                ['abcd ', true]
            ], done);
        });

        it('should work in combination with a case change', (done) => {

            const schema = Joi.string().trim().lowercase();
            Helper.validate(schema, [
                [' abc', true],
                [' ABC', true],
                ['ABC', true]
            ], done);
        });
    });

    describe('replace()', () => {

        it('successfully replaces the first occurrence of the expression', (done) => {

            const schema = Joi.string().replace(/\s+/, ''); // no "g" flag
            Helper.validateOptions(schema, [
                ['\tsomething', true, null, 'something'],
                ['something\r', true, null, 'something'],
                ['something  ', true, null, 'something'],
                ['some  thing', true, null, 'something'],
                ['so me thing', true, null, 'some thing'] // first occurrence!
            ], { convert: true }, done);
        });

        it('successfully replaces all occurrences of the expression', (done) => {

            const schema = Joi.string().replace(/\s+/g, ''); // has "g" flag
            Helper.validateOptions(schema, [
                ['\tsomething', true, null, 'something'],
                ['something\r', true, null, 'something'],
                ['something  ', true, null, 'something'],
                ['some  thing', true, null, 'something'],
                ['so me thing', true, null, 'something']
            ], { convert: true }, done);
        });

        it('successfully replaces all occurrences of a string pattern', (done) => {

            const schema = Joi.string().replace('foo', 'X'); // has "g" flag
            Helper.validateOptions(schema, [
                ['foobarfoobazfoo', true, null, 'XbarXbazX']
            ], { convert: true }, done);
        });

        it('successfully replaces multiple times', (done) => {

            const schema = Joi.string().replace(/a/g, 'b').replace(/b/g, 'c');
            schema.validate('a quick brown fox', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('c quick crown fox');
                done();
            });
        });

        it('should work in combination with trim', (done) => {

            // The string below is the name "Yamada Tarou" separated by a
            // carriage return, a "full width" ideographic space and a newline

            const schema = Joi.string().trim().replace(/\s+/g, ' ');
            schema.validate(' \u5C71\u7530\r\u3000\n\u592A\u90CE ', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('\u5C71\u7530 \u592A\u90CE');
                done();
            });
        });

        it('should work in combination with min', (done) => {

            const schema = Joi.string().min(4).replace(/\s+/g, ' ');
            Helper.validate(schema, [
                ['   a   ', false, null, '"value" length must be at least 4 characters long'],
                ['abc    ', true, null, 'abc '],
                ['a\t\rbc', true, null, 'a bc']
            ], done);
        });

        it('should work in combination with max', (done) => {

            const schema = Joi.string().max(5).replace(/ CHANGE ME /g, '-b-');
            Helper.validate(schema, [
                ['a CHANGE ME c', true, null, 'a-b-c'],
                ['a-b-c', true, null, 'a-b-c'] // nothing changes here!
            ], done);
        });

        it('should work in combination with length', (done) => {

            const schema = Joi.string().length(5).replace(/\s+/g, ' ');
            Helper.validate(schema, [
                ['a    bc', false, null, '"value" length must be 5 characters long'],
                ['a\tb\nc', true, null, 'a b c']
            ], done);
        });

    });

    describe('regex()', () => {

        it('should not include a pattern name by default', (done) => {

            const schema = Joi.string().regex(/[a-z]+/).regex(/[0-9]+/);
            schema.validate('abcd', (err, value) => {

                expect(err.message).to.contain('required pattern');
                done();
            });
        });

        it('should include a pattern name if specified', (done) => {

            const schema = Joi.string().regex(/[a-z]+/, 'letters').regex(/[0-9]+/, 'numbers');
            schema.validate('abcd', (err, value) => {

                expect(err.message).to.contain('numbers pattern');
                done();
            });
        });
    });

    describe('ip()', () => {

        const prepareIps = function (ips) {

            return function (success, message) {

                message = message || '';
                return ips.map((ip) => [ip, success, null, !success && message ? message : ip]);
            };
        };

        const invalidIPs = function (message) {

            return prepareIps([
                'ASDF',
                '192.0.2.16:80/30',
                '192.0.2.16a',
                'qwerty',
                '127.0.0.1:8000',
                'ftp://www.example.com',
                'Bananas in pajamas are coming down the stairs'
            ])(false, message);
        };

        const invalidIPv4s = function (message) {

            return prepareIps([
                '0.0.0.0/33',
                '256.0.0.0/0',
                '255.255.255.256/32',
                '256.0.0.0',
                '255.255.255.256'
            ])(false, message);
        };

        const invalidIPv6s = function (message) {

            return prepareIps([
                '2001:db8::7/33',
                '1080:0:0:0:8:800:200C:417G'
            ])(false, message);
        };

        const invalidIPvFutures = function (message) {

            return prepareIps([
                'v1.09azAZ-._~!$&\'()*+,;=:/33',
                'v1.09#'
            ])(false, message);
        };

        const validIPv4sWithCidr = prepareIps([
            '0.0.0.0/32',
            '255.255.255.255/0',
            '127.0.0.1/0',
            '192.168.2.1/0',
            '0.0.0.3/2',
            '0.0.0.7/3',
            '0.0.0.15/4',
            '0.0.0.31/5',
            '0.0.0.63/6',
            '0.0.0.127/7',
            '01.020.030.100/7',
            '0.0.0.0/0',
            '00.00.00.00/0',
            '000.000.000.000/32'
        ]);

        const validIPv4sWithoutCidr = prepareIps([
            '0.0.0.0',
            '255.255.255.255',
            '127.0.0.1',
            '192.168.2.1',
            '0.0.0.3',
            '0.0.0.7',
            '0.0.0.15',
            '0.0.0.31',
            '0.0.0.63',
            '0.0.0.127',
            '01.020.030.100',
            '0.0.0.0',
            '00.00.00.00',
            '000.000.000.000'
        ]);

        const validIPv6sWithCidr = prepareIps([
            '2001:db8::7/32',
            'a:b:c:d:e::1.2.3.4/13',
            'FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/0',
            'FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/32',
            '1080:0:0:0:8:800:200C:417A/27'
        ]);

        const validIPv6sWithoutCidr = prepareIps([
            '2001:db8::7',
            'a:b:c:d:e::1.2.3.4',
            'FEDC:BA98:7654:3210:FEDC:BA98:7654:3210',
            'FEDC:BA98:7654:3210:FEDC:BA98:7654:3210',
            '1080:0:0:0:8:800:200C:417A',
            '::1:2:3:4:5:6:7',
            '::1:2:3:4:5:6',
            '1::1:2:3:4:5:6',
            '::1:2:3:4:5',
            '1::1:2:3:4:5',
            '2:1::1:2:3:4:5',
            '::1:2:3:4',
            '1::1:2:3:4',
            '2:1::1:2:3:4',
            '3:2:1::1:2:3:4',
            '::1:2:3',
            '1::1:2:3',
            '2:1::1:2:3',
            '3:2:1::1:2:3',
            '4:3:2:1::1:2:3',
            '::1:2',
            '1::1:2',
            '2:1::1:2',
            '3:2:1::1:2',
            '4:3:2:1::1:2',
            '5:4:3:2:1::1:2',
            '::1',
            '1::1',
            '2:1::1',
            '3:2:1::1',
            '4:3:2:1::1',
            '5:4:3:2:1::1',
            '6:5:4:3:2:1::1',
            '::',
            '1::',
            '2:1::',
            '3:2:1::',
            '4:3:2:1::',
            '5:4:3:2:1::',
            '6:5:4:3:2:1::',
            '7:6:5:4:3:2:1::'
        ]);

        const validIPvFuturesWithCidr = prepareIps(['v1.09azAZ-._~!$&\'()*+,;=:/32']);

        const validIPvFuturesWithoutCidr = prepareIps(['v1.09azAZ-._~!$&\'()*+,;=:']);

        it('should validate all ip addresses with optional CIDR by default', (done) => {

            const schema = Joi.string().ip();
            const message = '"value" must be a valid ip address with a optional CIDR';
            Helper.validate(schema, []
                .concat(validIPv4sWithCidr(true))
                .concat(validIPv4sWithoutCidr(true))
                .concat(validIPv6sWithCidr(true))
                .concat(validIPv6sWithoutCidr(true))
                .concat(validIPvFuturesWithCidr(true))
                .concat(validIPvFuturesWithoutCidr(true))
                .concat(invalidIPs(message))
                .concat(invalidIPv4s(message))
                .concat(invalidIPv6s(message))
                .concat(invalidIPvFutures(message)), done);
        });

        it('should validate all ip addresses with an optional CIDR', (done) => {

            const schema = Joi.string().ip({ cidr: 'optional' });
            const message = '"value" must be a valid ip address with a optional CIDR';
            Helper.validate(schema, []
                .concat(validIPv4sWithCidr(true))
                .concat(validIPv4sWithoutCidr(true))
                .concat(validIPv6sWithCidr(true))
                .concat(validIPv6sWithoutCidr(true))
                .concat(validIPvFuturesWithCidr(true))
                .concat(validIPvFuturesWithoutCidr(true))
                .concat(invalidIPs(message))
                .concat(invalidIPv4s(message))
                .concat(invalidIPv6s(message))
                .concat(invalidIPvFutures(message)), done);
        });

        it('should validate all ip addresses with a required CIDR', (done) => {

            const schema = Joi.string().ip({ cidr: 'required' });
            const message = '"value" must be a valid ip address with a required CIDR';
            Helper.validate(schema, []
                .concat(validIPv4sWithCidr(true))
                .concat(validIPv4sWithoutCidr(false, message))
                .concat(validIPv6sWithCidr(true))
                .concat(validIPv6sWithoutCidr(false, message))
                .concat(validIPvFuturesWithCidr(true))
                .concat(validIPvFuturesWithoutCidr(false, message))
                .concat(invalidIPs(message))
                .concat(invalidIPv4s(message))
                .concat(invalidIPv6s(message))
                .concat(invalidIPvFutures(message)), done);
        });

        it('should validate all ip addresses with a forbidden CIDR', (done) => {

            const schema = Joi.string().ip({ cidr: 'forbidden' });
            const message = '"value" must be a valid ip address with a forbidden CIDR';
            Helper.validate(schema, []
                .concat(validIPv4sWithCidr(false, message))
                .concat(validIPv4sWithoutCidr(true))
                .concat(validIPv6sWithCidr(false, message))
                .concat(validIPv6sWithoutCidr(true))
                .concat(validIPvFuturesWithCidr(false, message))
                .concat(validIPvFuturesWithoutCidr(true))
                .concat(invalidIPs(message))
                .concat(invalidIPv4s(message))
                .concat(invalidIPv6s(message))
                .concat(invalidIPvFutures(message)), done);
        });

        it('throws when options is not an object', (done) => {

            expect(() => {

                Joi.string().ip(42);
            }).to.throw('options must be an object');
            done();
        });

        it('throws when options.cidr is not a string', (done) => {

            expect(() => {

                Joi.string().ip({ cidr: 42 });
            }).to.throw('cidr must be a string');
            done();
        });

        it('throws when options.cidr is not a valid value', (done) => {

            expect(() => {

                Joi.string().ip({ cidr: '42' });
            }).to.throw('cidr must be one of required, optional, forbidden');
            done();
        });

        it('throws when options.version is an empty array', (done) => {

            expect(() => {

                Joi.string().ip({ version: [] });
            }).to.throw('version must have at least 1 version specified');
            done();
        });

        it('throws when options.version is not a string', (done) => {

            expect(() => {

                Joi.string().ip({ version: 42 });
            }).to.throw('version at position 0 must be a string');
            done();
        });

        it('throws when options.version is not a valid value', (done) => {

            expect(() => {

                Joi.string().ip({ version: '42' });
            }).to.throw('version at position 0 must be one of ipv4, ipv6, ipvfuture');
            done();
        });

        it('validates ip with a friendly error message', (done) => {

            const schema = { item: Joi.string().ip() };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('must be a valid ip address');
                done();
            });
        });

        it('validates ip and cidr presence with a friendly error message', (done) => {

            const schema = { item: Joi.string().ip({ cidr: 'required' }) };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('must be a valid ip address with a required CIDR');
                done();
            });
        });

        it('validates custom ip version and cidr presence with a friendly error message', (done) => {

            const schema = { item: Joi.string().ip({ version: 'ipv4', cidr: 'required' }) };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('child "item" fails because ["item" must be a valid ip address of one of the following versions [ipv4] with a required CIDR]');
                done();
            });
        });

        describe('ip({ version: "ipv4" })', () => {

            it('should validate all ipv4 addresses with a default CIDR strategy', (done) => {

                const schema = Joi.string().ip({ version: 'ipv4' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 addresses with an optional CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv4', cidr: 'optional' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 addresses with a required CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv4', cidr: 'required' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4] with a required CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 addresses with a forbidden CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv4', cidr: 'forbidden' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4] with a forbidden CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });
        });

        describe('ip({ version: "ipv6" })', () => {

            it('should validate all ipv6 addresses with a default CIDR strategy', (done) => {

                const schema = Joi.string().ip({ version: 'ipv6' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv6] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv6 addresses with an optional CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv6', cidr: 'optional' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv6] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv6 addresses with a required CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv6', cidr: 'required' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv6] with a required CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv6 addresses with a forbidden CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipv6', cidr: 'forbidden' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv6] with a forbidden CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });
        });

        describe('ip({ version: "ipvfuture" })', () => {

            it('should validate all ipvfuture addresses with a default CIDR strategy', (done) => {

                const schema = Joi.string().ip({ version: 'ipvfuture' });
                const message = '"value" must be a valid ip address of one of the following versions [ipvfuture] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(true))
                    .concat(validIPvFuturesWithoutCidr(true))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipvfuture addresses with an optional CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipvfuture', cidr: 'optional' });
                const message = '"value" must be a valid ip address of one of the following versions [ipvfuture] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(true))
                    .concat(validIPvFuturesWithoutCidr(true))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipvfuture addresses with a required CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipvfuture', cidr: 'required' });
                const message = '"value" must be a valid ip address of one of the following versions [ipvfuture] with a required CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(true))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipvfuture addresses with a forbidden CIDR', (done) => {

                const schema = Joi.string().ip({ version: 'ipvfuture', cidr: 'forbidden' });
                const message = '"value" must be a valid ip address of one of the following versions [ipvfuture] with a forbidden CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(true))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });
        });

        describe('ip({ version: [ "ipv4", "ipv6" ] })', () => {

            it('should validate all ipv4 and ipv6 addresses with a default CIDR strategy', (done) => {

                const schema = Joi.string().ip({ version: ['ipv4', 'ipv6'] });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4, ipv6] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 and ipv6 addresses with an optional CIDR', (done) => {

                const schema = Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4, ipv6] with a optional CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 and ipv6 addresses with a required CIDR', (done) => {

                const schema = Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'required' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4, ipv6] with a required CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(true))
                    .concat(validIPv4sWithoutCidr(false, message))
                    .concat(validIPv6sWithCidr(true))
                    .concat(validIPv6sWithoutCidr(false, message))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });

            it('should validate all ipv4 and ipv6 addresses with a forbidden CIDR', (done) => {

                const schema = Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'forbidden' });
                const message = '"value" must be a valid ip address of one of the following versions [ipv4, ipv6] with a forbidden CIDR';
                Helper.validate(schema, []
                    .concat(validIPv4sWithCidr(false, message))
                    .concat(validIPv4sWithoutCidr(true))
                    .concat(validIPv6sWithCidr(false, message))
                    .concat(validIPv6sWithoutCidr(true))
                    .concat(validIPvFuturesWithCidr(false, message))
                    .concat(validIPvFuturesWithoutCidr(false, message))
                    .concat(invalidIPs(message))
                    .concat(invalidIPv4s(message))
                    .concat(invalidIPv6s(message))
                    .concat(invalidIPvFutures(message)), done);
            });
        });
    });

    describe('uri()', () => {

        it('validates uri', (done) => {

            // Handful of tests taken from Node: https://github.com/joyent/node/blob/cfcb1de130867197cbc9c6012b7e84e08e53d032/test/simple/test-url.js
            // Also includes examples from RFC 8936: http://tools.ietf.org/html/rfc3986#page-7
            const schema = Joi.string().uri();

            Helper.validate(schema, [
                ['foo://example.com:8042/over/there?name=ferret#nose', true],
                ['urn:example:animal:ferret:nose', true],
                ['ftp://ftp.is.co.za/rfc/rfc1808.txt', true],
                ['http://www.ietf.org/rfc/rfc2396.txt', true],
                ['ldap://[2001:db8::7]/c=GB?objectClass?one', true],
                ['ldap://2001:db8::7/c=GB?objectClass?one', false, null, '"value" must be a valid uri'],
                ['mailto:John.Doe@example.com', true],
                ['news:comp.infosystems.www.servers.unix', true],
                ['tel:+1-816-555-1212', true],
                ['telnet://192.0.2.16:80/', true],
                ['urn:oasis:names:specification:docbook:dtd:xml:4.1.2', true],
                ['file:///example.txt', true],
                ['http://asdf:qw%20er@localhost:8000?asdf=12345&asda=fc%2F#bacon', true],
                ['http://asdf@localhost:8000', true],
                ['http://[v1.09azAZ-._~!$&\'()*+,;=:]', true],
                ['http://[a:b:c:d:e::1.2.3.4]', true],
                ['coap://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]', true],
                ['http://[1080:0:0:0:8:800:200C:417A]', true],
                ['http://v1.09azAZ-._~!$&\'()*+,;=:', true], // This doesn't look valid, but it is. The `v1.09azAZ-._~!$&\'()*+,;=` part is a valid registered name as it has no invalid characters
                ['http://a:b:c:d:e::1.2.3.4', false, null, '"value" must be a valid uri'],
                ['coap://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210', false, null, '"value" must be a valid uri'],
                ['http://1080:0:0:0:8:800:200C:417A', false, null, '"value" must be a valid uri'],
                ['http://127.0.0.1:8000/foo?bar', true],
                ['http://asdf:qwer@localhost:8000', true],
                ['http://user:pass%3A@localhost:80', true],
                ['http://localhost:123', true],
                ['https://localhost:123', true],
                ['file:///whatever', true],
                ['mailto:asdf@asdf.com', true],
                ['ftp://www.example.com', true],
                ['javascript:alert(\'hello\');', true], // eslint-disable-line no-script-url
                ['xmpp:isaacschlueter@jabber.org', true],
                ['f://some.host/path', true],
                ['http://localhost:18/asdf', true],
                ['http://localhost:42/asdf?qwer=zxcv', true],
                ['HTTP://www.example.com/', true],
                ['HTTP://www.example.com', true],
                ['http://www.ExAmPlE.com/', true],
                ['http://user:pw@www.ExAmPlE.com/', true],
                ['http://USER:PW@www.ExAmPlE.com/', true],
                ['http://user@www.example.com/', true],
                ['http://user%3Apw@www.example.com/', true],
                ['http://x.com/path?that%27s#all,%20folks', true],
                ['HTTP://X.COM/Y', true],
                ['http://www.narwhaljs.org/blog/categories?id=news', true],
                ['http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://user:pass@mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://_jabber._tcp.google.com:80/test', true],
                ['http://user:pass@_jabber._tcp.google.com:80/test', true],
                ['http://[fe80::1]/a/b?a=b#abc', true],
                ['http://fe80::1/a/b?a=b#abc', false, null, '"value" must be a valid uri'],
                ['http://user:password@[3ffe:2a00:100:7031::1]:8080', true],
                ['coap://[1080:0:0:0:8:800:200C:417A]:61616/', true],
                ['coap://1080:0:0:0:8:800:200C:417A:61616/', false, null, '"value" must be a valid uri'],
                ['git+http://github.com/joyent/node.git', true],
                ['http://bucket_name.s3.amazonaws.com/image.jpg', true],
                ['dot.test://foo/bar', true],
                ['svn+ssh://foo/bar', true],
                ['dash-test://foo/bar', true],
                ['xmpp:isaacschlueter@jabber.org', true],
                ['http://atpass:foo%40bar@127.0.0.1:8080/path?search=foo#bar', true],
                ['javascript:alert(\'hello\');', true], // eslint-disable-line no-script-url
                ['file://localhost/etc/node/', true],
                ['file:///etc/node/', true],
                ['http://USER:PW@www.ExAmPlE.com/', true],
                ['mailto:local1@domain1?query1', true],
                ['http://example/a/b?c/../d', true],
                ['http://example/x%2Fabc', true],
                ['http://a/b/c/d;p=1/g;x=1/y', true],
                ['http://a/b/c/g#s/../x', true],
                ['http://a/b/c/.foo', true],
                ['http://example.com/b//c//d;p?q#blarg', true],
                ['g:h', true],
                ['http://a/b/c/g', true],
                ['http://a/b/c/g/', true],
                ['http://a/g', true],
                ['http://g', true],
                ['http://a/b/c/d;p?y', true],
                ['http://a/b/c/g?y', true],
                ['http://a/b/c/d;p?q#s', true],
                ['http://a/b/c/g#s', true],
                ['http://a/b/c/g?y#s', true],
                ['http://a/b/c/;x', true],
                ['http://a/b/c/g;x', true],
                ['http://a/b/c/g;x?y#s', true],
                ['http://a/b/c/d;p?q', true],
                ['http://a/b/c/', true],
                ['http://a/b/', true],
                ['http://a/b/g', true],
                ['http://a/', true],
                ['http://a/g', true],
                ['http://a/g', true],
                ['file:/asda', true],
                ['qwerty', false, null, '"value" must be a valid uri'],
                ['invalid uri', false, null, '"value" must be a valid uri'],
                ['1http://google.com', false, null, '"value" must be a valid uri'],
                ['http://testdomain`,.<>/?\'";{}][++\\|~!@#$%^&*().org', false, null, '"value" must be a valid uri'],
                ['', false, null, '"value" is not allowed to be empty'],
                ['(╯°□°)╯︵ ┻━┻', false, null, '"value" must be a valid uri'],
                ['one/two/three?value=abc&value2=123#david-rules', false, null, '"value" must be a valid uri'],
                ['//username:password@test.example.com/one/two/three?value=abc&value2=123#david-rules', false, null, '"value" must be a valid uri'],
                ['http://a\r" \t\n<\'b:b@c\r\nd/e?f', false, null, '"value" must be a valid uri'],
                ['/absolute', false, null, '"value" must be a valid uri']
            ], done);
        });

        it('validates uri with a single scheme provided', (done) => {

            const schema = Joi.string().uri({
                scheme: 'http'
            });

            Helper.validate(schema, [
                ['http://google.com', true],
                ['https://google.com', false, null, '"value" must be a valid uri with a scheme matching the http pattern'],
                ['ftp://google.com', false, null, '"value" must be a valid uri with a scheme matching the http pattern'],
                ['file:/asdf', false, null, '"value" must be a valid uri with a scheme matching the http pattern'],
                ['/path?query=value#hash', false, null, '"value" must be a valid uri with a scheme matching the http pattern']
            ], done);
        });

        it('validates uri with a single regex scheme provided', (done) => {

            const schema = Joi.string().uri({
                scheme: /https?/
            });

            Helper.validate(schema, [
                ['http://google.com', true],
                ['https://google.com', true],
                ['ftp://google.com', false, null, '"value" must be a valid uri with a scheme matching the https? pattern'],
                ['file:/asdf', false, null, '"value" must be a valid uri with a scheme matching the https? pattern'],
                ['/path?query=value#hash', false, null, '"value" must be a valid uri with a scheme matching the https? pattern']
            ], done);
        });

        it('validates uri with multiple schemes provided', (done) => {

            const schema = Joi.string().uri({
                scheme: [/https?/, 'ftp', 'file', 'git+http']
            });

            Helper.validate(schema, [
                ['http://google.com', true],
                ['https://google.com', true],
                ['ftp://google.com', true],
                ['file:/asdf', true],
                ['git+http://github.com/hapijs/joi', true],
                ['/path?query=value#hash', false, null, '"value" must be a valid uri with a scheme matching the https?|ftp|file|git\\+http pattern']
            ], done);
        });

        it('validates uri with a friendly error message', (done) => {

            const schema = { item: Joi.string().uri() };

            Joi.compile(schema).validate({ item: 'something invalid' }, (err, value) => {

                expect(err.message).to.contain('must be a valid uri');
                done();
            });
        });

        it('validates uri with a custom scheme with a friendly error message', (done) => {

            const schema = {
                item: Joi.string().uri({
                    scheme: 'http'
                })
            };

            Joi.compile(schema).validate({ item: 'something invalid' }, (err, value) => {

                expect(err.message).to.contain('must be a valid uri with a scheme matching the http pattern');
                done();
            });
        });

        it('validates uri with a custom array of schemes with a friendly error message', (done) => {

            const schema = {
                item: Joi.string().uri({
                    scheme: ['http', /https?/]
                })
            };

            Joi.compile(schema).validate({ item: 'something invalid' }, (err, value) => {

                expect(err.message).to.contain('must be a valid uri with a scheme matching the http|https? pattern');
                done();
            });
        });

        it('validates uri treats scheme as optional', (done) => {

            expect(() => {

                Joi.string().uri({});
            }).to.not.throw();

            done();
        });

        it('validates uri requires uriOptions as an object with a friendly error message', (done) => {

            expect(() => {

                Joi.string().uri('http');
            }).to.throw(Error, 'options must be an object');

            done();
        });

        it('validates uri requires scheme to be a RegExp, String, or Array with a friendly error message', (done) => {

            expect(() => {

                Joi.string().uri({
                    scheme: {}
                });
            }).to.throw(Error, 'scheme must be a RegExp, String, or Array');

            done();
        });

        it('validates uri requires scheme to not be an empty array', (done) => {

            expect(() => {

                Joi.string().uri({
                    scheme: []
                });
            }).to.throw(Error, 'scheme must have at least 1 scheme specified');

            done();
        });

        it('validates uri requires scheme to be an Array of schemes to all be valid schemes with a friendly error message', (done) => {

            expect(() => {

                Joi.string().uri({
                    scheme: [
                        'http',
                        '~!@#$%^&*()_'
                    ]
                });
            }).to.throw(Error, 'scheme at position 1 must be a valid scheme');

            done();
        });

        it('validates uri requires scheme to be an Array of schemes to be strings or RegExp', (done) => {

            expect(() => {

                Joi.string().uri({
                    scheme: [
                        'http',
                        {}
                    ]
                });
            }).to.throw(Error, 'scheme at position 1 must be a RegExp or String');

            done();
        });

        it('validates uri requires scheme to be a valid String scheme with a friendly error message', (done) => {

            expect(() => {

                Joi.string().uri({
                    scheme: '~!@#$%^&*()_'
                });
            }).to.throw(Error, 'scheme at position 0 must be a valid scheme');

            done();
        });

        it('validates relative uri', (done) => {

            const schema = Joi.string().uri({ allowRelative: true });
            Helper.validate(schema, [
                ['foo://example.com:8042/over/there?name=ferret#nose', true],
                ['urn:example:animal:ferret:nose', true],
                ['ftp://ftp.is.co.za/rfc/rfc1808.txt', true],
                ['http://www.ietf.org/rfc/rfc2396.txt', true],
                ['ldap://[2001:db8::7]/c=GB?objectClass?one', true],
                ['mailto:John.Doe@example.com', true],
                ['news:comp.infosystems.www.servers.unix', true],
                ['tel:+1-816-555-1212', true],
                ['telnet://192.0.2.16:80/', true],
                ['urn:oasis:names:specification:docbook:dtd:xml:4.1.2', true],
                ['file:///example.txt', true],
                ['http://asdf:qw%20er@localhost:8000?asdf=12345&asda=fc%2F#bacon', true],
                ['http://asdf@localhost:8000', true],
                ['http://[v1.09azAZ-._~!$&\'()*+,;=:]', true],
                ['http://[a:b:c:d:e::1.2.3.4]', true],
                ['coap://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]', true],
                ['http://[1080:0:0:0:8:800:200C:417A]', true],
                ['http://127.0.0.1:8000/foo?bar', true],
                ['http://asdf:qwer@localhost:8000', true],
                ['http://user:pass%3A@localhost:80', true],
                ['http://localhost:123', true],
                ['https://localhost:123', true],
                ['file:///whatever', true],
                ['mailto:asdf@asdf.com', true],
                ['ftp://www.example.com', true],
                ['javascript:alert(\'hello\');', true], // eslint-disable-line no-script-url
                ['xmpp:isaacschlueter@jabber.org', true],
                ['f://some.host/path', true],
                ['http://localhost:18/asdf', true],
                ['http://localhost:42/asdf?qwer=zxcv', true],
                ['HTTP://www.example.com/', true],
                ['HTTP://www.example.com', true],
                ['http://www.ExAmPlE.com/', true],
                ['http://user:pw@www.ExAmPlE.com/', true],
                ['http://USER:PW@www.ExAmPlE.com/', true],
                ['http://user@www.example.com/', true],
                ['http://user%3Apw@www.example.com/', true],
                ['http://x.com/path?that%27s#all,%20folks', true],
                ['HTTP://X.COM/Y', true],
                ['http://www.narwhaljs.org/blog/categories?id=news', true],
                ['http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://user:pass@mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=', true],
                ['http://_jabber._tcp.google.com:80/test', true],
                ['http://user:pass@_jabber._tcp.google.com:80/test', true],
                ['http://[fe80::1]/a/b?a=b#abc', true],
                ['http://user:password@[3ffe:2a00:100:7031::1]:8080', true],
                ['coap://[1080:0:0:0:8:800:200C:417A]:61616/', true],
                ['git+http://github.com/joyent/node.git', true],
                ['http://bucket_name.s3.amazonaws.com/image.jpg', true],
                ['dot.test://foo/bar', true],
                ['svn+ssh://foo/bar', true],
                ['dash-test://foo/bar', true],
                ['xmpp:isaacschlueter@jabber.org', true],
                ['http://atpass:foo%40bar@127.0.0.1:8080/path?search=foo#bar', true],
                ['javascript:alert(\'hello\');', true], // eslint-disable-line no-script-url
                ['file://localhost/etc/node/', true],
                ['file:///etc/node/', true],
                ['http://USER:PW@www.ExAmPlE.com/', true],
                ['mailto:local1@domain1?query1', true],
                ['http://example/a/b?c/../d', true],
                ['http://example/x%2Fabc', true],
                ['http://a/b/c/d;p=1/g;x=1/y', true],
                ['http://a/b/c/g#s/../x', true],
                ['http://a/b/c/.foo', true],
                ['http://example.com/b//c//d;p?q#blarg', true],
                ['g:h', true],
                ['http://a/b/c/g', true],
                ['http://a/b/c/g/', true],
                ['http://a/g', true],
                ['http://g', true],
                ['http://a/b/c/d;p?y', true],
                ['http://a/b/c/g?y', true],
                ['http://a/b/c/d;p?q#s', true],
                ['http://a/b/c/g#s', true],
                ['http://a/b/c/g?y#s', true],
                ['http://a/b/c/;x', true],
                ['http://a/b/c/g;x', true],
                ['http://a/b/c/g;x?y#s', true],
                ['http://a/b/c/d;p?q', true],
                ['http://a/b/c/', true],
                ['http://a/b/', true],
                ['http://a/b/g', true],
                ['http://a/', true],
                ['http://a/g', true],
                ['http://a/g', true],
                ['file:/asda', true],
                ['qwerty', true],
                ['invalid uri', false, null, '"value" must be a valid uri'],
                ['1http://google.com', false, null, '"value" must be a valid uri'],
                ['http://testdomain`,.<>/?\'";{}][++\\|~!@#$%^&*().org', false, null, '"value" must be a valid uri'],
                ['', false, null, '"value" is not allowed to be empty'],
                ['(╯°□°)╯︵ ┻━┻', false, null, '"value" must be a valid uri'],
                ['one/two/three?value=abc&value2=123#david-rules', true],
                ['//username:password@test.example.com/one/two/three?value=abc&value2=123#david-rules', true],
                ['http://a\r" \t\n<\'b:b@c\r\nd/e?f', false, null, '"value" must be a valid uri'],
                ['/absolute', true]
            ], done);
        });
    });

    describe('truncate()', () => {

        it('switches the truncate flag', (done) => {

            const schema = Joi.string().truncate();
            const desc = schema.describe();
            expect(desc).to.equal({
                type: 'string',
                invalids: [''],
                flags: { truncate: true }
            });
            done();
        });

        it('switches the truncate flag with explicit value', (done) => {

            const schema = Joi.string().truncate(true);
            const desc = schema.describe();
            expect(desc).to.equal({
                type: 'string',
                invalids: [''],
                flags: { truncate: true }
            });
            done();
        });

        it('switches the truncate flag back', (done) => {

            const schema = Joi.string().truncate().truncate(false);
            const desc = schema.describe();
            expect(desc).to.equal({
                type: 'string',
                invalids: [''],
                flags: { truncate: false }
            });
            done();
        });

        it('does not change anything when used without max', (done) => {

            const schema = Joi.string().min(2).truncate();
            schema.validate('fooooooooooooooooooo', (err, value) => {

                expect(err).to.not.exist();
                expect(value).to.equal('fooooooooooooooooooo');
                done();
            });
        });

        it('truncates a string when used with max', (done) => {

            const schema = Joi.string().max(5).truncate();

            Helper.validate(schema, [
                ['abc', true, null, 'abc'],
                ['abcde', true, null, 'abcde'],
                ['abcdef', true, null, 'abcde']
            ], done);
        });

        it('truncates a string after transformations', (done) => {

            const schema = Joi.string().max(5).truncate().trim().replace(/a/g, 'aa');

            Helper.validate(schema, [
                ['abc', true, null, 'aabc'],
                ['abcde', true, null, 'aabcd'],
                ['abcdef', true, null, 'aabcd'],
                ['  abcdef  ', true, null, 'aabcd']
            ], done);
        });
    });

    describe('validate()', () => {

        it('should, by default, allow undefined, deny empty string', (done) => {

            Helper.validate(Joi.string(), [
                [undefined, true],
                ['', false, null, '"value" is not allowed to be empty']
            ], done);
        });

        it('should, when .required(), deny undefined, deny empty string', (done) => {

            Helper.validate(Joi.string().required(), [
                [undefined, false, null, '"value" is required'],
                ['', false, null, '"value" is not allowed to be empty']
            ], done);
        });

        it('should, when .required(), print a friend error message for an empty string', (done) => {

            const schema = Joi.string().required();
            Joi.compile(schema).validate('', (err, value) => {

                expect(err.message).to.contain('be empty');
                done();
            });
        });

        it('should, when .required(), print a friendly error message for trimmed whitespace', (done) => {

            const schema = Joi.string().trim().required();

            Joi.compile(schema).validate('    ', (err) => {

                expect(err.message).to.contain('be empty');
                done();
            });
        });

        it('should, when .required(), validate non-empty strings', (done) => {

            const schema = Joi.string().required();
            Helper.validate(schema, [
                ['test', true],
                ['0', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates invalid values', (done) => {

            const schema = Joi.string().invalid('a', 'b', 'c');
            Helper.validate(schema, [
                ['x', true],
                ['a', false, null, '"value" contains an invalid value'],
                ['c', false, null, '"value" contains an invalid value']
            ], done);
        });

        it('should invalidate invalid values', (done) => {

            const schema = Joi.string().valid('a', 'b', 'c');
            Helper.validate(schema, [
                ['x', false, null, '"value" must be one of [a, b, c]'],
                ['a', true],
                ['c', true]
            ], done);
        });

        it('validates array arguments correctly', (done) => {

            const schema = Joi.string().valid(['a', 'b', 'c']);
            Helper.validate(schema, [
                ['x', false, null, '"value" must be one of [a, b, c]'],
                ['a', true],
                ['c', true]
            ], done);
        });

        it('validates minimum length when min is used', (done) => {

            const schema = Joi.string().min(3);
            Helper.validate(schema, [
                ['test', true],
                ['0', false, null, '"value" length must be at least 3 characters long'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates minimum length when min is 0', (done) => {

            const schema = Joi.string().min(0).required();
            Helper.validate(schema, [
                ['0', true],
                [null, false, null, '"value" must be a string'],
                [undefined, false, null, '"value" is required']
            ], done);
        });

        it('should return false with minimum length and a null value passed in', (done) => {

            const schema = Joi.string().min(3);
            Helper.validate(schema, [
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('null allowed overrides min length requirement', (done) => {

            const schema = Joi.string().min(3).allow(null);
            Helper.validate(schema, [
                [null, true]
            ], done);
        });

        it('validates maximum length when max is used', (done) => {

            const schema = Joi.string().max(3);
            Helper.validate(schema, [
                ['test', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['0', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('should return true with max and not required when value is undefined', (done) => {

            const schema = Joi.string().max(3);
            Helper.validate(schema, [
                [undefined, true]
            ], done);
        });

        it('validates length requirements', (done) => {

            const schema = Joi.string().length(3);
            Helper.validate(schema, [
                ['test', false, null, '"value" length must be 3 characters long'],
                ['0', false, null, '"value" length must be 3 characters long'],
                [null, false, null, '"value" must be a string'],
                ['abc', true]
            ], done);
        });

        it('validates regex', (done) => {

            const schema = Joi.string().regex(/^[0-9][-][a-z]+$/);
            Helper.validate(schema, [
                ['van', false, null, '"value" with value "van" fails to match the required pattern: /^[0-9][-][a-z]+$/'],
                ['0-www', true]
            ], done);
        });

        it('validates regex (ignoring global flag)', (done) => {

            const schema = Joi.string().regex(/a/g);
            Helper.validate(schema, [
                ['ab', true],
                ['ac', true]
            ], done);
        });

        it('validates token', (done) => {

            const schema = Joi.string().token();
            Helper.validate(schema, [
                ['w0rld_of_w4lm4rtl4bs', true],
                ['w0rld of_w4lm4rtl4bs', false, null, '"value" must only contain alpha-numeric and underscore characters'],
                ['abcd#f?h1j orly?', false, null, '"value" must only contain alpha-numeric and underscore characters']
            ], done);
        });

        it('validates alphanum', (done) => {

            const schema = Joi.string().alphanum();
            Helper.validate(schema, [
                ['w0rld of w4lm4rtl4bs', false, null, '"value" must only contain alpha-numeric characters'],
                ['w0rldofw4lm4rtl4bs', true],
                ['abcd#f?h1j orly?', false, null, '"value" must only contain alpha-numeric characters']
            ], done);
        });

        it('should return false for denied value', (done) => {

            const text = Joi.string().invalid('joi');
            text.validate('joi', (err, value) => {

                expect(err).to.exist();
                done();
            });
        });

        it('should return true for allowed value', (done) => {

            const text = Joi.string().allow('hapi');
            text.validate('result', (err, value) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('validates with one validator (min)', (done) => {

            const text = Joi.string().min(3);
            text.validate('joi', (err, value) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('validates with two validators (min, required)', (done) => {

            const text = Joi.string().min(3).required();
            text.validate('joi', (err, value) => {

                expect(err).to.not.exist();

                text.validate('', (err2, value2) => {

                    expect(err2).to.exist();
                    done();
                });
            });
        });

        it('validates null with allow(null)', (done) => {

            Helper.validate(Joi.string().allow(null), [
                [null, true]
            ], done);
        });

        it('validates "" (empty string) with allow(\'\')', (done) => {

            Helper.validate(Joi.string().allow(''), [
                ['', true],
                ['', true]
            ], done);
        });

        it('validates combination of required and min', (done) => {

            const rule = Joi.string().required().min(3);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 3 characters long'],
                ['123', true],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of required and max', (done) => {

            const rule = Joi.string().required().max(3);
            Helper.validate(rule, [
                ['x', true],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of allow(\'\') and min', (done) => {

            const rule = Joi.string().allow('').min(3);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 3 characters long'],
                ['123', true],
                ['1234', true],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of allow(\'\') and max', (done) => {

            const rule = Joi.string().allow('').max(3);
            Helper.validate(rule, [
                ['x', true],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of null allowed and max', (done) => {

            const rule = Joi.string().allow(null).max(3);
            Helper.validate(rule, [
                ['x', true],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, true]
            ], done);
        });

        it('validates combination of min and max', (done) => {

            const rule = Joi.string().min(2).max(3);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, and allow(\'\')', (done) => {

            const rule = Joi.string().min(2).max(3).allow('');
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, and required', (done) => {

            const rule = Joi.string().min(2).max(3).required();
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, and regex', (done) => {

            const rule = Joi.string().min(2).max(3).regex(/^a/);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, regex, and allow(\'\')', (done) => {

            const rule = Joi.string().min(2).max(3).regex(/^a/).allow('');
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, regex, and required', (done) => {

            const rule = Joi.string().min(2).max(3).regex(/^a/).required();
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, and alphanum', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum();
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, alphanum, and allow(\'\')', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum().allow('');
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, alphanum, and required', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum().required();
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', true],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, alphanum, and regex', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum().regex(/^a/);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, alphanum, required, and regex', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum().required().regex(/^a/);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of min, max, alphanum, allow(\'\'), and regex', (done) => {

            const rule = Joi.string().min(2).max(3).alphanum().allow('').regex(/^a/);
            Helper.validate(rule, [
                ['x', false, null, '"value" length must be at least 2 characters long'],
                ['123', false, null, '"value" with value "123" fails to match the required pattern: /^a/'],
                ['1234', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['12', false, null, '"value" with value "12" fails to match the required pattern: /^a/'],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false, null, '"value" length must be less than or equal to 3 characters long'],
                ['*ab', false, null, '"value" must only contain alpha-numeric characters'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email and min', (done) => {

            const rule = Joi.string().email().min(8);
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', true],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, and max', (done) => {

            const rule = Joi.string().email().min(8).max(10);
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, and invalid', (done) => {

            const rule = Joi.string().email().min(8).max(10).invalid('123@x.com');
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', false, null, '"value" contains an invalid value'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, and allow', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com');
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, allow, and invalid', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com').invalid('123@x.com');
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', false, null, '"value" contains an invalid value'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, allow, invalid, and allow(\'\')', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com').invalid('123@x.com').allow('');
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', false, null, '"value" contains an invalid value'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, allow, and allow(\'\')', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com').allow('');
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, allow, invalid, and regex', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com').invalid('123@x.com').regex(/^1/);
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', false, null, '"value" contains an invalid value'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, allow, invalid, regex, and allow(\'\')', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('x@x.com').invalid('123@x.com').regex(/^1/).allow('');
            Helper.validate(rule, [
                ['x@x.com', true],
                ['123@x.com', false, null, '"value" contains an invalid value'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, and allow(\'\')', (done) => {

            const rule = Joi.string().email().min(8).max(10).allow('');
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, and regex', (done) => {

            const rule = Joi.string().email().min(8).max(10).regex(/^1234/);
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', false, null, '"value" with value "123&#x40;x.com" fails to match the required pattern: /^1234/'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, regex, and allow(\'\')', (done) => {

            const rule = Joi.string().email().min(8).max(10).regex(/^1234/).allow('');
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', false, null, '"value" with value "123&#x40;x.com" fails to match the required pattern: /^1234/'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of email, min, max, regex, and required', (done) => {

            const rule = Joi.string().email().min(8).max(10).regex(/^1234/).required();
            Helper.validate(rule, [
                ['x@x.com', false, null, '"value" length must be at least 8 characters long'],
                ['123@x.com', false, null, '"value" with value "123&#x40;x.com" fails to match the required pattern: /^1234/'],
                ['1234@x.com', true],
                ['12345@x.com', false, null, '"value" length must be less than or equal to 10 characters long'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates isoDate', (done) => {

            Helper.validate(Joi.string().isoDate(), [
                ['2013-06-07T14:21:46.295Z', true],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', true],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', true],
                ['2013-06-07T14:21:46+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46-07:00', true],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', true],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', true],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', true],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14.2334,4', true],
                ['2013-06-07T14,23:34', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T24', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T24:00', true],
                ['2013-06-07T24:21', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07 142146.295', true],
                ['2013-06-07 146946.295', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07 1421,44', true],
                ['2013-W23', true],
                ['2013-W23-1', true],
                ['2013-W2311', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-W231', true],
                ['2013-M231', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-W23-1T14:21', true],
                ['2013-W23-1T14:21:', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-W23-1T14:21:46+07:00', true],
                ['2013-W23-1T14:21:46+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-W23-1T14:21:46-07:00', true],
                ['2013-184', true],
                ['2013-1841', false, null, '"value" must be a valid ISO 8601 date']
            ], done);
        });

        it('validates isoDate with a friendly error message', (done) => {

            const schema = { item: Joi.string().isoDate() };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('must be a valid ISO 8601 date');
                done();
            });
        });

        it('validates combination of isoDate and min', (done) => {

            const rule = Joi.string().isoDate().min(23);
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', true],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', true],
                ['2013-06-07T14:21:46Z', false, null, '"value" length must be at least 23 characters long'],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', true],
                ['2013-06-07T14:21:46-07:00', true],
                ['2013-06-07T14:21Z', false, null, '"value" length must be at least 23 characters long'],
                ['2013-06-07T14:21+07:00', false, null, '"value" length must be at least 23 characters long'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" length must be at least 23 characters long'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 23 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 23 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min and max', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23);
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', true],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max and invalid', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).invalid('2013-06-07T14:21+07:00');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" contains an invalid value'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max and allow', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', true],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, allow and invalid', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00').invalid('2013-06-07T14:21+07:00');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" contains an invalid value'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, allow, invalid and allow(\'\')', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00').invalid('2013-06-07T14:21+07:00').allow('');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" contains an invalid value'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, allow, invalid and allow(\'\')', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00').allow('');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', true],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, allow, invalid and regex', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00').invalid('2013-06-07T14:21Z').regex(/Z$/);
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', false, null, '"value" contains an invalid value'],
                ['2013-06-07T14:21+07:00', false, null, '"value" with value "2013-06-07T14:21&#x2b;07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" with value "2013-06-07T14:21-07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, allow, invalid, regex and allow(\'\')', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('2013-06-07T14:21:46.295+07:00').invalid('2013-06-07T14:21Z').regex(/Z$/).allow('');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', true],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', false, null, '"value" contains an invalid value'],
                ['2013-06-07T14:21+07:00', false, null, '"value" with value "2013-06-07T14:21&#x2b;07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" with value "2013-06-07T14:21-07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max and allow(\'\')', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).allow('');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', true],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', true],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max and regex', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).regex(/Z$/);
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" with value "2013-06-07T14:21&#x2b;07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" with value "2013-06-07T14:21-07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, regex and allow(\'\')', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).regex(/Z$/).allow('');
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" with value "2013-06-07T14:21&#x2b;07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" with value "2013-06-07T14:21-07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of isoDate, min, max, regex and required', (done) => {

            const rule = Joi.string().isoDate().min(17).max(23).regex(/Z$/).required();
            Helper.validate(rule, [
                ['2013-06-07T14:21:46.295Z', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46.295+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46.295-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46Z', true],
                ['2013-06-07T14:21:46Z0', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21:46+07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21:46-07:00', false, null, '"value" length must be less than or equal to 23 characters long'],
                ['2013-06-07T14:21Z', true],
                ['2013-06-07T14:21+07:00', false, null, '"value" with value "2013-06-07T14:21&#x2b;07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21+07:000', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21-07:00', false, null, '"value" with value "2013-06-07T14:21-07:00" fails to match the required pattern: /Z$/'],
                ['2013-06-07T14:21Z+7:00', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07', false, null, '"value" length must be at least 17 characters long'],
                ['2013-06-07T', false, null, '"value" must be a valid ISO 8601 date'],
                ['2013-06-07T14:21', false, null, '"value" length must be at least 17 characters long'],
                ['1-1-2013', false, null, '"value" must be a valid ISO 8601 date'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates guid', (done) => {

            Helper.validate(Joi.string().guid(), [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', true],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', true],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', true],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', true],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', true],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID']
            ], done);
        });

        it('validates guid with a friendly error message', (done) => {

            const schema = { item: Joi.string().guid() };
            Joi.compile(schema).validate({ item: 'something' }, (err, value) => {

                expect(err.message).to.contain('must be a valid GUID');
                done();
            });
        });

        it('validates combination of guid and min', (done) => {

            const rule = Joi.string().guid().min(36);
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', true],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" length must be at least 36 characters long'],
                ['69593D62-71EA-4548-85E4-04FC71357423', true],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" length must be at least 36 characters long'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', true],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', false, null, '"value" length must be at least 36 characters long'],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', true],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" length must be at least 36 characters long'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min and max', (done) => {

            const rule = Joi.string().guid().min(32).max(34);
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', true],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max and invalid', (done) => {

            const rule = Joi.string().guid().min(32).max(34).invalid('b4b2fb69c6244e5eb0698e0c6ec66618');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" contains an invalid value'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max and allow', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', true],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, allow and invalid', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D').invalid('b4b2fb69c6244e5eb0698e0c6ec66618');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" contains an invalid value'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, allow, invalid and allow(\'\')', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D').invalid('b4b2fb69c6244e5eb0698e0c6ec66618').allow('');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" contains an invalid value'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, allow and allow(\'\')', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D').allow('');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', true],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, allow, invalid and regex', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08').invalid('b4b2fb69c6244e5eb0698e0c6ec66618').regex(/^{7e908/);
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" with value "&#x7b;B59511BD6A5F4DF09ECF562A108D8A2E&#x7d;" fails to match the required pattern: /^{7e908/'],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" with value "677E2553DD4D43B09DA77414DB1EB8EA" fails to match the required pattern: /^{7e908/'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" contains an invalid value'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, allow, invalid, regex and allow(\'\')', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('{D1A5279D-B27D-4CD4-A05E-EFDD53D08').invalid('b4b2fb69c6244e5eb0698e0c6ec66618').regex(/^{7e908/).allow('');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" with value "&#x7b;B59511BD6A5F4DF09ECF562A108D8A2E&#x7d;" fails to match the required pattern: /^{7e908/'],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" with value "677E2553DD4D43B09DA77414DB1EB8EA" fails to match the required pattern: /^{7e908/'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" contains an invalid value'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08', true],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max and allow(\'\')', (done) => {

            const rule = Joi.string().guid().min(32).max(34).allow('');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', true],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', true],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', true],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max and regex', (done) => {

            const rule = Joi.string().guid().min(32).max(34).regex(/^{7e9081/i);
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" with value "&#x7b;B59511BD6A5F4DF09ECF562A108D8A2E&#x7d;" fails to match the required pattern: /^{7e9081/i'],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" with value "677E2553DD4D43B09DA77414DB1EB8EA" fails to match the required pattern: /^{7e9081/i'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" with value "b4b2fb69c6244e5eb0698e0c6ec66618" fails to match the required pattern: /^{7e9081/i'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, regex and allow(\'\')', (done) => {

            const rule = Joi.string().guid().min(32).max(34).regex(/^{7e9081/i).allow('');
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" with value "&#x7b;B59511BD6A5F4DF09ECF562A108D8A2E&#x7d;" fails to match the required pattern: /^{7e9081/i'],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" with value "677E2553DD4D43B09DA77414DB1EB8EA" fails to match the required pattern: /^{7e9081/i'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" with value "b4b2fb69c6244e5eb0698e0c6ec66618" fails to match the required pattern: /^{7e9081/i'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates combination of guid, min, max, regex and required', (done) => {

            const rule = Joi.string().guid().min(32).max(34).regex(/^{7e9081/i).required();
            Helper.validate(rule, [
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{B59511BD6A5F4DF09ECF562A108D8A2E}', false, null, '"value" with value "&#x7b;B59511BD6A5F4DF09ECF562A108D8A2E&#x7d;" fails to match the required pattern: /^{7e9081/i'],
                ['69593D62-71EA-4548-85E4-04FC71357423', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['677E2553DD4D43B09DA77414DB1EB8EA', false, null, '"value" with value "677E2553DD4D43B09DA77414DB1EB8EA" fails to match the required pattern: /^{7e9081/i'],
                ['{5ba3bba3-729a-4717-88c1-b7c4b7ba80db}', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['{7e9081b59a6d4cc1a8c347f69fb4198d}', true],
                ['0c74f13f-fa83-4c48-9b33-68921dd72463', false, null, '"value" length must be less than or equal to 34 characters long'],
                ['b4b2fb69c6244e5eb0698e0c6ec66618', false, null, '"value" with value "b4b2fb69c6244e5eb0698e0c6ec66618" fails to match the required pattern: /^{7e9081/i'],
                ['{283B67B2-430F-4E6F-97E6-19041992-C1B0}', false, null, '"value" must be a valid GUID'],
                ['{D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D', false, null, '"value" must be a valid GUID'],
                ['D1A5279D-B27D-4CD4-A05E-EFDD53D08E8D}', false, null, '"value" must be a valid GUID'],
                ['', false, null, '"value" is not allowed to be empty'],
                [null, false, null, '"value" must be a string']
            ], done);
        });

        it('validates an hexadecimal string', (done) => {

            const rule = Joi.string().hex();
            Helper.validate(rule, [
                ['123456789abcdef', true],
                ['123456789AbCdEf', true],
                ['123afg', false, null, '"value" must only contain hexadecimal characters']
            ], done);
        });

        it('validates combination of uppercase, min, max, alphanum and valid', (done) => {

            const rule = Joi.string().uppercase().min(2).max(3).alphanum().valid('AB', 'BC');
            Helper.validate(rule, [
                ['x', false, null, '"value" must be one of [AB, BC]'],
                ['123', false, null, '"value" must be one of [AB, BC]'],
                ['1234', false, null, '"value" must be one of [AB, BC]'],
                ['12', false, null, '"value" must be one of [AB, BC]'],
                ['ab', true],
                ['abc', false, null, '"value" must be one of [AB, BC]'],
                ['a2c', false, null, '"value" must be one of [AB, BC]'],
                ['abcd', false, null, '"value" must be one of [AB, BC]'],
                ['*ab', false, null, '"value" must be one of [AB, BC]'],
                ['', false, null, '"value" is not allowed to be empty'],
                ['bc', true],
                ['BC', true],
                ['de', false, null, '"value" must be one of [AB, BC]'],
                ['ABc', false, null, '"value" must be one of [AB, BC]'],
                ['AB', true],
                [null, false, null, '"value" must be a string']
            ], done);
        });
    });
});
