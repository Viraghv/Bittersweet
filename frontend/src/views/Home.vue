<template>
	<Searchbar/>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<h1 class="home-title">New and Hot!</h1>
		<div class="recipe_cards">
			<RecipeCardSearch v-for="(recipe, index) in recipes" :key="index" :index="index" :title="recipe.title" :difficulty="recipe.difficulty" :time="recipe.time" :type="recipe.type" :image="recipe.image"/>
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
					time: "",
					type: "breakfast",
					image: null,
				},
				{
					title: "Cheese garlic sandwich",
					difficulty: "",
					time: "20min",
					type: "",
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
		margin: 60px auto 140px auto;

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