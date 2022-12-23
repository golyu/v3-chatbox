<template>
  <div class="root">
    <ul
      ref="scrollerRef"
      class="height-dynamic"
      @scroll="handleScroll"
      @touchstart="touchStart"
      @touchend="touchEnd"
    >
      <li :style="`height:${topHeight}px`"></li>
      <ChatLi
        ref="chatLisRef"
        v-for="(item, index) in visibleData"
        :index="index"
        :key="item.myKey"
        @sizeChange="handleSizeChange"
      >
        <slot name="item" v-bind="item"></slot>
      </ChatLi>
    </ul>
    <!--  <查看历史>  按钮-->
    <transition name="fade">
      <div class="look-history" v-if="lastScrollTop === 0">查看历史</div>
    </transition>

    <!--  <滚动到底部> 按钮  -->
    <transition name="fade">
      <div class="to-bottom-btn" v-if="!authScrollSwitch" @click="onGoBottom">
        <svg class="icon" viewBox="0 0 1280 1024" width="55" height="55">
          <path
            d="M914 578v60.5c0 37.6-30.4 68-68 68H435c-37.6 0-68-30.4-68-68V578c0-18.8-15.2-34-34-34s-34 15.2-34 34v59.5c0 75.4 61.1 136.5 136.5 136.5h410c75.4 0 136.5-61.1 136.5-136.5V578c0-18.8-15.2-34-34-34s-34 15.2-34 34z"
          ></path>
          <path
            d="M788 393.5c-13.5-13.5-35.5-13.5-49 0l-65 65V207c0-18.8-15.2-34-34-34s-34 15.2-34 34v251.5l-65-65c-13.5-13.5-35.5-13.5-49 0s-13.5 35.5 0 49l121.6 121.6c14.6 14.6 38.3 14.6 52.9 0L788 442.5c13.6-13.5 13.6-35.5 0-49z"
            fill="#00F1A3"
          ></path>
        </svg>
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
import ChatLi from "@/components/chat2/ChatLi.vue";
import { ChatLiRef } from "@/components/chat2/ChatLi_T";
import { IData } from "@/components/Data";
import { useMsgManagerStore } from "@/store/modules/msgManager";
import { throttle } from "lodash-es";
import smoothScroll from "smoothscroll-polyfill";
import { watch, nextTick } from "vue";
import { $ref, $computed } from "vue/macros";

smoothScroll.polyfill(); //对平滑滚动做的 兼容性处理
const msgManager = useMsgManagerStore();
const { cacheDataLen = 5 } = defineProps<{ cacheDataLen: number }>();
const scrollerRef = $ref<HTMLElement>(); //滚动容器的ref
let authScrollSwitch = $ref(true); //自动滚动开关
let showLookHistoryShow = $ref(false); //显示查看历史记录按钮
const chatLisRef = $ref<ChatLiRef[]>([]); //列表元素的ref
let cachedHeight = $ref<number[]>([]); //缓存的列表元素的高度
let cachedHeightSum = $computed(() => cachedHeight.reduce((a, b) => a + b, 0)); //缓存的列表元素的高度总和
let topHeight = $ref(0); //顶部占位元素的高度
//滚动容器中的item发生变化,导致滚动容器的高度发生变化
const handleSizeChange = throttle((index: number, height: number) => {
  console.log("handleSizeChange", index, height);
  cachedHeight[index] = height;
  computeTopHeight();
  goBottom();
}, 100);

let visibleData = $ref<IData[]>(msgManager.getMsgList4Len(cacheDataLen));

watch(
  () => [...msgManager.msgList],
  (newList, oldList) => {
    // console.log("msgList", "发生变化", newList, oldList);
    if (oldList.length < cacheDataLen) {
      //如果旧数据长度小于缓存长度,则不需要做任何处理
      visibleData = msgManager.getMsgList4Len(cacheDataLen);
      goBottom();
    }
    //数据发生变化时,判断是否开启了置底,如果开启了,则滚动到底部
    else if (authScrollSwitch) {
      //因为自动状态下,数据变化但长度不变,列表不会抖动,所以不用处理
      visibleData = msgManager.getMsgList4Len(cacheDataLen);
      goBottom();
    } else {
      //直接将新增的数据添加到列表中,缺点是,列表长度会超过cacheDataLen
      //如果是未置底状态
      const oldLatest = oldList.pop(); // 找到旧数据中最后一条
      const index = newList.findIndex(
        (item) => item.myKey === oldLatest!.myKey
      ); //找到新数据中最后一条的索引
      if (index === -1) {
        //如果没找到,说明数据发生了异常,用getMsgList4Len补偿一下
        console.log("发生异常情况", oldLatest);
        visibleData = msgManager.getMsgList4Len(cacheDataLen);
      } else {
        const x = newList.slice(index + 1);
        visibleData.push(...x);
      }
    }
  }
);

