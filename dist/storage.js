"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorage = exports.noopStorage = void 0;
exports.noopStorage = {
    getItem: (_key) => "",
    setItem: (_key, _value) => null,
    removeItem: (_key) => null,
};
function createStorage({ storage, key: prefix = "web3", }) {
    return Object.assign(Object.assign({}, storage), { getItem: (key, defaultState = null) => {
            const value = storage.getItem(`${prefix}.${key}`);
            try {
                return value ? JSON.parse(value) : defaultState;
            }
            catch (error) {
                console.warn(error);
                return defaultState;
            }
        }, setItem: (key, value) => {
            if (value === null) {
                storage.removeItem(`${prefix}.${key}`);
            }
            else {
                try {
                    storage.setItem(`${prefix}.${key}`, JSON.stringify(value));
                }
                catch (err) {
                    console.error(err);
                }
            }
        }, removeItem: (key) => storage.removeItem(`${prefix}.${key}`) });
}
exports.createStorage = createStorage;
