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

export const update = (dict) => {
    return {
        type: UPDATE,
        dict: dict,
    }
};

export const addMatched = (matched) => {
    return {
        type: ADD_MATCHED,
        matched: matched
    }
};
