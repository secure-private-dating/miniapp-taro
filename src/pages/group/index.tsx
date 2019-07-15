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
    counter: {
        num: number
    }
}

type PageDispatchProps = {
    add: () => void
    dec: () => void
    asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {
    users: Array<{
        pubkey: string,
        name: string,
        avatar: string
        _id: { $oid: string }
    }>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Group {
    props: IProps;
    state: PageState;
}

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
            users: []
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

    componentDidMount() {
        Taro.request({
            url: 'http://localhost:8000/api/group_users',
            data: {
                gid: this.$router.params.gid
            },
            header: {
                'content-type': 'application/json'
            }
        }).then(res => {
            console.log(res.data);
            this.setState({users: res.data})
        })
    }

    render() {
        return (
            <View className='container'>
                {/*<View className="section" style={{width: '85%'}}>*/}
                {/*    <View className="section__title">Groups:</View>*/}
                {/*    <GroupItem gid={"222"} name={"111"} is_entered={true}*/}
                {/*                   avatar={'http://localhost:8000/static/avatar/umji.jpg'}/>*/}
                {/*</View>*/}

                <View className="section" style={{width: '85%'}}>
                    <View className="section__title">People:</View>

                    {this.state.users.map((value, key) =>
                        <UserItem key={key} uid={value._id.$oid} name={value.name}
                                  pubkey={value.pubkey}
                                  avatar={'http://localhost:8000/' + value.avatar}/>
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
