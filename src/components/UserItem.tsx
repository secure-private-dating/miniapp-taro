import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'

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
