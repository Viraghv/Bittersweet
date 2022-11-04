<template>
	<Searchbar/>
	<div class="content">
		<h1 class="home-title">New and Hot!</h1>
		<RecipeCardSearch/>
	</div>
</template>

<script>
import Searchbar from "@/components/Searchbar.vue";
import RecipeCardSearch from "@/components/RecipeCardSearch.vue";
export default {
	name: "Home",
	components: {RecipeCardSearch, Searchbar},
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px 20% 60px 20%;

		.home-title {
			font-family: Gotu,serif;
			font-size: 2rem;
			margin-bottom: 30px;
		}

	}
</style>