<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "Item",
};
</script>
<script lang="ts" setup>
import type { IData } from "@/components/Data";
import faker from "minifaker";
import { onMounted, onBeforeUnmount } from "vue";

const {
  index,
  data,
  isFixedHeight = true,
} = defineProps<{
  index: number;
  data: IData;
  isFixedHeight: boolean;
}>();
let defferImgSrc = $ref("");

//created
if (data.img.isDeffer) {
  //是否延时加载
  defferImgSrc = data.img.src;
} else {
  setTimeout(() => {
    defferImgSrc = data.img.src;
  }, faker.number({ min: 300, max: 5000 }));
}
const itemRef = $ref<HTMLElement>();
const emit = defineEmits(["sizeChange"]);
onMounted(() => {
  console.log("onMounted");
  if (isFixedHeight) return;
  //ResizeObserver：是一项新的功能，监听元素的内容矩形大小的变更，并通知做出相应的反应。和document.onresize的功能很相似
  //如果出现兼容性问题,就学element-ui的方式,用第三方库resize-observer-polyfill
  // const ro = new ResizeObserver((entries, observer) => {
  const ro = new ResizeObserver(() => {
    //高度发生变化时,将'sizeChange'事件传递给父组件
    emit("sizeChange", index);
  });
  itemRef && ro.observe(itemRef);
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount");
    ro.disconnect();
  });
});
</script>
<template>
  <li class="item" ref="itemRef">
    <div class="item__wrapper" :class="{ 'is-fixed': isFixedHeight }">
      <div class="item__info">
        <img class="item__avatar" :src="data.avatar" alt="" />
        <p class="item__name">{{ index }}.{{ data.name }}</p>
        <p class="item_date">{{ data.dob }}</p>
      </div>
      <template v-if="isFixedHeight">
        <p class="item__text">E-Mail:{{ data.email }}</p>
        <p class="item__text">Phone: {{ data.phone }}</p>
        <p class="item__text">City: {{ data.address.city }}</p>
        <p class="item__text">Street: {{ data.address.street }}</p>
      </template>
      <template v-else>
        <p class="item__paragraph">{{ data.paragraph }}</p>
        <img
          class="item__img"
          :style="{ width: data.img.width }"
          :src="defferImgSrc"
          alt=""
        />
        <img
          class="item__img"
          :style="{ width: data.img.width }"
          :src="data.img.src"
          alt=""
        />
      </template>
    </div>
  </li>
</template>
<style lang="scss" scoped>
.item {
  padding: 11px 20px;
  width: 100%;
}

.item {
  &__wrapper {
    padding: 0 20px 20px;
    background-color: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 5px;
  }

  &__is-fixed {
    &__name,
    &__date,
    &__text,
    &__paragraph {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  &__info {
    padding: 20px 0 20px 60px;
    position: relative;
  }

  &__avatar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto 0;
    width: 50px;
    height: 50px;
    background-color: #eaeaea;
    border-radius: 100%;
    overflow: hidden;
  }

  &__name,
  &__date,
  &__text,
  &__paragraph {
    margin-bottom: 4px;
    max-width: 100%;
    font-weight: bold;
    font-size: 12px;
  }

  &__text,
  &__paragraph {
    font-weight: normal;
  }

  &__img {
    margin-top: 10px;
    max-width: 100% !important;
    border-radius: 5px;
  }
}
</style>
