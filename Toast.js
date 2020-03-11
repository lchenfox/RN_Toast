import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Animated,
    StyleSheet,
} from 'react-native';
import SuccessImg from './success_icon.png';

const AnimatedDuration = 150;
const ShowTimeDuration = 2.0;

export default class Toast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            type: '',
            title: '',
            isShow: false,
            opacity: new Animated.Value(0),
            bounceValue: new Animated.Value(0.7),
        };
        this.__timer__ = null;
        this.toastHiddenCallBack = null;
    }

    componentWillUnmount() {
        this._clearTimer();
    }

    show = (title, {duration, toastHiddenCallBack, type, icon}) => {

        if (this.state.isShow) {
            return;
        }

        if (!title || typeof title !== 'string') {
            console.warn(`showToast Error:\n title is required, type String`);
            return;
        }

        this._clearTimer();

        this.toastHiddenCallBack = toastHiddenCallBack && typeof toastHiddenCallBack === 'function' ? toastHiddenCallBack : null;
        const toastDuration = duration && typeof duration === 'number' ? duration : ShowTimeDuration;

        this.setState({
            title,
            type,
            icon,
            isShow: true,
        }, () => {
            this.state.opacity.setValue(0.5);
            Animated.parallel([
                Animated.spring(
                    this.state.bounceValue,
                    {
                        toValue: 1,
                        friction: 6,
                        tension: 60,
                    }
                ),
                Animated.timing(
                    this.state.opacity,
                    {
                        toValue: 1,
                        duration: AnimatedDuration,
                    }
                )
            ]).start();

            this.__timer__ = setInterval(() => {
                this.state.opacity.setValue(0);
                this.state.bounceValue.setValue(0.7);
                this.setState({isShow: false});
                if (this.toastHiddenCallBack) {
                    this.toastHiddenCallBack();
                }
                this._clearTimer();
            }, toastDuration * 1000);
        });

    };

    hide = (callBack) => {
        this._clearTimer();
        if (this.state.isShow) {
            this.setState({
                isShow: false,
            }, () => {
                this.state.opacity.setValue(0);
                this.state.bounceValue.setValue(0.7);
                callBack && typeof callBack === 'function' && callBack();
            });
        } else {
            callBack && typeof callBack === 'function' && callBack();
        }
    };

    isToastShow = () => {
        return !!this.state.isShow;
    };

    _clearTimer = () => {
        if (this.__timer__) {
            clearInterval(this.__timer__);
            this.__timer__ = null;
        }
    };

    render() {
        if (!this.state.isShow) {
            return null;
        }
        const {type, icon} = this.state;
        const hadIcon = (type === 'success') || !!icon;
        return (
            <View pointerEvents="none" style={styles.container}>
                <Animated.View style={[styles.sheetBlackPanel, {
                    opacity: this.state.opacity,
                    transform: [
                        {scale: this.state.bounceValue},
                    ],
                }]}
                >
                    {
                        hadIcon ? <Image source={icon ? icon : SuccessImg}/> : null
                    }
                    <Text allowFontScaling={false}
                          style={[styles.title, hadIcon ? {marginTop: 8} : null]}
                          numberOfLines={10}
                    >
                        {this.state.title || ''}
                    </Text>
                </Animated.View>
            </View>
        );
    }


}


const styles = StyleSheet.create({
    container: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetBlackPanel: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 14,
        lineHeight: 18,
        padding: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
});
