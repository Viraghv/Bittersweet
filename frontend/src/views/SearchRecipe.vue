<template>
	<Searchbar :search-term-prop="searchTerm"/>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="recipes-found-header">
			<h1 class="recipes-found-title">Recipes found</h1>
			<div class="sort-filter-container">
				<label class="sort-label" for="sort-input">Sort by:</label>
				<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypesAll" :searchable="false" :can-clear="false" :can-deselect="false"/>
				<button class="filter-btn">
					<img class="filter-icon" src="@/assets/icons/filter_grey.png" alt="filter-icon">
					Filters</button>
			</div>
		</div>
		<div class="recipe_cards">
			<RecipeCardSearch v-for="(recipe, index) in searchResults?.recipes"
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
			<Pagination :total-items="searchResults?.recipeCount || 0" :items-per-page="12" @change-page="getSearchResults" v-show="searchResults?.recipeCount"/>
		</div>
	</div>
</template>

<script>
import Searchbar from "@/components/Searchbar.vue";
import RecipeCardSearch from "@/components/RecipeCardSearch.vue";
import Pagination from "@/components/Pagination.vue";
import Multiselect from '@vueform/multiselect';


export default {
	name: "SearchRecipe",
	components: {
		Pagination,
		RecipeCardSearch,
		Searchbar,
		Multiselect,
	},

	props: {
		searchTerm: String,
	},

	data(){
		return {
			searchResults: null,

			selectedSortType: "uploadedDesc",
			sortTypesAll: {
				nameAsc: "Name &#8593;",
				nameDesc: "Name &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
				timeAsc: "Time &#8593",
				timeDesc: "Time &#8595",
				caloriesAsc: "Calories &#8593",
				caloriesDesc: "Calories &#8595",
				portionsAsc: "Portions &#8593",
				portionsDesc: "Portions &#8595",
				difficultyAsc: "Difficulty &#8593",
				difficultyDesc: "Difficulty &#8595",
				costAsc: "Cost &#8593",
				costDesc: "Cost &#8595",
			},

			filters: {
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
				caloriesFrom: null,
				caloriesTo: null,
				portions: null
			}
		}
	},

	methods: {
		async getSearchResults(page){
			try {
				const response = await this.axios.post(`/recipe/getFilteredCards/${this.selectedSortType}/${page}`, {
					search: this.searchTerm,
					filters: this.filters,
				});

				this.searchResults = response.data;

				for (let i = 0; i < this.searchResults.recipes.length; i++) {
					if(this.searchResults.recipes[i].photo && this.searchResults.recipes[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.searchResults.recipes[i].photo}`);
							this.searchResults.recipes[i].photoImage = response.data;
							this.searchResults.recipes[i].photoExt = this.searchResults.recipes[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}

			} catch (error) {
				console.log(error.response.data);

			}
		},
	},

	watch: {
		'searchTerm'(){
			this.getSearchResults(1);
		},

		'selectedSortType'(){
			this.getSearchResults(1);
		},
	},

	mounted() {
		this.getSearchResults(1);
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px auto 140px auto;
		font-family: Gotu,serif;

		.recipes-found-header {
			display: flex;
			justify-content: space-between;

			.recipes-found-title {
				font-size: 2rem;
				margin-bottom: 30px;
			}

			.sort-filter-container {
				display: flex;
				align-items: center;
				justify-content: right;
				margin-bottom: 40px;

				.sort-input {
					width: 270px;
					margin: 0 0 0 15px;
					border-radius: 10px;
				}

				.filter-btn {
					height: 100%;
					margin-left: 30px;

					background-color: white;
					border: 1px solid var(--lightgrey);
					border-radius: 10px;
					padding-left: 20px;
					padding-right: 20px;

					&:hover {
						opacity: 0.8;
					}

					.filter-icon {
						width: 20px;
						margin-right: 5px;
					}
				}
			}
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

</style>