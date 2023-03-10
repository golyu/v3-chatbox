<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "HeightDynamic",
};
</script>
<script lang="ts" setup>
import { Anchor, IData } from "@/components/Data";
import Item from "@/components/Item.vue";
import type { ItemRef } from "@/components/Item_T";
import Placeholder from "@/components/Placeholder.vue";
import { onMounted, nextTick } from "vue";
import { $computed, $ref } from "vue/macros";
import { fetchDataApi } from "@/components/helpers";

let PLACEHOLDER_COUNT = 6; //占位符数量
let BUFFER_SIZE = 3; //缓冲区大小,最多6个上下各三个
let VISIBLE_COUNT = BUFFER_SIZE * 2; //可见元素数量

let ESTIMATED_HEIGHT = $ref(180); //列表元素的估算高度
let anchorItem = $ref<Anchor>({
  index: 0,
  offsetTop: 0,
}); //锚点元素
let listData = $ref<IData[]>([]); //列表总数据
let visibleData = $ref<IData[]>([]); //可见的列表数据

let topPlaceholders = $ref(0); //上方占位符的数量
let bottomPlaceholders = $ref(0); //下方占位符的数量

//用于从listData中切割出visibleData
let firstAttachedItem = $ref(0); //头挂载元素的索引
let lastAttachedItem = $ref(0); //尾挂载元素的索引+1,即不可见的第一个元素的索引,主要用于切割出visibleData

let lastScrollTop = $ref(0); //上一次滚动到的位置
let cachedTranslateY = $ref<number[]>([]); //缓存的列表元素的滚动位置
let cachedHeight = $ref<number[]>([]); //缓存的列表元素的高度
let revising = $ref(false); //是否正在修正滚动位置

const scrollerRef = $ref<HTMLElement>(); //滚动容器的ref
const itemsRef = $ref<ItemRef[]>([]); //列表元素的ref
onMounted(() => {
  //可见元素数量 = ul的高度/单个列表元素的估算高度
  VISIBLE_COUNT = Math.ceil(scrollerRef!.offsetHeight / ESTIMATED_HEIGHT);
  //初始挂载的时候,上部没有缓冲区,下部有缓冲区
  //所以最后一个挂载元素的索引+1 = 可见元素数量 + 缓冲区大小
  lastAttachedItem = VISIBLE_COUNT + BUFFER_SIZE;
  fetchData(); //获取数据
  updateVisibleData(); //更新可见数据
});

//从api获取数据,补充到listData中
const fetchData = () => {
  const data = fetchDataApi();
  //给每个item打上序号标记,并补充到listData中
  for (let datum of data) {
    datum.keyIndex = listData.length;
    listData.push(datum);
  }
  updateVisibleData(); //更新可见数据
};
//更新可见数据
const updateVisibleData = () => {
  //头挂载元素的索引(如果为负数就置为0) = 锚点元素的索引 - 缓冲区大小
  firstAttachedItem = Math.max(0, anchorItem.index - BUFFER_SIZE);
  //尾挂载元素的索引加1
  lastAttachedItem = firstAttachedItem + VISIBLE_COUNT + BUFFER_SIZE * 2;
  //如果下标超过了listData的长度,就置为listData的长度
  const end = Math.min(lastAttachedItem, listData.length);
  visibleData = listData.slice(firstAttachedItem, end);
};

