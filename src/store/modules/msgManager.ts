import { IData } from "@/components/Data";
import { store } from "@/store";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMsgManagerStore = defineStore(
  "msg-manager",
  () => {
    const msgList = ref<IData[]>([]);
    const addMsg = (msg: IData) => {
      msg.index = msgList.value.length;
      msgList.value.push(msg);
    };
    const getVisibleMsgList = (start: number, end: number) => {
      return msgList.value.slice(start, end);
    };

    const msgLen = computed(() => msgList.value.length);

    // return { msgList, msgLen: $$(msgLen), addMsg, getVisibleMsgList };
    return { msgList, msgLen, addMsg, getVisibleMsgList };
  },
  {
    persist: true, // 注意,不import store,这里会报类型错误
  }
);

export const useMsgManagerStoreWithOut = () => {
  return useMsgManagerStore(store);
};
