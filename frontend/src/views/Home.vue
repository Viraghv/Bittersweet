<!-- Home page -->

<template>
	<Searchbar @search="navigateToSearchPage"/>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<h1 class="home-title">New and Hot!</h1>
		<div class="recipe_cards">
			<RecipeCardSearch v-for="(recipe, index) in recipes"
							  :key="index" :id="recipe.id"
							  :index="index"
							  :title="recipe.name"
							  :difficulty="recipe.difficulty"
							  :hour="recipe.hour"
							  :minute="recipe.minute"
							  :type="recipe.type"
							  :image-url="recipe.photo"
			                  :image="recipe.photoImage"
			                  :image-ext="recipe.photoExt"/>
		</div>
		<div class="pagination-container">
			<Pagination :total-items="allRecipesCount" :items-per-page="12" @change-page="initRecipes" v-show="allRecipesCount"/>
		</div>
	</div>
</template>

<script>
import Searchbar from "@/components/Searchbar.vue";
import RecipeCardSearch from "@/components/RecipeCardSearch.vue";
import Pagination from "@/components/Pagination.vue";
import SearchRecipe from "@/views/SearchRecipe.vue";

export default {
	name: "Home",
	components: {
		RecipeCardSearch,
		Searchbar,
		Pagination,
	},
	data(){
		return {
			recipes: [],
			allRecipesCount: 0,
		}
	},

	methods: {
		/**
		 * Initializes recipes of page (the newest recipes in descending order).
		 * @param page page to get
		 */
		async initRecipes(page){
			window.scroll(0,0);

			try {
				const response = await this.axios.get(`/recipe/getAllCardsWithPagination/${page}`)
				this.recipes = response.data;

				// get recipe images
				for (let i = 0; i < this.recipes.length; i++) {
					if(this.recipes[i].photo && this.recipes[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.recipes[i].photo}`);
							this.recipes[i].photoImage = response.data;
							this.recipes[i].photoExt = this.recipes[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes number of all recipes.
		 */
		async initAllRecipesCount(){
			try {
				const response = await this.axios.get(`/recipe/allRecipeCount`);
				this.allRecipesCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Navigates to search page with the entered search term in the URL params.
		 * @param searchTerm
		 */
		navigateToSearchPage(searchTerm){
			window.scrollTo(0, 0);

			this.$router.push({
				name: 'SearchRecipe',
				params: {
					filters: JSON.stringify({
						searchTerm: searchTerm,
						timeFrom: {
							hour: null,
							minute: null
						},
						timeTo: {
							hour: null,
							minute: null
						},
						excludeAllergens: [],
						difficulties: [],
						costs: [],
						categories: [],
						diets: [],
						caloriesFrom: null,
						caloriesTo: null,
						portions: null
					}),
				}
			});
		},
	},
	mounted() {
		this.initAllRecipesCount();
		this.initRecipes(1);
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

		.pagination-container {
			display: flex;
			justify-content: center;
			margin-top: 30px;
		}
	}

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;
		}
	}

	@media screen and (max-width: 450px){
		.recipe_cards {
			grid-template-columns: repeat(auto-fill, 350px) !important;
		}
	}
</style>