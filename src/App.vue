<template>
  <div id="app">
    <router-view/>
  </div>
</template>


<script>
	export default {
		name:'app',
		created() {
			if (localStorage.getItem("store")) {
			      this.$store.replaceState(
			        Object.assign(
			          {},
			          this.$store.state,
			          JSON.parse(localStorage.getItem("store"))
			        )
			      );
			    }
			    //在页面刷新时将vuex里的信息保存到localStorage里
			    window.addEventListener("beforeunload", () => {
			      localStorage.setItem("store", JSON.stringify(this.$store.state));
			    });
		},
	}
</script>

<style lang="less">
	body{
		margin: 0 auto;
	}
</style>


