import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'

import '../app.scss'
import addIcon from '../static/images/add-icon.png';

type PageOwnProps = {

}

type PageState = {}

interface GroupCreateItem {
    props: PageOwnProps;
    state: PageState;
}

class GroupCreateItem extends Component {

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

    onClickCreate() {
        Taro.redirectTo({
            url: '/pages/groups/create'
        })
    }

    render() {
        return (
            <View className="flex-row" style="display: flex; align-items: center;">
                <View className="flex-view-item">
                    <Image className="userinfo-avatar" src={addIcon} onClick={this.onClickCreate}/>
                </View>
                <View className="flex-view-item">
                    <Text>Create a New Group</Text>
                </View>
                <View className="flex-view-item" style="margin-left: auto;">
                    <Button></Button>
                </View>
            </View>
        )
    }
}

export default GroupCreateItem as ComponentClass<PageOwnProps, PageState>
