import {Input, View, InputProps, CommonEventFunction, CustomWrapper} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";


interface Props {
    className?: string;
    onInput?: CommonEventFunction<InputProps.inputEventDetail>;
    placeholder?: string;
    placeholderClass?: string;
    value?: string;
}


const MyInput: React.FC<Props> = (props) => {
    const [focus, setFocus] = React.useState(false);
    
    return <>
        {focus ? <>
            <CustomWrapper>
                <Input
                    className={props.className}
                    value={props.value || ''}
                    onInput={props.onInput}
                    placeholder=""
                    placeholderClass={props.placeholderClass}
                    focus={focus}
                    autoFocus={focus}
                    onBlur={() => setFocus(false)}
                />
            </CustomWrapper>
        </> : <View className={cx(props.className, {
            [props.placeholderClass!]: !props.value
        })} onClick={() => setFocus(true)} style={{
            flexDirection: "row",
            alignItems: "center",
            width: '100%'
        }}>
            {props.value || props.placeholder}
        </View>}
    </>;
};

MyInput.defaultProps = {
    placeholderClass: ''
};

export default React.memo(MyInput);
