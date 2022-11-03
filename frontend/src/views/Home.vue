<template>
	<Searchbar/>
	<div class="content">
		<h1 class="home-title">New and Hot!</h1>
	</div>
</template>

<script>
import Searchbar from "@/components/Searchbar.vue";
export default {
	name: "Home",
	components: {Searchbar},
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px 10% 5% 10%;

		.home-title {
			font-family: Gotu,serif;
			font-size: 2rem;
		}

	}
</style>