import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, View} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './index.scss'
import {UserStateProps} from "../../reducers/user";
// import {decode as decodeBase64, encode as encodeBase64} from "@stablelib/base64";
import {encode as encodeBase64} from "@stablelib/base64";
import nacl from "tweetnacl";
// import {decode as decodeUTF8, encode as encodeUTF8} from "@stablelib/utf8";
import {addMatched, updateTarget, update} from "../../actions/user";
import {ConfigStateProps} from "../../reducers/config";


// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
    user: UserStateProps;
    config: ConfigStateProps;
}

type PageDispatchProps = {
    updateTarget: ({}) => void,
    update: ({}) => void,
    addMatched: ({}) => void
}

type PageOwnProps = {}

type PageState = {
    isAuthenticated: boolean;
    code: string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
    props: IProps;
    state: PageState;
}

@connect(({user, config}) => ({user, config}), (dispatch) => ({
    updateTarget(target) {
        dispatch(updateTarget(target))
    },
    update(dict) {
        dispatch(update(dict))
    },
    addMatched(matched) {
        dispatch(addMatched(matched))
    }
}))
class Index extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: 'Main Page'
    };

    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: true,
            code: '',
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() {
    }

    componentDidShow() {
        // console.log(window);
        //
        /*console.log(1111);
        const alice = nacl.box.keyPair()
        const bob = nacl.box.keyPair()
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
        const plaintext = 'LYHSB'
        const box = nacl.box(naclUtil.decodeUTF8(plaintext), nonce,
            alice.publicKey, bob.secretKey)
        const message = {box, nonce}
        console.log(JSON.stringify(message))
        const payload = nacl.box.open(message.box, message.nonce, bob.publicKey,
            alice.secretKey)
        if (payload) {
            const utf8 = naclUtil.encodeUTF8(payload)
            console.log(utf8)
        }*/
    }

    componentDidHide() {
    }

    async componentWillMount() {
        try {
            const code = await Taro.login();
            console.log(code);
            this.setState({code: code.code});

            // try to get scope.userInfo'
            const settings = await Taro.getSetting();
            console.log(settings);
            if (settings.authSetting['scope.userInfo']) {
                console.log('scope.userInfo found');
                const userInfo = await Taro.getUserInfo();
                console.log(userInfo);
                await this.login(userInfo.userInfo)
            } else {
                console.log('scope.userInfo not found');
                this.setState({isAuthenticated: false});
                return;
            }
        } catch (e) {
            console.log(e);
        }
    }

    async componentDidMount() {
        if (!this.state.isAuthenticated) {
            return;
        }
        // await this.loadData();
    }

    async redirect() {
        if (this.$router.params.type == 'join_group') {
            const gid = this.$router.params.gid;
            console.log('join group', gid);
            const res = await Taro.request({
                url: this.props.config.baseUrl + 'group/join',
                data: {
                    gid: gid
                },
                header: {
                    'content-type': 'application/json',
                    'cookie': 'session=' + this.props.user.sid,
                }
            });
            console.log(res);
        }
        console.log('redirect to groups/index');
        Taro.redirectTo({
            url: '/pages/groups/index'
        })
    }


    async validateKey() {
        const keyPair = this.props.user.keyPair;
        console.log('validate key:', keyPair);
        if (!keyPair.publicKey || !keyPair.secretKey) {
            const newKeyPair = nacl.box.keyPair();
            const publicKey = encodeBase64(newKeyPair.publicKey);
            const secretKey = encodeBase64(newKeyPair.secretKey);
            const res = await Taro.request({
                url: this.props.config.baseUrl + 'user/update_public_key',
                method: "GET",
                data: {
                    key: publicKey
                },
                header: {
                    'content-type': 'application/json',
                    'cookie': 'session=' + this.props.user.sid,
                }
            });
            console.log('update public key: ', res.data);
            await Taro.setStorage({key: 'publicKey', data: publicKey});
            await Taro.setStorage({key: 'secretKey', data: secretKey});
            this.props.update({
                keyPair: {
                    publicKey: publicKey,
                    secretKey: secretKey,
                }
            })
        } else {
            /** @TODO validate existing pubkey */

        }

    }

    async login(userInfo) {
        if (!this.state.code) return;
        try {
            console.log('start login');
            const login_result = await Taro.request({
                url: this.props.config.baseUrl + 'user/login',
                method: "POST",
                data: {
                    code: this.state.code,
                    avatar: userInfo.avatarUrl,
                    name: userInfo.nickName,
                    gender: userInfo.gender,
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            });
            console.log('login result:', login_result.data);

            const sid = login_result.data.sid;
            const uid = login_result.data.uid.$oid;
            const publicKey = login_result.data.publicKey;
            const avatar = login_result.data.avatar;

            await Taro.setStorage({key: 'sid', data: sid});
            await Taro.setStorage({key: 'uid', data: uid});
            await Taro.setStorage({key: 'publicKey', data: publicKey});
            await Taro.setStorage({key: 'avatar', data: avatar});

            await this.loadCache();
            console.log('props.user:', this.props.user);

            await this.validateKey();
            await this.redirect();

        } catch (e) {
            console.log(e);
        }
    }

    async getUserInfo(userInfo) {
        console.log(userInfo);
        if (userInfo.detail.userInfo) {
            this.setState({isAuthenticated: true});
            await this.login(userInfo.detail.userInfo);
        }
    }

    render() {
        return (
            <View className='index'>
                {!this.state.isAuthenticated ?
                    <Button openType='getUserInfo' onGetUserInfo={this.getUserInfo}>Authenticate</Button>
                    : null}
                {/*<Button className='add_btn' onClick={this.props.add}>+</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.dec}>-</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>*/}
                {/*<View><Text>{this.props.counter.num}</Text></View>*/}

                {/*<Button className='dec_btn' onClick={this.onClickGroups}>Groups</Button>*/}
                {/*<View><Text>Hello, World</Text></View>*/}
            </View>
        )
    }

    async loadCache() {
        try {
            const sid = (await Taro.getStorage({key: 'sid'})).data;
            const uid = (await Taro.getStorage({key: 'uid'})).data;
            const publicKey = (await Taro.getStorage({key: 'publicKey'})).data;
            const avatar = (await Taro.getStorage({key: 'avatar'})).data;
            this.props.update({
                sid, uid, avatar,
                keyPair: {publicKey}
            })
        } catch (e) {
            console.log(e);
        }
        try {
            const secretKey = (await Taro.getStorage({key: 'secretKey'})).data;
            this.props.update({
                keyPair: {secretKey}
            });
        } catch (e) {
            console.log('secretKey not found!');
            this.props.update({
                keyPair: {secretKey: ''}
            });
        }
        try {
            const latestMessageId = (await Taro.getStorage({key: 'latestMessageId'})).data;
            this.props.update({latestMessageId});
        } catch (e) {
            console.log(e);
        }
        try {
            const target = (await Taro.getStorage({key: 'target'})).data;
            this.props.updateTarget(target);
        } catch (e) {
            console.log(e);
        }
    }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
