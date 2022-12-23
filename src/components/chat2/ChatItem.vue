<template>
  <div class="item__wrapper">
    <div class="item__info">
      <img class="item__avatar" :src="data.avatar" alt="" />
      <p class="item__name">{{ data.myKey }}.{{ data.name }}</p>
    </div>

    <div>
      <p class="item_date">{{ data.dob }}</p>
      <p class="item__paragraph">{{ data.paragraph }}</p>
      <img
        class="item__img"
        :style="{ width: data.img.width }"
        :src="defferImgSrc"
        alt=""
      />
      <!--      <img-->
      <!--        class="item__img"-->
      <!--        :style="{ width: data.img.width }"-->
      <!--        :src="data.img.src"-->
      <!--        alt=""-->
      <!--      />-->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { IData } from "@/components/Data";
import faker from "minifaker";

const { index = 0, data } = defineProps<{
  index: number;
  data: IData;
}>();

//created
//是否延时加载
let defferImgSrc = $ref(data.img.src);
if (data.img.isDeffer) {
  defferImgSrc = data.img.src;
} else {
  setTimeout(() => {
    defferImgSrc = data.img.src;
    data.img.isDeffer = true;
  }, faker.number({ min: 300, max: 5000 }));
}
</script>
<script lang="ts">
// noinspection JSUnusedGlobalSymbols
export default {
  name: "ChatItem",
};
</script>
<style lang="scss" scoped>
.item {
  &__wrapper {
    padding: 0 20px 20px;
    background-color: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 5px;
    display: flex;
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
