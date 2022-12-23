export interface IData {
  username: string;
  name: string;
  avatar: string;
  dob: string; //
  email: string;
  phone: string;
  address: {
    city: string;
    street: string;
  };
  paragraph: string;
  img: {
    isDeffer: boolean; //是否延迟加载
    src: string;
    width: number;
  };
  //
  translateY: number;
  keyIndex: number; // 处在所有数据中的下标,因为显示数据的时候,会将item存入visibleData中,所以需要缓存item在listData中的index
  myKey: string; // 用于v-for的key
  timestamp: number; // 时间戳
}

//锚点元素信息
export type Anchor = {
  index: number; //锚点元素在所有数据中的索引
  offsetTop: number; //锚点元素的偏移量,也就是锚点元素不可见部分的高度
};
