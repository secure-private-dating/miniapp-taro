import {
    UPDATE_TARGET,
    UPDATE,
    ADD_MATCHED
} from '../constants/user'

export const updateTarget = (target) => {
    return {
        type: UPDATE_TARGET,
        target: target
    }
};

export const update = (key, value) => {
    return {
        type: UPDATE,
        key: key,
        value: value
    }
};

export const addMatched = (matched) => {
    return {
        type: ADD_MATCHED,
        matched: matched
    }
};
