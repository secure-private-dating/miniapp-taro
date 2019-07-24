import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
// import {connect} from '@tarojs/redux'
//
// import {add, minus, asyncAdd} from '../../actions/counter'

import '../groups/index.scss'

// import umjiImage from '../../static/images/umji.jpg'
// import cygImage from '../../static/images/cyg.jpg'
// import fxhImage from '../../static/images/fxh.jpg'
// import hycImage from '../../static/images/hyc.jpg'
// import jsfImage from '../../static/images/jsf.jpg'
// import lyhImage from '../../static/images/lyh.jpg'
//
// import GroupItem from "../../components/GroupItem";
import UserItem from "../../components/UserItem";
import GroupItem from "../../components/GroupItem";
import {UserStateProps} from "../../reducers/user";
import {connect} from "@tarojs/redux";
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

type PageOwnProps = {}

type PageState = {
    users: Array<{
        pubkey: string,
        name: string,
        avatar: string
        _id: { $oid: string }
    }>;
    self: null | {
        name: string,
        avatar: string
        _id: { $oid: string }
    }
}

type IProps = PageStateProps & PageOwnProps

interface Group {
    props: IProps;
    state: PageState;
}

@connect(({user, config}) => ({user, config}))
class Group extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: 'Group View'
    };

    constructor(props) {
        super(props);
        this.state = {
            users: [],
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
            const users = await Taro.request({
                url: this.props.config.baseUrl + 'api/group_users',
                data: {
                    gid: this.$router.params.gid
                },
                header: {
                    'content-type': 'application/json'
                }
            });
            console.log(users.data);
            const group = await Taro.request({
                url: this.props.config.baseUrl + 'api/group',
                data: {
                    gid: this.$router.params.gid
                },
                header: {
                    'content-type': 'application/json'
                }
            });
            console.log(group.data);
            this.setState({
                users: users.data,
                self: group.data,
            });
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <View className='container'>
                {this.state.self ?
                    <View className="section" style={{width: '85%'}}>
                        <View className="section__title">Group:</View>
                        <GroupItem gid={this.state.self._id.$oid} name={this.state.self.name} is_entered={true}
                                   avatar={this.state.self.avatar}/>
                    </View> : null}
                {/*<View className="section" style={{width: '85%'}}>*/}
                {/*    <View className="section__title">Welcome:</View>*/}
                {/*    {this.state.users.map((value, key) =>*/}
                {/*        value._id.$oid === this.props.user.uid ?*/}
                {/*            <UserItem key={key} uid={value._id.$oid} name={value.name}*/}
                {/*                      pubkey={value.pubkey}*/}
                {/*                      avatar={this.props.config.baseUrl + value.avatar}/> : null*/}
                {/*    )}*/}
                {/*</View>*/}

                <View className="section" style={{width: '85%'}}>
                    <View className="section__title">People:</View>
                    {this.state.users.map((value, key) =>
                        value._id.$oid !== this.props.user.uid ?
                            <UserItem key={key} uid={value._id.$oid} name={value.name}
                                      pubkey={value.pubkey}
                                      avatar={value.avatar}/> : null
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

export default Group as ComponentClass<PageOwnProps, PageState>
