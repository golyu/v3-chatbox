<script lang="ts">
export default {
  name: "HeightFixed", //固定高度
};
</script>
<script lang="ts" setup>
import { IData } from "@/components/Data";
import { fetchDataApi } from "@/components/helpers";
import Item from "@/components/Item.vue";
import Placeholder from "@/components/Placeholder.vue";
import { onMounted } from "vue";

const PLACEHOLDER_COUNT = 5; //占位数量
const BUFFER_SIZE = 3; //缓冲区大小,最多上下各缓冲3个,如果滚动到头部,就只有尾部3个,如果滚动到尾部,就只有头部3个
const FIXED_HEIGHT = 180; //单个元素固定高度
let VISIBLE_COUNT = BUFFER_SIZE * 2; //可见数量,初始话的时候,会去重新计算这个值
const scrollerRef = $ref<HTMLElement | null>(null); //滚动容器
const scrollRunwayRef = $ref<HTMLElement | null>(null);
let listData = $ref<IData[]>([]); //所有数据
let visibleData = $ref<IData[]>([]); //可见数据
//todo 感觉占位符没啥用,暂时先不管
let topPlaceholders = $ref(0); //下拉占位符的数量
let bottomPlaceholders = $ref(0); //上拉占位符的数量

let firstAttachedItem = $ref(0); //头挂载元素的索引
let lastAttachedItem = $ref(0); //尾挂载元素的索引的后一位,便于使用slice
let scrollRunwayEnd = $ref(0); //跑道(滚动容器)的高度
let lastScrollTop = $ref(0); //记录上一次滚动条的位置(scrollTop)
//锚点元素(「滚动容器」的「可视区域」内的第一个元素)
let anchorItem = $ref<{
  index: number; //锚点元素在所有数据中的索引
  offset: number; //锚点元素的偏移量,也就是锚点元素不可见部分的高度
}>({
  offset: 0,
  index: 0,
});

onMounted(() => {
  //可见数量 = 整个ul的高度 / 固定的高度
  //offsetHeight:元素的像素高度 包含元素的垂直内边距和边框,水平滚动条的高度,且是一个整数
  VISIBLE_COUNT = Math.ceil(scrollerRef!.offsetHeight / FIXED_HEIGHT);
  //首次加载页面时 尾挂载元素的索引后一位 = 可见数量 + 缓冲区大小
  lastAttachedItem = VISIBLE_COUNT + BUFFER_SIZE;
  fetchData(); //模拟从云端获取数据
  //例如,可见区域为5,缓冲区为3,则头挂载元素如果为2,那么尾挂载元素就是12((5+3*2)+2-1)
  visibleData = listData.slice(firstAttachedItem, lastAttachedItem); //可见数据 = 数据源.slice(第一个元素,最后一个元素)
});

//模拟从云端获取数据
const fetchData = () => {
  listData.push(...calItemScrollY(fetchDataApi()));
  scrollRunwayEnd = listData.length * FIXED_HEIGHT;
  //跑道的尽头 = 数据量 * 单个元素的高度
};

//计算每一个item的translateY的高度
//translateY(ty)相当于translate(0, ty),translate坐标定义元素在每个方向上的移动量
const calItemScrollY = (list: IData[]) => {
  let latestIndex = listData.length; //用于向后拼接数据,最新的索引
  for (let i = 0; i < list.length; i++, latestIndex++) {
    const item = list[i];
    //如果item是第0元素,那么它的translateY就是0*FIXED_HEIGHT,如果是第1个元素,那么它的translateY就是1*FIXED_HEIGHT
    item.translateY = latestIndex * FIXED_HEIGHT;
    item.index = latestIndex;
    Object.freeze(item); //冻结一个对象。 一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性
  }
  return list;
};

