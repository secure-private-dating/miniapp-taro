import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './index.scss'
import {UserStateProps} from "../../reducers/user";
import {decode as decodeBase64, encode as encodeBase64} from "@stablelib/base64";
import nacl from "tweetnacl";
import {decode as decodeUTF8, encode as encodeUTF8} from "@stablelib/utf8";


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
    user: UserStateProps
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageOwnProps

interface Index {
    props: IProps;
}

@connect(({user}) => ({user}))
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

    componentDidMount() {
        Taro.request({
            url: 'http://localhost:8000/api/message',
            method: "GET",
            data: {
                uid: "5d2c241762d30c1cc08aaa42",
                gid: "5d2c22c662d30c1cc08aaa3f",
                // from_id: ephermeralpubkey
            },
            header: {
                'content-type': 'application/json'
            }
        }).then(res => {
            console.log('pull message:')
            // console.log(res.data)
            for (let d in res.data) {
                console.log(res.data[d])
                this.proceedData(res.data[d])
            }
            // this.setState({groups: res.data})
        })

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
        const targetpubkey = decodeBase64('ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY=')
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
                    url: 'http://localhost:8000/api/message',
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
                    let ownname = '[ACKNOWL]' + 'lyh'
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
                        url: 'http://localhost:8000/api/message',
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
                // TODO: pop up dialogue on success
            }
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