//计算每一个列表元素的translateY
//translateY 元素在Y轴的偏移量
const computeItemTranslateY = async () => {
  //nextTick 等待下一次 DOM 更新刷新的工具方法
  await nextTick(); //数据改变后,等待dom刷新后,做后面的事情
  //修正vue diff算法导致item顺序不正确的问题 https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for
  itemsRef.sort((a, b) => {
    // console.log(a, b);
    return a.index - b.index; //按index值进行升序排列
  });
  //找到锚点元素的真实dom
  const anchorDomIndex = itemsRef.findIndex(
    (item) => item.index === anchorItem.index
  );

  const anchorDom = itemsRef[anchorDomIndex];

  const anchorDomHeight = anchorDom.getHeight(); //锚点元素的高度

  cachedTranslateY[anchorItem.index] =
    scrollerRef!.scrollTop - anchorItem.offsetTop; //缓存锚点元素的滚动位置
  cachedHeight[anchorItem.index] = anchorDomHeight; //缓存锚点元素的高度

  //计算锚点后面的item的translateY
  for (let i = anchorDomIndex + 1; i < itemsRef.length; i++) {
    const item = itemsRef[i];
    cachedHeight[item.index] = item.getHeight();
    cachedTranslateY[item.index] =
      cachedTranslateY[item.index - 1] + cachedHeight[item.index - 1];
  }
  //计算锚点前面的item的translateY
  for (let i = anchorDomIndex - 1; i >= 0; i--) {
    const item = itemsRef[i];
    cachedHeight[item.index] = item.getHeight();
    cachedTranslateY[item.index] =
      cachedTranslateY[item.index + 1] - cachedHeight[item.index];
  }
  //修正拖动过快导致的滚动到顶端有空余的偏差
  if (cachedTranslateY[0] > 0) {
    // console.log("修正冗余");
    revising = true;
    const delta = cachedTranslateY[0];
    const last = Math.min(lastAttachedItem, listData.length);
    for (let i = 0; i < last; i++) {
      cachedTranslateY[i] = cachedTranslateY[i] - delta;
    }
    scrollerRef!.scrollTop = cachedTranslateY[anchorItem.index - 1]
      ? cachedTranslateY[anchorItem.index - 1] + anchorItem.offsetTop
      : anchorItem.offsetTop;
    lastScrollTop = scrollerRef!.scrollTop;
    revising = false;
  }
};

//item的尺寸发生变化时,重新计算translateY
// noinspection JSUnusedLocalSymbols
const handleSizeChange = (index: number) => {
  // console.log("尺寸变化" + index);
  computeItemTranslateY();
};

//跑道(滚动容器)的高度(估算值)
const scrollRunwayEnd = $computed(() => {
  const maxTranslateY = cachedHeight.reduce(
    (total, curVal) => {
      //如果元素未渲染或者被略过渲染时,用估算高度代替
      return total + curVal || ESTIMATED_HEIGHT;
    },
    0 //初始值
  );
  //当前平均高度 = 总高度/元素数量
  const currentAverageH = maxTranslateY / cachedHeight.length;
  if (isNaN(currentAverageH)) {
    return listData.length * ESTIMATED_HEIGHT;
  } else {
    return (
      maxTranslateY + (listData.length - cachedHeight.length) * currentAverageH
    );
  }
});

const handleScroll = () => {
  if (revising) return;
  const delta = scrollerRef!.scrollTop - lastScrollTop;
  if (delta === 0) {
    console.log("滚动距离为0");
    return;
  }
  lastScrollTop = scrollerRef!.scrollTop;
  updateAnchorItem(delta);
  updateVisibleData();
  updatePlaceholder(delta > 0);
  handleLoadMore();
};

//更新锚点元素
const updateAnchorItem = (delta: number) => {
  const lastIndex = anchorItem.index;
  const lastOffsetTop = anchorItem.offsetTop;
  delta += lastOffsetTop;
  let index = lastIndex;
  if (delta > 0) {
    //向下滚动
    while (
      index < listData.length &&
      delta > (cachedHeight[index] || ESTIMATED_HEIGHT)
    ) {
      if (!cachedHeight[index]) {
        cachedHeight[index] = ESTIMATED_HEIGHT;
      }
      delta -= cachedHeight[index];
      index++;
    }
    if (index >= listData.length) {
      anchorItem = { index: listData.length - 1, offsetTop: 0 };
    } else {
      anchorItem = { index, offsetTop: delta };
    }
  } else {
    while (delta < 0) {
      if (!cachedHeight[index - 1]) {
        cachedHeight[index - 1] = ESTIMATED_HEIGHT;
      }
      delta += cachedHeight[index - 1];
      index--;
    }
    if (index < 0) {
      anchorItem = { index: 0, offsetTop: 0 };
    } else {
      anchorItem = { index, offsetTop: delta };
    }
  }
  //修正拖动过快导致的滚动到顶端滚动条不足的偏差
  if (cachedTranslateY[firstAttachedItem] <= -1) {
    // console.log("修正不足");
    revising = true;
    const actualScrollY = cachedHeight
      .slice(0, Math.max(0, anchorItem.index))
      .reduce((total, curVal) => total + curVal, 0);
    scrollerRef!.scrollTop = actualScrollY + anchorItem.offsetTop;
    lastScrollTop = scrollerRef!.scrollTop;
    if (scrollerRef!.scrollTop === 0) {
      anchorItem = { index: 0, offsetTop: 0 };
    }
    computeItemTranslateY();
    revising = false;
  }
};

