export type ConfigStateProps = {
    baseUrl: string
}

const INITIAL_STATE: ConfigStateProps = {
    baseUrl: 'http://202.121.180.21:8000/'
};

export default function config(state = INITIAL_STATE, action) {
    return state;
}
