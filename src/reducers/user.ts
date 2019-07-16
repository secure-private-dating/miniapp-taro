import {ADD_MATCHED, UPDATE_TARGET} from "../constants/user";

export type MatchStateProps = Array<{
    uid: string,
}>

export type UserStateProps = {
    uid: string,
    gid: string,
    keypair: {
        publicKey: string,
        privateKey: string
    },
    target: null | {
        uid: string,
        publicKey: string
    },
    matched: MatchStateProps
}

const INITIAL_STATE: UserStateProps = {
    gid: '5d2c22c662d30c1cc08aaa3f',
    // lyh
    uid: '5d2c286762d30c1cc08aaa44',
    keypair: {
        publicKey: 'ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY=',
        privateKey: '60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE='
    },
    // cyg
    // uid: '5d2c2a5162d30c1cc08aaa46',
    // keypair: {
    //     publicKey: 'b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM=',
    //     privateKey: 'bHOLf11eK1tqcVOvXzo9O6I6dUk8NOecOyCKPXge+6Y='
    // },
    target: null,
    matched: [],
};

export default function user(state = INITIAL_STATE, action) {
    switch (action.type) {
        case UPDATE_TARGET:
            return {
                ...state,
                target: action.target
            };
        case ADD_MATCHED:
            state.matched.push(action.matched);
            return state;
        default:
            return state;
    }
}
