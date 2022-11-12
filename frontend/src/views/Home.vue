<template>
	<Searchbar/>
	<div class="content">
		<h1 class="home-title">New and Hot!</h1>
		<div class="recipe_cards">
			<RecipeCardSearch v-for="(recipe, index) in recipes" :key="index" :title="recipe.title" :difficulty="recipe.difficulty" :time="recipe.time" :type="recipe.type" :image="recipe.image"/>
		</div>

	</div>
</template>

<script>
import Searchbar from "@/components/Searchbar.vue";
import RecipeCardSearch from "@/components/RecipeCardSearch.vue";
export default {
	name: "Home",
	components: {RecipeCardSearch, Searchbar},
	data(){
		return {
			recipes: [
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: null,
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: null,
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "easy",
					time: "20min",
					type: "breakfast",
					image: "/src/assets/example-recipe-image.jpg",
				},
			]
		}
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px 20% 140px 20%;

		.home-title {
			font-family: Gotu,serif;
			font-size: 2rem;
			margin-bottom: 30px;
		}

		.recipe_cards {
			width: 100%;
			display: grid;
			grid-template-columns: repeat(auto-fill, 400px);
			justify-content: space-evenly;
			grid-gap: 20px 10px;
		}
	}
</style>