const updatePlaceholder = (isPositive: boolean) => {
  if (isPositive) {
    topPlaceholders = 0;
    bottomPlaceholders = Math.min(
      PLACEHOLDER_COUNT,
      Math.abs(listData.length - lastAttachedItem)
    );
  } else {
    topPlaceholders = Math.min(PLACEHOLDER_COUNT, firstAttachedItem);
    bottomPlaceholders = 0;
  }
};

const handleLoadMore = () => {
  const scrollEnd =
    scrollerRef!.scrollTop + scrollerRef!.offsetHeight + ESTIMATED_HEIGHT;
  if (
    scrollEnd >= scrollRunwayEnd ||
    anchorItem.index === listData.length - 1
  ) {
    fetchData();
  }
};

//下拉占位符的Y轴偏移量
const pullDownPlaceholderTranslateY = $computed(
  () => (index: number) =>
    cachedTranslateY[firstAttachedItem] - ESTIMATED_HEIGHT * (index + 1)
);
//item的Y轴偏移量
const itemTranslateY = $computed(
  () => (index: number) => cachedTranslateY[index] || index * ESTIMATED_HEIGHT
);

//上拉占位符的Y轴偏移量
const pullUpPlaceholderTranslateY = $computed(
  () => (index: number) =>
    cachedTranslateY[lastAttachedItem - 1] +
    cachedHeight[lastAttachedItem - 1] +
    ESTIMATED_HEIGHT * (index + 1)
);

// const computePullDownPlaceholderTranslateY = () => {};
</script>
<template>
  <ul ref="scrollerRef" class="height-dynamic" @scroll="handleScroll">
    <!-- 负责撑开ul的高度   -->
    <li
      class="height-dynamic__scroll-runway"
      :style="`transform: translate(0, ${scrollRunwayEnd}px)`"
    ></li>
    <!--  下拉占位符  -->
    <!--suppress JSUnusedLocalSymbols -->
    <Placeholder
      class="height-dynamic__placeholder"
      v-for="(item, index) in topPlaceholders"
      :key="-index - 1"
      :style="`transform: translate(0,${pullDownPlaceholderTranslateY(
        index
      )}px)`"
    />
    <!--  列表元素  -->
    <Item
      class="height-dynamic__item"
      v-for="item in visibleData"
      ref="itemsRef"
      :data="item"
      :is-fixed-height="false"
      :key="item.username + item.phone"
      :index="item.keyIndex"
      :style="`transform: translate(0,${itemTranslateY(item.keyIndex)}px)`"
      @sizeChange="handleSizeChange"
    />
    <!--  上拉占位符  -->
    <!--suppress JSUnusedLocalSymbols -->
    <Placeholder
      class="height-dynamic__placeholder"
      v-for="(item, index) in bottomPlaceholders"
      :key="index + 1"
      :style="`transform: translate(0,${pullUpPlaceholderTranslateY(index)}px)`"
    />
  </ul>
</template>
<style lang="scss" scoped>
.height-dynamic {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
  position: absolute;
  contain: layout;
  will-change: transform;
  background-color: #eee;

  &__item,
  &__placeholder {
    position: absolute;
    contain: layout;
    will-change: transform;
  }

  &__scroll-runway {
    position: absolute;
    width: 1px;
    height: 1px;
    transition: transform 0.2s;
  }
}
</style>
