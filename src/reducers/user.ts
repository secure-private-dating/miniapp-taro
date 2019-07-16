export type UserStateProps = {
    uid: string,
    gid: string,
    keypair: {
        publicKey: string,
        privateKey: string
    },
}

const INITIAL_STATE : UserStateProps = {
    uid: '5d2c286762d30c1cc08aaa44',
    gid: '5d2c22c662d30c1cc08aaa3f',
    keypair: {
        publicKey: 'ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY=',
        privateKey: '60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE='
    },
};

export default function user(state = INITIAL_STATE, action) {
    return state
}
