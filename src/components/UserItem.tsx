import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import nacl from 'tweetnacl'
import {encode as encodeBase64, decode as decodeBase64} from '@stablelib/base64'
// import {encode as encodeUTF8, decode as decodeUTF8} from '@stablelib/utf8'
import {encode as encodeUTF8} from '@stablelib/utf8'
import {UserStateProps} from '../reducers/user'

import '../app.scss'

type PageStateProps = {
    user: UserStateProps
}

type PageOwnProps = {
    uid: string,
    name: string,
    avatar: string,
    pubkey: string,
}

type PageState = {}

interface UserItem {
    props: PageOwnProps & PageStateProps;
    state: PageState;
}

@connect(({user}) => ({user}))
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
        const secretmsg = 'lyhsb';
        // load client's own keypair from local storage
        // using lyh's here
        const ownkey = {
            publicKey: decodeBase64(this.props.user.keypair.publicKey),
            secretKey: decodeBase64(this.props.user.keypair.privateKey)
        };
        // load target's public key through some API
        const targetpubkey = decodeBase64(this.props.pubkey);
        // symmetric encrypt with own secret key to form the inner cypher
        let noncearray = nacl.randomBytes(nacl.secretbox.nonceLength);
        let noncestr = encodeBase64(noncearray);
        // innercypher is a string
        const innercypher = '[CONFESS]' + encodeBase64(nacl.secretbox(encodeUTF8(secretmsg), noncearray, ownkey.secretKey));
        // asymmetric encrypt with target's public key to form whole(outter) cypher
        const ephemeralkey = nacl.box.keyPair();
        // outercypher is a string
        let outercypher = encodeBase64(nacl.box(encodeUTF8(innercypher), noncearray, targetpubkey, ephemeralkey.secretKey));
        // uid = 1
        const uid = this.props.user.uid;
        const gid = this.props.user.gid;
        const ephermeralpubkey = encodeBase64(ephemeralkey.publicKey);
        const data = {outercypher, noncestr, uid, gid, ephermeralpubkey};
        console.log(data);
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
