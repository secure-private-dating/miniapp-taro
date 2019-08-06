import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
// import {connect} from '@tarojs/redux'
//
// import {add, minus, asyncAdd} from '../../actions/counter'

import './index.scss'
import GroupItem from '../../components/GroupItem'
import {connect} from "@tarojs/redux";
import {UserStateProps} from "../../reducers/user";
import UserItem from "../../components/UserItem";
import {ConfigStateProps} from "../../reducers/config";
import GroupCreateItem from "../../components/GroupCreateItem";
import {decode as decodeBase64, encode as encodeBase64} from "@stablelib/base64";
import nacl from "tweetnacl";
import {decode as decodeUTF8, encode as encodeUTF8} from "@stablelib/utf8";
import {addMatched, update, updateTarget} from "../../actions/user";

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
    groups: Array<{
        name: string,
        avatar: { $oid: string }
        _id: { $oid: string }
    }>;
    matched: Array<{
        publicKey: string,
        name: string,
        avatar: string
        _id: { $oid: string }
    }>;
    self: null | {
        publicKey: string,
        name: string,
        avatar: string,
        _id: { $oid: string }
    };
}

type IProps = PageStateProps & PageOwnProps & PageDispatchProps

interface Groups {
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
class Groups extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: 'Groups'
    };

    constructor(props) {
        super(props);
        this.state = {
            groups: [],
            matched: [],
            self: null,
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() {
    }

    componentDidShow() {

    }

    componentDidHide() {
    }

    async componentDidMount() {
        try {
            await this.loadData();
            let matched: any = [];
            for (let i in this.props.user.matched) {
                const res = await Taro.request({
                    url: this.props.config.baseUrl + 'api/user',
                    data: {
                        uid: this.props.user.matched[i].uid
                    },
                    header: {
                        'content-type': 'application/json',
                        'cookie': 'session=' + this.props.user.sid,
                    }
                });
                matched.push(res.data);
            }
            const res1 = await Taro.request({
                url: this.props.config.baseUrl + 'api/user',
                data: {
                    uid: this.props.user.uid
                },
                header: {
                    'content-type': 'application/json',
                    'cookie': 'session=' + this.props.user.sid,
                }
            });
            const res = await Taro.request({
                url: this.props.config.baseUrl + 'api/groups',
                data: {
                    uid: this.props.user.uid
                },
                header: {
                    'content-type': 'application/json',
                    'cookie': 'session=' + this.props.user.sid,
                }
            });
            this.setState({
                groups: res.data,
                self: res1.data,
                matched: matched,
            })

        } catch (e) {
            console.log(e);
        }
    }

    proceedData(d, gid) {
        /* temporary hard code */
        // load client's own keyPair from local storage
        // lyh's key
        // const ownkey = {publicKey: decodeBase64('ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY='), secretKey: decodeBase64('60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE=')}
        // cyg's key
        // const ownkey = {
        //     publicKey: decodeBase64('b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM='), secretKey: decodeBase64('bHOLf11eK1tqcVOvXzo9O6I6dUk8NOecOyCKPXge+6Y=')
        // }
        const ownkey = {
            publicKey: decodeBase64(this.props.user.keyPair.publicKey),
            secretKey: decodeBase64(this.props.user.keyPair.secretKey)
        };
        console.log('receive data, use ownkey:', ownkey);
        const uid = this.props.user.uid;

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
                        'content-type': 'application/x-www-form-urlencoded',
                        'cookie': 'session=' + this.props.user.sid,
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
                    if (this.props.user.target) {
                        this.props.addMatched({uid: this.props.user.target.uid});
                    }
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
                            'content-type': 'application/x-www-form-urlencoded',
                            'cookie': 'session=' + this.props.user.sid,
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


    async loadData() {

        console.log(this.props.user);

        const res = await Taro.request({
            url: this.props.config.baseUrl + 'api/pull_message',
            method: "POST",
            data: {
                'latest_message_id': this.props.user.latestMessageId
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'cookie': 'session=' + this.props.user.sid,
            }
        });
        console.log('pull message:');
        console.log(res.data);
        let latestMessageId = JSON.parse(this.props.user.latestMessageId);
        for (let gid in res.data) {
            if (!res.data.hasOwnProperty(gid)) continue;
            console.log('process gid:', gid);
            const dataSize = res.data[gid].length;
            if (dataSize) {
                latestMessageId[gid] = res.data[gid][dataSize - 1]._id.$oid;
                for (let i = 0; i < dataSize; i++) {
                    console.log(res.data[gid][i]);
                    this.proceedData(res.data[gid][i], gid);
                }
            }
        }
        console.log('updated latest message id', latestMessageId);
        latestMessageId = JSON.stringify(latestMessageId);
        await Taro.setStorage({key: 'latestMessageId', data: latestMessageId});
        this.props.update({latestMessageId});


        /*console.log('pull message:');
        // console.log(res.data)
        for (let d in res.data) {
            console.log(res.data[d]);
            this.proceedData(res.data[d])
        }
        // this.setState({groups: res.data})

        console.log(this.props.user);
        Taro.redirectTo({
            url: '/pages/groups/index'
        })*/
    }


    render() {
        return (
            <View className='container'>
                {this.state.self ?
                    <View className="section" style={{width: '85%'}}>
                        <View className="section__title">Welcome:</View>
                        <UserItem uid={this.state.self._id.$oid} name={this.state.self.name}
                                  publicKey={this.state.self.publicKey} showLoveBtn={false}
                                  avatar={this.state.self.avatar}/>
                    </View> : null}
                {this.state.matched.length ?
                    <View className="section" style={{width: '85%'}}>
                        <View className="section__title">Matched:</View>
                        {this.state.matched.map((value) =>
                            <UserItem uid={value._id.$oid} name={value.name}
                                      publicKey={value.publicKey} showLoveBtn={false}
                                      avatar={value.avatar}/>
                        )}
                    </View> : null}
                <View className="section" style={{width: '85%'}}>
                    <View className="section__title">Groups:</View>
                    <GroupCreateItem/>
                    {this.state.groups.map((value) =>
                        <GroupItem gid={value._id.$oid} name={value.name} is_entered={false}
                                   avatar={value.avatar.$oid}/>
                    )}
                </View>
            </View>
        )
    }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Groups as ComponentClass<PageOwnProps, PageState>