//处理滚动事件
const handleScroll = () => {
  //scrollTop: 获取或设置元素的垂直滚动的像素数  元素的值是从元素顶部到其最顶部可见内容scrollTop的距离的度量。当一个元素的内容不产生垂直滚动条时，那么它的值为。scrollTop:0
  const delta = scrollerRef!.scrollTop - lastScrollTop; //滚动的距离 = 当前垂直滚动的像素数 - 上一次滚动条的位置
  if (delta === 0) return; //如果滚动的距离为0,不用管后面的
  lastScrollTop = scrollerRef!.scrollTop; //更新滚动条的位置
  anchorItem.offset += delta; //锚点元素的Y轴偏移量  += 滚动的距离
  const isPositive = delta > 0; //偏移量是正数代表向下滚动
  //判断滚动方向
  //根据滚动方向和偏移量，按顺序更新「锚点元素」→「头挂载元素」→「尾挂载元素」→「可视元素」
  if (isPositive) {
    //向下滚动
    //如果 锚点的偏移量 >= 固定高度,就说明锚点元素已经完全不可见了,需要更新锚点元素
    if (anchorItem.offset >= FIXED_HEIGHT) {
      updateAnchorItem(); //更新锚点
    }
    //如果 锚点的索引 - 头挂载元素的索引 >= 缓冲区大小
    //就说明头挂载元素已经完全不可见并离开了缓冲区,需要更新头挂载元素
    if (anchorItem.index - firstAttachedItem >= BUFFER_SIZE) {
      //重新计算头挂载元素的索引   取小值
      firstAttachedItem = Math.min(
        listData.length - VISIBLE_COUNT, // 数据源的长度 - 可见数量
        anchorItem.index - BUFFER_SIZE //锚点索引- 缓冲区大小
      ); //如果数据源的长度刚好在可见数量+缓冲区大小之间,那么头挂载元素的索引就是数据源的长度-可见数量
    }
  } else {
    //向上滚动
    //如果 滚动的位置 <= 0  (滚动到了顶部)
    if (scrollerRef!.scrollTop <= 0) {
      anchorItem = { index: 0, offset: 0 }; //锚点 = {索引:0,偏移量:0}
    } else if (anchorItem.offset < 0) {
      //如果 锚点的偏移量 < 0,就说明锚点元素已经完全可见了,需要更新锚点元素
      updateAnchorItem(); //更新锚点
    }
    //如果 锚点的索引 - 头挂载元素的索引 < 缓冲区大小
    if (anchorItem.index - firstAttachedItem < BUFFER_SIZE) {
      firstAttachedItem = Math.max(
        0, //滚动到了最上面 为避免firstAttachedItem变为负数,将头挂载元素的索引置为为0
        anchorItem.index - BUFFER_SIZE //锚点索引- 缓冲区大小
      );
    }
  }
  lastAttachedItem = Math.min(
    firstAttachedItem + VISIBLE_COUNT + BUFFER_SIZE * 2, //头挂载元素的索引 + 可见数量 + 缓冲区大小*2
    listData.length //数据源长度
  );
  visibleData = listData.slice(firstAttachedItem, lastAttachedItem); //可见数据 = 数据源.slice(第一个附加的item,最后一个附加的item)
  updatePlaceholder(isPositive); //更新占位
  handleLoadMore(); //加载更多
};

//更新锚点
const updateAnchorItem = () => {
  const index = Math.floor(scrollerRef!.scrollTop / FIXED_HEIGHT); //锚点的索引 = 向下取整(滚动条的位置 / 固定高度)
  const offset = scrollerRef!.scrollTop - index * FIXED_HEIGHT; //锚点的偏移量  = 滚动条的位置 - 锚点的索引 * 固定高度
  anchorItem = { index, offset }; //更新锚点
};

//更新占位
//isPositive:滚动方向
//todo 占位不使用好像也没啥问题,先不使用
const updatePlaceholder = (isPositive: boolean) => {
  // if (isPositive) {
  //   //向下滚动
  //   topPlaceholders = 0;
  //   bottomPlaceholders = Math.min(
  //     PLACEHOLDER_COUNT,
  //     listData.length - lastAttachedItem
  //   );
  // } else {
  //   //向上滚动
  //   topPlaceholders = Math.min(PLACEHOLDER_COUNT, firstAttachedItem);
  //   bottomPlaceholders = 0;
  // }
};

//加载更多
const handleLoadMore = () => {
  const scrollEnd = scrollerRef!.scrollTop + scrollerRef!.offsetHeight;
  if (scrollEnd >= scrollRunwayEnd) {
    fetchData(); //如果 滚动条的位置 + 滚动条的高度 >= 滚动条的跑道的高度 代表滚动到了底部
  }
};
</script>
<template>
  <ul ref="scrollerRef" class="height-fixed" @scroll="handleScroll">
    <!--  负责撑开 ul的高度  -->
    <li
      class="height-fixed__scroll-runway"
      ref="scrollRunwayRef"
      :style="`transform: translate(0,${scrollRunwayEnd}px)`"
    ></li>
    <!--  下拉占位符  -->
    <!--suppress JSUnusedLocalSymbols -->
    <Placeholder
      class="height-fixed__placeholder"
      v-for="(item, index) in topPlaceholders"
      :key="-index - 1"
      :style="`transform: translate(0,${
        FIXED_HEIGHT * (firstAttachedItem - index - 1)
      }px)`"
    />
    <template v-for="item in visibleData" :key="item.username + item.phone">
      <Item
        class="height-fixed__item"
        :data="item"
        :index="item.index"
        :style="`transform: translate(0,${item.translateY}px)`"
      />
    </template>
    <!--  上拉占位符  -->
    <!--suppress JSUnusedLocalSymbols -->
    <Placeholder
      class="height-fixed__placeholder"
      v-for="(item, index) in bottomPlaceholders"
      :key="index + 1"
      :style="`transform: translate(0,${
        FIXED_HEIGHT * (lastAttachedItem + index + 1)
      }px)`"
    />
  </ul>
</template>
<style lang="scss" scoped>
.height-fixed {
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
    contain: layout; //设定了布局限制，也就是说告知 User Agent，此元素内部的样式变化不会引起元素外部的样式变化，反之亦然。
    will-change: transform; // 创建新的渲染层,行为触发之前告诉浏览器需要做动画,
    // 于是乎，浏览器同学把GPU给拉上了，从容应对即将到来的变形
  }

  &__scroll-runway {
    position: absolute;
    width: 1px;
    height: 1px;
    transition: transform 0.2s;
    //过渡: 变换 0.2s
  }
}
</style>
