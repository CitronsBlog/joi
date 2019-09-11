'use strict';

const Code = require('@hapi/code');


const internals = {};


const { expect } = Code;


exports.equal = function (a, b) {

    try {
        expect(a).to.equal(b, { deepFunction: true, skip: ['$_temp'] });
    }
    catch (err) {
        console.error(err.stack);
        err.at = internals.thrownAt();      // Adjust error location to test
        throw err;
    }
};


exports.validate = function (schema, prefs, tests) {

    if (!tests) {
        tests = prefs;
        prefs = null;
    }

    try {
        expect(schema.$_root.build(schema.describe())).to.equal(schema, { deepFunction: true, skip: ['$_temp'] });

        for (const [input, pass, expected] of tests) {
            if (!pass) {
                expect(expected, 'Failing tests messages must be tested').to.exist();
            }

            const { error, value } = schema.validate(input, prefs);

            const { error: errord, value: valued } = schema.validate(input, Object.assign({ debug: true }, prefs));
            expect(error).to.equal(errord);
            expect(value).to.equal(valued);

            if (error &&
                pass) {

                console.log(error);
            }

            if (!error &&
                !pass) {

                console.log(input);
            }

            expect(!error).to.equal(pass);

            if (expected === undefined) {
                continue;
            }

            if (pass) {
                expect(value).to.equal(expected);
                continue;
            }

            if (typeof expected === 'string') {
                expect(error.message).to.equal(expected);
                continue;
            }

            if (schema._preferences && schema._preferences.abortEarly === false ||
                prefs && prefs.abortEarly === false) {

                expect(error.message).to.equal(expected.message);
                expect(error.details).to.equal(expected.details);
            }
            else {
                expect(error.details).to.have.length(1);
                expect(error.message).to.equal(error.details[0].message);
                expect(error.details[0]).to.equal(expected);
            }
        }
    }
    catch (err) {
        console.error(err.stack);
        err.at = internals.thrownAt();      // Adjust error location to test
        throw err;
    }
};


internals.thrownAt = function () {

    const error = new Error();
    const frame = error.stack.replace(error.toString(), '').split('\n').slice(1).filter((line) => !line.includes(__filename))[0];
    const at = frame.match(/^\s*at \(?(.+)\:(\d+)\:(\d+)\)?$/);
    return {
        filename: at[1],
        line: at[2],
        column: at[3]
    };
};