//计算顶部占位元素的高度
const computeTopHeight = async () => {
  await nextTick();
  if (chatLisRef.length > 20) {
    topHeight = 0;
    console.log("1>>>", topHeight);
    return;
  }
  //如果所有数据高度加起来小于容器高度,那就把数据撑开
  for (const chatLiRef of chatLisRef) {
    cachedHeight[chatLiRef.index] = chatLiRef?.getHeight();
  }
  if (scrollerRef && cachedHeightSum > 0) {
    topHeight = scrollerRef!.offsetHeight - cachedHeightSum;
    console.log("2>>>", topHeight);
  } else {
    topHeight = 0;
    console.log("3>>>", topHeight);
  }
};

watch(
  () => visibleData.length,
  () => {
    computeTopHeight();
  },
  { immediate: true }
);

//滚动到底部
const goBottom = async () => {
  if (authScrollSwitch) {
    await nextTick();
    scrollerRef!.scroll({ top: 666666, left: 0, behavior: "smooth" });
  }
};
const onGoBottom = () => {
  authScrollSwitch = true;
  goBottom();
};
let lastScrollTop = $ref(0); //上一次滚动到的位置
const handleScroll = throttle(() => {
  // console.log("节流个jb");
  const delta = scrollerRef!.scrollTop - lastScrollTop;
  if (delta === 0) {
    console.log("滚动距离为0");
    return;
  }
  lastScrollTop = scrollerRef!.scrollTop;
  if (delta > 0) {
    // console.log("向下滚动");
    if (isHitBottom()) {
      //滚动到了底部
      console.log("滚动到了底部");
      authScrollSwitch = true;
    }
  }
}, 100);

let touchStartY = $ref<number | undefined>(0);
const touchStart = (a: TouchEvent) => {
  touchStartY = a.changedTouches.item(0)?.clientY;
};
const touchEnd = (a: TouchEvent) => {
  const touchEndY = a.changedTouches.item(0)?.clientY;
  //向上滑动了
  if (touchStartY && touchEndY && touchEndY > (touchStartY || 666666)) {
    console.log("向上滑动了,关闭自动滚动");
    authScrollSwitch = false; // 关闭自动滚动
    handleLoadMore();
  }
};

const handleLoadMore = () => {
  if (scrollerRef!.scrollTop === 0) {
    console.log("滑动到了最顶部");
  }
};
//是否滚动到了底部
const isHitBottom = () => {
  // scrollHeight为内容可视区域的高度加上溢出（滚动）的距离。
  const { scrollTop, clientHeight, scrollHeight } = scrollerRef!;
  // console.log(scrollTop, clientHeight, scrollHeight);
  return scrollTop + clientHeight + 2 >= scrollHeight; //因为有边框,所以补偿2px
};
</script>
<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "ChatBox",
};
</script>
<style lang="scss" scoped>
.root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.height-dynamic {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  position: absolute;
  contain: layout;
  will-change: transform;
  background-color: #eee;
}

.look-history {
  position: fixed;
  top: 20px;
  right: 10px;
  padding: 5px 10px;
  animation: dong 2s infinite;
  box-shadow: 2px 2px 5px #333333;
  border-radius: 5px;
  background-color: white;
}

.to-bottom-btn {
  padding: 0;
  position: fixed;
  bottom: 20px;
  right: 10px;
  z-index: 100;
  animation: dong 2s infinite;

  .icon {
    filter: drop-shadow(2px 2px 3px #000a);
    //text-shadow: 2px 2px 5px #333333;
  }
}

@keyframes dong {
  0% {
    transform: translate(0px, 0px);
  }
  50% {
    transform: translate(0px, -3px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

//淡入淡出动画
.fade-leave-from, // 离开前,进入后透明度是1
.fade-enter-to {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}

.fade-leave-to,
.fade-enter-from {
  opacity: 0;
}
</style>
