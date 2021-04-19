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

/**
 * Merges objects without modifying inputs.
 * Arrays are concatinated.
 * Object are merged recursively.
 *
 * @param {...object} inputObjects - Objects to merge
 * @returns {object} Merged Object
 */
function deepMerge(...inputObjects) {
    const isObject = (o) => o && typeof o === 'object';
    return inputObjects.reduce((accumulated, current) => {
        if (!current) {
            return accumulated;
        }
        Object.keys(current).forEach((key) => {
            if (Array.isArray(accumulated[key]) && Array.isArray(current[key])) {
                accumulated[key] = accumulated[key].concat(...current[key]);
            } else if (isObject(accumulated[key]) && isObject(current[key])) {
                accumulated[key] = deepMerge(accumulated[key], current[key]);
            } else {
                accumulated[key] = current[key];
            }
        });
        return accumulated;
    }, {});
}

export default deepMerge;
