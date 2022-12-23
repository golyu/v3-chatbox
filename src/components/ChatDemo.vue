<template>
  <div class="add-data">
    <button @click="onAddMsg" style="padding: 10px">增加数据</button>
  </div>

  <ChatBox #item="item" :cache-data-len="100">
    <ChatItem :index="item.index" :data="item" />
  </ChatBox>
</template>

<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "ChatDemo",
};
</script>
<script lang="ts" setup>
import ChatBox from "@/components/chat2/ChatBox.vue";
import { ChatBoxRef } from "@/components/chat/ChatBox_T";
import ChatItem from "@/components/chat2/ChatItem.vue";
import { fetchDataApi } from "@/components/helpers";
import { useMsgManagerStore } from "@/store/modules/msgManager";

const msgManagerStore = useMsgManagerStore();
const chatBoxRef = $ref<ChatBoxRef>();

const goBottom = () => {
  chatBoxRef!.goBottom();
};
const onAddMsg = () => {
  const data = fetchDataApi(1);
  //给每个item打上序号标记,并补充到listData中
  for (let datum of data) {
    // datum.index = listDataLen; 这里赋值,listDataLen的值会有延迟,所以在addMsg中赋值
    msgManagerStore.addMsg(datum);
  }
};
</script>
<style lang="scss" scoped>
.add-data {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}
</style>
