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
import {updateTarget} from "../actions/user";
import {ConfigStateProps} from "../reducers/config";

import {MaterialIcons} from 'taro-icons';

type PageStateProps = {
    user: UserStateProps;
    config: ConfigStateProps;
}

type PageDispatchProps = {
    updateTarget: ({}) => void;
}

type PageOwnProps = {
    uid: string;
    gid?: string;
    name: string;
    avatar: string;
    publicKey: string;
    showLoveBtn?: boolean;
}

type PageState = {}

interface UserItem {
    props: PageOwnProps & PageDispatchProps & PageStateProps;
    state: PageState;
}

// @ts-ignore
@connect(({user, config}) => ({user, config}), (dispatch) => ({
    updateTarget(target) {
        dispatch(updateTarget(target))
    }
}))
class UserItem extends Component {

    static defaultProps = {
        showLoveBtn: true,
        gid: '',
    };

    constructor(props) {
        super(props);
    }

    /*componentWillReceiveProps(nextProps) {
        // console.log(this.props, nextProps)
    }*/

    componentWillUnmount() {
    }

    componentDidShow() {

    }

    componentDidHide() {
    }

    componentDidMount() {
    }

    onClick() {
        // send confess message
        const secretmsg = 'lyhsb';
        // load client's own keyPair from local storage
        // using lyh's here
        const ownkey = {
            publicKey: decodeBase64(this.props.user.keyPair.publicKey),
            secretKey: decodeBase64(this.props.user.keyPair.secretKey)
        };
        // load target's public key through some API
        console.log(`confess love to ${this.props.name}: ${this.props.publicKey}`);
        const targetpubkey = decodeBase64(this.props.publicKey);
        // symmetric encrypt with own secret key to form the inner cypher
        let noncearray = nacl.randomBytes(nacl.secretbox.nonceLength);
        let noncestr = encodeBase64(noncearray);
        // innercypher is a string
        const innercypher = '[CONFESS]' + encodeBase64(nacl.secretbox(encodeUTF8(secretmsg), noncearray, ownkey.secretKey));
        // asymmetric encrypt with target's public key to form whole(outter) cypher
        const ephemeralkey = nacl.box.keyPair();
        // outercypher is a string
        let outercypher = encodeBase64(nacl.box(encodeUTF8(innercypher), noncearray, targetpubkey, ephemeralkey.secretKey));
        const uid = this.props.user.uid;
        const gid = this.props.gid;
        const ephermeralpubkey = encodeBase64(ephemeralkey.publicKey);
        const data = {outercypher, noncestr, uid, gid, ephermeralpubkey};
        console.log(data);
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
            const target = {
                uid: this.props.uid,
                publicKey: this.props.publicKey,
            };
            Taro.setStorage({key: 'target', data: target})
                .then(res => {
                    this.props.updateTarget(target);
                    console.log(res);
                    console.log(this.props.user);
                })
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
                    {this.props.showLoveBtn && this.props.user.uid !== this.props.uid ? (
                        this.props.user.target ? (this.props.user.target.uid === this.props.uid ?
                            <Button className="free-btn-bordernone" type="default" disabled
                                    hover-class="other-button-hover" onClick={this.onClick}>
                                <View style="padding-top: 17px;">
                                    <MaterialIcons name='favorite' size={32} color='#ea4aaa'/>
                                </View>
                            </Button> : null ):
                            <Button className="free-btn-bordernone" type="default"
                                    hover-class="other-button-hover" onClick={this.onClick}>
                                <View style="padding-top: 17px;">
                                    <MaterialIcons name='favorite-border' size={32} color='#ea4aaa'/>
                                </View>
                            </Button>
                    ) : null}
                </View>
            </View>
        )
    }
}

export default UserItem as ComponentClass<PageOwnProps, PageState>
