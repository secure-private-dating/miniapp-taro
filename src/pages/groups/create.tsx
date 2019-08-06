import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Form, Input, View, Text, Button, Image, Canvas} from '@tarojs/components'

import './index.scss'
import {connect} from "@tarojs/redux";
import {UserStateProps} from "../../reducers/user";
import {ConfigStateProps} from "../../reducers/config";
// import UserItem from "../../components/UserItem";


type PageStateProps = {
    user: UserStateProps;
    config: ConfigStateProps;
}

type PageOwnProps = {}

type PageState = {
    name: string;
    image: string;
    err_message: string;
}

type IProps = PageStateProps & PageOwnProps

interface GroupCreate {
    props: IProps;
    state: PageState;
}

@connect(({user, config}) => ({user, config}))
class GroupCreate extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: 'Group Create'
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            image: '',
            err_message: '',
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


        } catch (e) {
            console.log(e);
        }
    }

    async formSubmit(e) {
        try {
            console.log(e);
            const result = await Taro.uploadFile({
                url: this.props.config.baseUrl + 'group/create',
                filePath: this.state.image,
                name: 'avatar',
                formData: {
                    name: this.state.name,
                },
                header: {
                    // 'content-type': 'application/x-www-form-urlencoded',
                    'cookie': 'session=' + this.props.user.sid,
                }
            });
            if (result.data == 'ok') {
                Taro.redirectTo({
                    url: '/pages/groups/index'
                });
            } else {
                console.log('error', result.data);

            }
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    }

    async formReset() {

    }

    editGroupName(e) {
        this.setState({name: e.detail.value})
    }

    async selectImage() {
        try {
            const result = await Taro.chooseImage({
                sizeType: ['compressed'],
                count: 1,
            });
            if (result.tempFilePaths.length) {
                const image = result.tempFilePaths[0];
                const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp']);
                const file_ext = image.split('.').pop();
                if (!file_ext || !ALLOWED_EXTENSIONS.has(file_ext)) {
                    this.setState({err_message: 'Image type is wrong!'});
                    return;
                }
                // const imageInfo = await Taro.getImageInfo({src: image});
                const width = 512;
                const height = 512;
                let ctx = await Taro.createCanvasContext('canvas', this.$scope);
                // @ts-ignore
                ctx.drawImage(image, 0, 0, width, height);
                ctx.draw(false);
                const timeout = ms => new Promise(res => setTimeout(res, ms));
                await timeout(100);
                // @ts-ignore
                ctx.draw(true, Taro.canvasToTempFilePath({
                    canvasId: 'canvas',
                    destWidth: width,
                    destHeight: height,
                    success: (newImage) => {
                        console.log(newImage);
                        this.setState({image: newImage.tempFilePath});
                    },
                    fail: (data) => {
                        console.log('fail', data);
                    }
                }, this.$scope));
                // this.setState({image})
            }
            console.log(result);
        } catch (e) {
            console.log('group create error:', e);
        }
    }

    onClickBack() {
        Taro.redirectTo({
            url: '/pages/groups/index'
        })
    }

    render() {
        return (
            <View className='container'>
                <View className="section" style={{width: '85%'}}>
                    <Form onSubmit={this.formSubmit} onReset={this.formReset}>
                        <View style="border: 1px solid lightgray;">
                            <Text>Group Name:</Text>
                            <Input value={this.state.name} type='text' placeholder='At most 30 characters'
                                   maxLength={30} focus onInput={this.editGroupName}/>
                        </View>
                        <View>
                            <Button className='btn-max-w' plain type='primary'
                                    onClick={this.selectImage}>Select an Avatar</Button>
                            {this.state.image ? <Image src={this.state.image}/> : null}
                            {/*<Input type='text' placeholder='At most 30 characters' maxLength={30} focus/>*/}
                            {this.state.err_message ? <Text>{this.state.err_message}</Text> : null}
                            <Button className='btn-max-w' plain type='primary' formType='submit'
                                    disabled={this.state.name.length == 0 || this.state.image.length == 0}>Create</Button>
                            <Button className='btn-max-w' plain type='default' onClick={this.onClickBack}>Back</Button>
                        </View>
                        <Canvas style='width: 512px; height: 512px; position: absolute; left:-1000px; top:-1000px; '
                                canvasId='canvas'/>
                    </Form>
                    {/*<View className="section__title">Group Name:</View>*/}
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

export default GroupCreate as ComponentClass<PageOwnProps, PageState>
