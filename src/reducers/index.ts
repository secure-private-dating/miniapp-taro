import { combineReducers } from 'redux'
import counter from './counter'
import user from './user'
import config from './config'

export default combineReducers({
  counter, user, config
})
