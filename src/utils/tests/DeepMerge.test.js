/*
 * Copyright 2019 Expedia Group, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {expect} from 'chai';
import deepMerge from '../DeepMerge';

describe('DeepMerge', () => {
    it('should handle undefined objects', () => {
        // eslint-disable-next-line no-undefined
        const result = deepMerge(undefined, {a: 1}, undefined);
        expect(result).to.deep.equal({a: 1});
    });

    it('should merge nested objects', () => {
        const obj1 = {
            a: {
                b: {
                    c: {
                        d: 1,
                        e: [{z: 1}]
                    },
                    f: {
                        g: [1, 11, 111]
                    }
                },
                h: {
                    i: 1
                }
            },
            j: 1
        };

        const obj2 = {
            a: {
                b: {
                    c: {
                        e: [{x: 2}]
                    },
                    f: {
                        g: [2, 22]
                    }
                },
                k: {
                    l: 2
                }
            },
            j: 2
        };
        const result = deepMerge(obj1, obj2);
        expect(result).to.deep.equal({
            a: {
                b: {
                    c: {
                        d: 1,
                        e: [{z: 1}, {x: 2}]
                    },
                    f: {
                        g: [1, 11, 111, 2, 22]
                    }
                },
                h: {
                    i: 1
                },
                k: {
                    l: 2
                }
            },
            j: 2
        });
    });

    it('should overrite if attributes are of different types', () => {
        const obj1 = {
            a: 'some string',
            b: ['a', 'r', 'r'],
            c: {
                d: 1,
                e: 1
            }
        };

        const obj2 = {
            a: 2,
            b: 'hello',
            c: {
                d: 2
            }
        };

        const result = deepMerge(obj1, obj2);
        expect(result).to.deep.equal({
            a: 2,
            b: 'hello',
            c: {
                d: 2,
                e: 1
            }}
        );
    });
});
