export type ConfigStateProps = {
    baseUrl: string
}

const INITIAL_STATE: ConfigStateProps = {
    baseUrl: 'http://127.0.0.1:8000/'
};

export default function config(state = INITIAL_STATE, action) {
    return state;
}
