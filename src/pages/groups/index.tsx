import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
// import {connect} from '@tarojs/redux'
//
// import {add, minus, asyncAdd} from '../../actions/counter'

import './index.scss'
import GroupItem from '../../components/GroupItem'
import {connect} from "@tarojs/redux";
import {UserStateProps} from "../../reducers/user";

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

type PageState = {
    groups: Array<{
        name: string,
        avatar: string
        _id: { $oid: string }
    }>;
}

type IProps = PageStateProps & PageOwnProps

interface Groups {
    props: IProps;
    state: PageState;
}

@connect(({user}) => ({user}))
class Groups extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: 'Groups'
    };

    constructor(props) {
        super(props);
        this.state = {
            groups: []
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
            url: 'http://localhost:8000/api/groups',
            data: {
                uid: this.props.user.uid
            },
            header: {
                'content-type': 'application/json'
            }
        }).then(res => {
            console.log(res.data);
            this.setState({groups: res.data})
        })
    }

    onClickEnter() {
        Taro.redirectTo({
            url: '/pages/group/index'
        })
    }

    render() {
        return (
            <View className='container'>
                {/*<Button className='add_btn' onClick={this.props.add}>+</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.dec}>-</Button>*/}
                {/*<Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>*/}
                {/*<View><Text>{this.props.counter.num}</Text></View>*/}
                {/*<View><Text>Hello, World</Text></View>*/}
                <View className="section" style={{width: '85%'}}>
                    <View className="section__title">Groups:</View>
                    {this.state.groups.map((value, key) =>
                        <GroupItem key={key} gid={value._id.$oid} name={value.name} is_entered={false}
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

export default Groups as ComponentClass<PageOwnProps, PageState>
