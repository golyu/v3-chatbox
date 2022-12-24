import { IData } from "@/components/Data";
import { uniqueId } from "@/components/utils";
import { store } from "@/store";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMsgManagerStore = defineStore(
  "msg-manager",
  () => {
    const msgList = ref<IData[]>([]);
    const historyList = ref<IData[]>([]);
    const addMsg = (msg: IData) => {
      msg.myKey = uniqueId();
      //大于500条数据,就存入多余的数据到historyList中
      if (msgList.value.length > 500) {
        //大于20000条数据,就删除最早的数据
        if (historyList.value.length > 20000) {
          historyList.value.shift();
        }
        const leftData = msgList.value.shift();
        leftData && historyList.value.push(leftData);
      }
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
    return {
      msgList,
      msgLen,
      addMsg,
      getVisibleMsgList,
      getMsgList4Len,
      historyList,
    };
  },
  {
    // persist: true, // 注意,不import store,这里会报类型错误
    persist: [
      {
        paths: ["msgList"],
        key: "msg-manager-list",
      },
      {
        paths: ["historyList"],
        key: "msg-manager-history",
      },
    ],
  }
);

export const useMsgManagerStoreWithOut = () => {
  return useMsgManagerStore(store);
};
