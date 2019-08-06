import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'

import '../app.scss'
import {connect} from "@tarojs/redux";
import {UserStateProps} from "../reducers/user";
import {ConfigStateProps} from "../reducers/config";

type PageStateProps = {
    user: UserStateProps;
    config: ConfigStateProps;
}

type PageOwnProps = {
    is_entered: boolean,
    gid: string,
    name: string,
    avatar: string,
}

type PageState = {}

interface GroupItem {
    props: PageStateProps & PageOwnProps;
    state: PageState;
}

@connect(({user, config}) => ({user, config}))
class GroupItem extends Component {

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

    onClickEnter() {
        Taro.redirectTo({
            url: '/pages/group/index?gid=' + this.props.gid
        })
    }

    onClickBack() {
        Taro.redirectTo({
            url: '/pages/groups/index'
        })
    }

    render() {
        return (
            <View className="flex-row" style="display: flex; align-items: center;">
                <View className="flex-view-item">
                    <Image className="userinfo-avatar"
                           src={this.props.config.baseUrl + 'group/avatar/' + this.props.avatar}/>
                </View>
                <View className="flex-view-item">
                    <Text>{this.props.name}</Text>
                </View>
                <View className="flex-view-item" style="margin-left: auto;">
                    {this.props.is_entered ?
                        <View>
                            <Button type="default" hover-class="other-button-hover" openType='share'>
                                Invite
                            </Button>
                            <Button type="default" hover-class="other-button-hover"
                                    onClick={this.onClickBack}>
                                Back
                            </Button>
                        </View> :
                        <Button type="default" hover-class="other-button-hover"
                                onClick={this.onClickEnter}>
                            Enter
                        </Button>
                    }
                </View>
            </View>
        )
    }
}

export default GroupItem as ComponentClass<PageOwnProps, PageState>
