import {ComponentClass} from 'react'
import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'

import '../app.scss'
import {MaterialIcons} from 'taro-icons';
import addIcon from '../static/images/add-icon.png';

type PageOwnProps = {

}

type PageState = {}

interface GroupCreate {
    props: PageOwnProps;
    state: PageState;
}

class GroupCreate extends Component {

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

    onClickBack() {
        Taro.redirectTo({
            url: '/pages/groups/index'
        })
    }

    render() {
        return (
            <View className="flex-row" style="display: flex; align-items: center;">
                <View className="flex-view-item">
                    {/*<View className="userinfo-avatar">*/}
                    {/*    <MaterialIcons className="userinfo-avatar" name='add-circle-outline' size='64px' color='#ea4aaa'/>*/}
                    {/*</View>*/}
                    <Image className="userinfo-avatar" src={addIcon}/>
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

export default GroupCreate as ComponentClass<PageOwnProps, PageState>
