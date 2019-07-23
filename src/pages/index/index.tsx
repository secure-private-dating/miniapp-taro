import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './index.scss'
import {UserStateProps} from "../../reducers/user";
import {decode as decodeBase64, encode as encodeBase64} from "@stablelib/base64";
import nacl from "tweetnacl";
import {decode as decodeUTF8, encode as encodeUTF8} from "@stablelib/utf8";
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
    update: ({}, {}) => void,
    addMatched: ({}) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
    props: IProps;
}

@connect(({user, config}) => ({user, config}), (dispatch) => ({
    updateTarget(target) {
        dispatch(updateTarget(target))
    },
    update(key, value) {
        dispatch(update(key, value))
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
        navigationBarTitleText: '首页'
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

    async componentDidMount() {
        try {
            const code = await Taro.login();
            console.log(code);
            const login_result = await Taro.request({
                url: this.props.config.baseUrl + 'user/login',
                method: "GET",
                data: {
                    code: code.code,
                },
                header: {
                    'content-type': 'application/json'
                }
            });
            console.log(login_result.data);
            const sid = login_result.data.sid;
            const uid = login_result.data.uid.$oid;
            await Taro.setStorage({key: 'sid', data: sid});
            this.props.update('uid', uid);
            console.log(this.props.user);

            const settings = await Taro.getSetting();
            console.log(settings);
            if (settings.authSetting['scope.userInfo']) {
                console.log('scope.userInfo found');
            } else {
                console.log('scope.userInfo not found');
                const res = await Taro.openSetting();
                console.log(res);
            }


        } catch (e) {
            console.log(e);
        }

        await this.loadCache();

        const res = await Taro.request({
            url: this.props.config.baseUrl + 'api/message',
            method: "GET",
            data: {
                uid: this.props.user.uid,
                gid: this.props.user.gid,
                // from_id: ephermeralpubkey
            },
            header: {
                'content-type': 'application/json',
                'cookie': 'session=' + this.props.user.sid,
            }
        });

        console.log('pull message:');
        // console.log(res.data)
        for (let d in res.data) {
            console.log(res.data[d]);
            this.proceedData(res.data[d])
        }
        // this.setState({groups: res.data})

        console.log(this.props.user);
        Taro.redirectTo({
            url: '/pages/groups/index'
        })
    }

    render() {
        return (
            <View className='index'>
                {/*<Button className='add_btn' onClick={this.props.add}>+</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.dec}>-</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>*/}
                {/*<View><Text>{this.props.counter.num}</Text></View>*/}

                {/*<Button className='dec_btn' onClick={this.onClickGroups}>Groups</Button>*/}
                {/*<View><Text>Hello, World</Text></View>*/}
            </View>
        )
    }

    proceedData(d) {
        /* temporary hard code */
        // load client's own keypair from local storage
        // lyh's key
        // const ownkey = {publicKey: decodeBase64('ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY='), secretKey: decodeBase64('60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE=')}
        // cyg's key
        // const ownkey = {
        //     publicKey: decodeBase64('b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM='), secretKey: decodeBase64('bHOLf11eK1tqcVOvXzo9O6I6dUk8NOecOyCKPXge+6Y=')
        // }
        const ownkey = {
            publicKey: decodeBase64(this.props.user.keypair.publicKey),
            secretKey: decodeBase64(this.props.user.keypair.privateKey)
        };

        const uid = this.props.user.uid;
        const gid = this.props.user.gid;

        // target is lyh
        const target = this.props.user.target;
        if (target == null) {
            console.log("not target, skip data");
            return;
        }
        const targetpubkey = decodeBase64(target.publicKey);
        // target is cyg
        // const targetpubkey = decodeBase64('b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM=')

        const payload = nacl.box.open(decodeBase64(d.outercypher), decodeBase64(d.noncestr), decodeBase64(d.ephermeralpubkey), ownkey.secretKey)
        if (payload == null) {
            console.log('auth failed')
        } else {
            // your message
            const utf8 = decodeUTF8(payload)
            let prefix = utf8.substring(0, 9)
            let contents = utf8.substring(9)
            if (prefix === '[CONFESS]') {
                console.log('receive confess')
                const innercypher = '[RESPONS]' + contents
                const ephemeralkey = nacl.box.keyPair()
                // let noncearray = nacl.randomBytes(nacl.secretbox.nonceLength)
                // let noncestr = encodeBase64(noncearray)
                // load targetpubkey
                const outercypher = encodeBase64(nacl.box(encodeUTF8(innercypher), decodeBase64(d.noncestr), targetpubkey, ephemeralkey.secretKey))
                const ephermeralpubkey = encodeBase64(ephemeralkey.publicKey)
                let noncestr = d.noncestr
                const data = {outercypher, noncestr, uid, gid, ephermeralpubkey}
                // send response message
                Taro.request({
                    url: this.props.config.baseUrl + 'api/message',
                    method: "POST",
                    data: data,
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }).then(res => {
                    console.log(res.data);
                    // this.setState({groups: res.data})
                })
            } else if (prefix === '[RESPONS]') {
                console.log('receive response')
                const plaintextarr = nacl.secretbox.open(decodeBase64(contents), decodeBase64(d.noncestr), ownkey.secretKey)
                if (plaintextarr == null) {
                    console.log('response auth failed')
                } else {
                    const plaintext = decodeUTF8(plaintextarr)
                    console.log(plaintext)
                    let ownname = '[ACKNOWL]' + this.props.user.uid
                    let noncearray = nacl.randomBytes(nacl.secretbox.nonceLength)
                    let noncestr = encodeBase64(noncearray)
                    const ephemeralkey = nacl.box.keyPair()
                    const ephermeralpubkey = encodeBase64(ephemeralkey.publicKey)
                    let boxarray = nacl.box(encodeUTF8(ownname), noncearray, targetpubkey, ephemeralkey.secretKey)
                    let outercypher = encodeBase64(boxarray)
                    const data = {outercypher, noncestr, uid, gid, ephermeralpubkey}
                    // send ack message
                    console.log(data)
                    Taro.request({
                        url: this.props.config.baseUrl + 'api/message',
                        method: "POST",
                        data: data,
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        }
                    }).then(res => {
                        console.log(res.data);
                        // this.setState({groups: res.data})
                    })

                }
            } else if (prefix === '[ACKNOWL]') {
                console.log('receive ack')
                console.log(contents)
                this.props.addMatched({uid: contents})
                // TODO: pop up dialogue on success
            }
        }
    }

    async loadCache() {
        try {
            const target = (await Taro.getStorage({key: 'target'})).data;
            this.props.updateTarget(target);
            const sid = (await Taro.getStorage({key: 'sid'})).data;
            this.props.update('sid', sid);
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
