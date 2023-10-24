import React from "react";
import Taro from "@tarojs/taro";
import NavBar, {NavBarProps} from "@/components/NavBar";


interface Props extends NavBarProps{
    r: number;
    g: number;
    b: number;
}

const OpacityNavBar: React.FC<Props> = (props: Props) => {
    const {config, r, g, b} = props;
    const [a, setA] = React.useState(0);
    
    Taro.usePageScroll((e) => {
        const x = e.scrollTop < 100 ? e.scrollTop : 100;
        setA(x / 100);
    })
    
    return <NavBar
        hiddenLeft={props.hiddenLeft}
        config={{
            ...config,
            navigationBarBackgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`
    }} onBack={props.onBack}
    />;
};

NavBar.defaultProps = {
    config: {}
};

export default OpacityNavBar;
