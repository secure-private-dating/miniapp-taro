export type ConfigStateProps = {
    baseUrl: string
}

const INITIAL_STATE: ConfigStateProps = {
    baseUrl: 'https://joj.sjtu.edu.cn/backend/',
    // baseUrl: 'http://127.0.0.1:8000/backend/',
};

export default function config(state = INITIAL_STATE) {
    return state;
}
