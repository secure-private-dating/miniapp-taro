import {
  UPDATE_TARGET,
  ADD_MATCHED
} from '../constants/user'

export const updateTarget = (target) => {
  return {
    type: UPDATE_TARGET,
    target: target
  }
};

export const addMatched = (matched) => {
    return {
        type: ADD_MATCHED,
        matched: matched
    }
};
