<template>
  <li ref="liRef" class="height-dynamic__item">
    <slot></slot>
  </li>
</template>
<script lang="ts" setup>
import ResizeObserver from "resize-observer-polyfill";
import { onMounted, onBeforeUnmount } from "vue";

const { index = 0 } = defineProps<{
  index: number;
}>();
const liRef = $ref<HTMLLIElement>();
const emit = defineEmits(["sizeChange"]);
onMounted(() => {
  //ResizeObserver：是一项新的功能，监听元素的内容矩形大小的变更，并通知做出相应的反应。和document.onresize的功能很相似
  //如果出现兼容性问题,就学element-ui的方式,用第三方库resize-observer-polyfill
  // const ro = new ResizeObserver((entries, observer) => {
  const ro = new ResizeObserver((entries) => {
    //高度发生变化时,将'sizeChange'事件传递给父组件
    const entry = entries[0];
    if (entry) {
      const height = entry.contentRect.top * 2 + entry.contentRect.height; //所以li的padding-top和padding-bottom要相等,计算才会正确
      emit("sizeChange", index, height);
    }
  });
  liRef && ro.observe(liRef);
  onBeforeUnmount(() => {
    ro.disconnect();
  });
});
const getHeight = () => {
  return liRef!.getBoundingClientRect().height;
};
defineExpose({
  index,
  getHeight,
});
</script>
<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "ChatLi",
};
</script>
<style lang="scss" scoped>
.height-dynamic__item {
  contain: layout;
  will-change: transform;
  border: 0;
}
</style>
