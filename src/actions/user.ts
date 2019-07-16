import {
  UPDATE_TARGET,
} from '../constants/user'

export const updateTarget = (target) => {
  return {
    type: UPDATE_TARGET,
    target: target
  }
};
