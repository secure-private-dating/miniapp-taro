import {UPDATE_TARGET} from "../constants/user";

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
    }
}

const INITIAL_STATE: UserStateProps = {
    uid: '5d2c286762d30c1cc08aaa44',
    gid: '5d2c22c662d30c1cc08aaa3f',
    keypair: {
        publicKey: 'ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY=',
        privateKey: '60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE='
    },
    target: null,
};

export default function user(state = INITIAL_STATE, action) {
    switch (action.type) {
        case UPDATE_TARGET:
            return {
                ...state,
                target: action.target
            };
        default:
            return state
    }
}
