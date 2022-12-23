<script lang="ts">
export default {
  name: "Navs",
};
</script>
<script lang="ts" setup></script>
<template>
  <div class="navs">
    <router-link to="/height-fixed">高度固定</router-link>
    <router-link to="/height-dynamic">高度不固定</router-link>
    <router-link to="/chat-box">聊天容器</router-link>
    <router-link to="/chat-box2">聊天容器使用</router-link>
  </div>
</template>
<style lang="scss" scoped>
.navs {
  padding: 20px;

  a {
    display: block;
    margin-bottom: 10px;
    font-size: 20px;
  }
}
</style>
