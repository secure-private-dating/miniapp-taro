import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'
import nacl from 'tweetnacl'
import {encode as encodeBase64, decode as decodeBase64} from '@stablelib/base64'
import {encode as encodeUTF8, decode as decodeUTF8} from '@stablelib/utf8'


import '../app.scss'

type PageOwnProps = {
    uid: string,
    name: string,
    avatar: string,
    pubkey: string,
}

type PageState = {}

interface UserItem {
    props: PageOwnProps;
    state: PageState;
}

class UserItem extends Component {

    constructor(props) {
        super(props);
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

    componentDidMount() {
    }

    onClick() {
        console.log(this.props.pubkey);
        const secretmsg = 'lyhsb'
        // load client's own keypair from local storage
        // using lyh's here
        const ownkey = {publicKey: decodeBase64('ROh0E1mJOFEEx/z3A2S7sKm3ZT88vKIdIJ/Bpj1h1GY='),
            secretKey: decodeBase64('60qYjRlHzau5burcWwRJAwsujn5tCtiKt0j3qRkceWE=')}
        // load target's public key through some API
        const targetpubkey = decodeBase64('b//rwWJqdFW9el5FW0xnxKQmNRLAR0kuUe/2qQoG9nM=')
        // symmetric encrypt with own secret key to form the inner cypher
        let noncearray = nacl.randomBytes(nacl.secretbox.nonceLength)
        let noncestr = encodeBase64(noncearray)
        // innercypher is a string
        const innercypher = '[CONFESS]' + encodeBase64(nacl.secretbox(encodeUTF8(secretmsg), noncearray, ownkey.secretKey))
        // asymmetric encrypt with target's public key to form whole(outter) cypher
        const ephemeralkey = nacl.box.keyPair()
        // outercypher is a string
        let outercypher = encodeBase64(nacl.box(encodeUTF8(innercypher), noncearray, targetpubkey, ephemeralkey.secretKey))
        // uid = 1
        const uid = '5d2c286762d30c1cc08aaa44'
        const gid = '5d2c22c662d30c1cc08aaa3f'
        const ephermeralpubkey = encodeBase64(ephemeralkey.publicKey)
        // const data = {outercypher, noncestr, uid, gid, ephermeralpubkey}
        Taro.request({
            url: 'http://localhost:8000/api/message',
            method: "POST",
            data: {
                // outercypher: outercypher,
                // noncestr: noncestr,
                uid: uid,
                gid: gid,
                // ephermeralpubkey: ephermeralpubkey
            },
            header: {
                'content-type': 'application/json'
            }
        }).then(res => {
            console.log(res.data);
            // this.setState({groups: res.data})
        })
        // const message = JSON.stringify(data)
        // send message through API
        //console.log(message)
    }

    render() {
        return (
            <View className="flex-row" style="display: flex; align-items: center;">
                <View className="flex-view-item">
                    <Image className="userinfo-avatar" src={this.props.avatar}/>
                </View>
                <view className="flex-view-item">
                    <Text>{this.props.name}\n</Text>
                    {/*<Text style="font-size: 12px;">{this.props.pubkey}</Text>*/}
                </view>
                <View className="flex-view-item" style="margin-left: auto;">
                    <Button type="default" hover-class="other-button-hover" onClick={this.onClick}>
                        Love
                    </Button>
                </View>
            </View>
        )
    }
}

export default UserItem as ComponentClass<PageOwnProps, PageState>
