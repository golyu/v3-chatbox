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
  index: number; // 处在所有数据中的下标,因为显示数据的时候,会将item存入visibleData中,所以需要缓存item在listData中的index
}
