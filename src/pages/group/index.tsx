import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'
// import {connect} from '@tarojs/redux'
//
// import {add, minus, asyncAdd} from '../../actions/counter'

import '../groups/index.scss'

// import umjiImage from '../../static/images/umji.jpg'
import cygImage from '../../static/images/cyg.jpg'
import fxhImage from '../../static/images/fxh.jpg'
import hycImage from '../../static/images/hyc.jpg'
import jsfImage from '../../static/images/jsf.jpg'
import lyhImage from '../../static/images/lyh.jpg'
import GroupItem from "../../components/GroupItem";

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

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Group {
    props: IProps;
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
        navigationBarTitleText: 'Groups'
    };

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
                    <GroupItem gid={"222"} name={"111"} is_entered={true}
                                   avatar={'http://localhost:8000/static/avatar/umji.jpg'}/>
                </View>

                <View className="section" style={{width: '85%'}}>
                    <View className="section__title">People:</View>

                    <View className="flex-row" style="display: flex; align-items: center;">
                        <View className="flex-view-item">
                            <Image className="userinfo-avatar" src={fxhImage}/>
                        </View>
                        <view className="flex-view-item">
                            <Text>Xiaohan Fu\n</Text>
                            <Text style="font-size: 12px;">2048R/92BDEA7E</Text>
                        </view>
                        <View className="flex-view-item" style="margin-left: auto;">
                            <Button type="default" hover-class="other-button-hover">
                                Love
                            </Button>
                        </View>
                    </View>

                    <View className="flex-row" style="display: flex; align-items: center;">
                        <View className="flex-view-item">
                            <Image className="userinfo-avatar" src={lyhImage}/>
                        </View>
                        <view className="flex-view-item">
                            <Text>Yihao Liu\n</Text>
                            <Text style="font-size: 12px;">4096R/A7404127</Text>
                        </view>
                        <View className="flex-view-item" style="margin-left: auto;">
                            <Button type="default" hover-class="other-button-hover">
                                Love
                            </Button>
                        </View>
                    </View>

                    <View className="flex-row" style="display: flex; align-items: center;">
                        <View className="flex-view-item">
                            <Image className="userinfo-avatar" src={hycImage}/>
                        </View>
                        <view className="flex-view-item">
                            <Text>Yichen Hu\n</Text>
                            <Text style="font-size: 12px;">2048R/25338646</Text>
                        </view>
                        <View className="flex-view-item" style="margin-left: auto;">
                            <Button type="default" hover-class="other-button-hover">
                                Love
                            </Button>
                        </View>
                    </View>

                    <View className="flex-row" style="display: flex; align-items: center;">
                        <View className="flex-view-item">
                            <Image className="userinfo-avatar" src={jsfImage}/>
                        </View>
                        <view className="flex-view-item">
                            <Text>Sifan Jiang\n</Text>
                            <Text style="font-size: 12px;">3072R/CC7BBC04</Text>
                        </view>
                        <View className="flex-view-item" style="margin-left: auto;">
                            <Button type="default" hover-class="other-button-hover">
                                Love
                            </Button>
                        </View>
                    </View>

                    <View className="flex-row" style="display: flex; align-items: center;">
                        <View className="flex-view-item">
                            <Image className="userinfo-avatar" src={cygImage}/>
                        </View>
                        <view className="flex-view-item">
                            <Text>Yunguo Cai\n</Text>
                            <Text style="font-size: 12px;">2048R/4DE527BE</Text>
                        </view>
                        <View className="flex-view-item" style="margin-left: auto;">
                            <Button type="default" disabled hover-class="other-button-hover">
                                Loved
                            </Button>
                        </View>
                    </View>
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
