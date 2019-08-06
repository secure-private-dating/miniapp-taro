export type ConfigStateProps = {
    baseUrl: string
}

const INITIAL_STATE: ConfigStateProps = {
    baseUrl: 'https://joj.sjtu.edu.cn/backend/'
};

export default function config(state = INITIAL_STATE, action) {
    return state;
}
