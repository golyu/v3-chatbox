import { IData } from "@/components/Data";
import { store } from "@/store";
import { uniqueId } from "lodash-es";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMsgManagerStore = defineStore(
  "msg-manager",
  () => {
    const msgList = ref<IData[]>([]);
    const addMsg = (msg: IData) => {
      // if (msgList.value.length > 100) {
      //   const temp = msgList.value.pop();
      //   if (temp) {
      //     msg.index = temp.index + msgList.value.length;
      //     msgList.value.unshift(msg);
      //   }
      // } else {
      //   msg.index = msgList.value.length;
      //   msgList.value.unshift(msg);
      // }
      // msg.index = msgList.value.length;
      // if (msgList.value.length > 100) {
      //   msgList.value.pop();
      // }
      msg.myKey = uniqueId("t_");
      msgList.value.push(msg);
    };
    const getVisibleMsgList = (start: number, end: number) => {
      const visibleData = msgList.value.slice(start, end);
      for (let visibleDatum of visibleData) {
        visibleDatum.keyIndex = start++; // 标注处在所有数据中的下标
      }
      return visibleData;
    };
    const getMsgList4Len = (maxLen: number) => {
      if (msgList.value.length > maxLen) {
        return msgList.value.slice(
          msgList.value.length - maxLen,
          msgList.value.length
        );
      } else {
        return msgList.value;
      }
    };

    const msgLen = computed(() => msgList.value.length);

    // return { msgList, msgLen: $$(msgLen), addMsg, getVisibleMsgList };
    return { msgList, msgLen, addMsg, getVisibleMsgList, getMsgList4Len };
  },
  {
    persist: true, // 注意,不import store,这里会报类型错误
  }
);

export const useMsgManagerStoreWithOut = () => {
  return useMsgManagerStore(store);
};
