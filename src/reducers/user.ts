import {ADD_MATCHED, UPDATE_TARGET, UPDATE} from "../constants/user";
import _ from 'lodash'

export type MatchStateProps = {
    [propName: string]: {
        uid: string,
    }
}

export type UserStateProps = {
    uid: string,
    gid: string,
    keyPair: {
        publicKey: string,
        secretKey: string
    },
    target: null | {
        uid: string,
        publicKey: string
    },
    matched: MatchStateProps,
    sid: string,
    latestMessageId: string,
}

const INITIAL_STATE: UserStateProps = {
    // gid for ve450
    gid: '5d2c22c662d30c1cc08aaa3f',
    uid: '',
    keyPair: {
        publicKey: '',
        secretKey: '',
    },
/*    // lyh
    // uid: '5d2c286762d30c1cc08aaa44',
    // keyPair: {
    //     publicKey: 'ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY=',
    //     privateKey: '60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE='
    // },
    // cyg
    // uid: '5d2c2a5162d30c1cc08aaa46',
    // keyPair: {
    //     publicKey: 'b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM=',
    //     privateKey: 'bHOLf11eK1tqcVOvXzo9O6I6dUk8NOecOyCKPXge+6Y='
    // },
    // jsf
    // uid: '5d2c2ab362d30c1cc08aaa47',
    // keyPair: {
    //     publicKey: '3nYmD5h1Mfewdc6KBRaeydFx5HK2qUfpI8eSxzpcgEE=',
    //     privateKey: 'ib52sSPl0dhtX8h0K1XRm3iZHgoi9mNG8vTrtjJQneI='
    // },
    // hyc
    // uid: '5d2c2b0a62d30c1cc08aaa48',
    // keyPair: {
    //     publicKey: '/doOKD/6cwwA2RwdxgX2QPwMiHPdeBp1YSqckY9A9nc=',
    //     privateKey: '0TJwC9hV+r9865yzy/HxdZEZquJuvspMzgSCnMNi/9k='
    // },*/
    target: null,
    matched: {},
    sid: '',
    latestMessageId: '{}',
};

export default function user(state = INITIAL_STATE, action) {
    switch (action.type) {
        case UPDATE_TARGET:
            return {
                ...state,
                target: action.target
            };
        case UPDATE:
            return _.merge(state, action.dict);
        case ADD_MATCHED:
            state.matched[action.matched.uid] = action.matched;
            return state;
        default:
            return state;
    }
}
