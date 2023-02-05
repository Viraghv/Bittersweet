<template>
	<Searchbar :search-term-prop="searchTerm"/>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="recipes-found-header">
			<h1 class="recipes-found-title">Recipes found</h1>
			<div class="sort-filter-container">
				<label class="sort-label" for="sort-input">Sort by:</label>
				<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypesAll" :searchable="false" :can-clear="false" :can-deselect="false"/>

				<button class="filter-btn" id="filter-btn" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="0, 20" data-bs-auto-close="outside">
					<img class="filter-icon" src="@/assets/icons/filter_grey.png" alt="filter-icon">
					Filters
				</button>
				<div class="dropdown-menu dropdown-menu-end filter-dropdown" aria-labelledby="filter-btn">
					<div class="clear-filters-container">
						<button class="clear-filters-btn" type="button" @click="clearFilters">Clear</button>
					</div>
					<div class="line-one">
						<div class="categories-container">
							<div class="categories-header header">
								<span class="categories-text text">Categories</span>
							</div>
							<div class="categories-input-container">
								<Multiselect
									class="categories-input"
									v-model="filters.categories"
									:options="categoryOptions"
									mode="tags"
									:close-on-select="false"
									:searchable="true"
									ref="categoriesInput"
								/>
							</div>
						</div>
						<div class="diets-container">
							<div class="diets-header header">
								<span class="diets-text text">Diets</span>
							</div>
							<div class="diets-input-container">
								<Multiselect
									class="diets-input"
									v-model="filters.diets"
									:options="dietOptions"
									mode="tags"
									:close-on-select="false"
									:searchable="true"
									ref="dietsInput"
								/>
							</div>
						</div>
					</div>
					<div class="line-two">
						<div class="allergens-container">
							<div class="allergens-header header">
								<span class="allergens-text text">Exclude allergens</span>
							</div>
							<div class="allergens-input-container">
								<Multiselect
									class="allergens-input"
									name="allergens"
									v-model="filters.excludeAllergens"
									:options="allergenOptions"
									mode="tags"
									:close-on-select="false"
									:searchable="true"
									ref="allergensInput"
								/>
							</div>
						</div>
						<div class="portions-container">
							<div class="portions-header header">
								<span class="portions-text text">Portions</span>
							</div>
							<div class="portions-inputs-container">
								<div class="portions-inputs">
									<input class="portions-input" type="number" v-model="filters.portions">
									<label for="portions-input">portion(s)</label>
								</div>
							</div>
						</div>
					</div>
					<div class="line-three">
						<div class="time-container">
							<div class="time-header header">
								<span class="time-text text">Time</span>
							</div>
							<div class="time-from-container">
								<label for="time-from-inputs">From:</label>
								<div class="time-from-inputs">
									<input class="time-from-hour-input" type="number" placeholder="HH" v-model="filters.timeFrom.hour" @input="restrictFromHours">
									<span>:</span>
									<input class="time-from-min-input" type="number" placeholder="MM" v-model="filters.timeFrom.minute" @input="restrictFromMins">
								</div>
							</div>
							<div class="time-to-container">
								<label for="time-to-inputs">To:</label>
								<div class="time-to-inputs">
									<input class="time-to-hour-input" type="number" placeholder="HH" v-model="filters.timeTo.hour" @input="restrictToHours">
									<span>:</span>
									<input class="time-to-min-input" type="number" placeholder="MM" v-model="filters.timeTo.minute" @input="restrictToMins">
								</div>
							</div>
						</div>
						<div class="calories-container">
							<div class="calories-header header">
								<span class="calories-text text">Calories</span>
							</div>
							<div class="calories-from-container">
								<label for="calories-from-inputs">From:</label>
								<div class="calories-from-inputs">
									<input class="calories-from-input" type="number" v-model="filters.caloriesFrom">
									<span class="kcal-text">kcal</span>
								</div>
							</div>
							<div class="calories-to-container">
								<label for="calories-to-inputs">To:</label>
								<div class="calories-to-inputs">
									<input class="calories-to-input" type="number" v-model="filters.caloriesTo">
									<span class="kcal-text">kcal</span>
								</div>
							</div>
						</div>
					</div>
					<div class="line-four">
						<div class="difficulty-container">
							<div class="difficulty-header header">
								<span class="difficulty-text text">Difficulty</span>
							</div>
							<div class="difficulty-inputs">
								<div class="difficulty-input" v-for="(difficulty, index) in difficultyOptions" :key="index" >
									<input class="checkbox-input" type="checkbox" :id="'check-difficulty' + index" :value="difficulty.id" v-model="filters.difficulties">
									<label :for="'check-difficulty' + index">{{difficulty.name.charAt(0).toUpperCase() + difficulty.name.slice(1)}}</label>
								</div>
							</div>
						</div>
						<div class="cost-container">
							<div class="cost-header header">
								<span class="cost-text text">Cost</span>
							</div>
							<div class="cost-inputs">
								<div class="cost-input" v-for="(cost, index) in costOptions" :key="index" >
									<input class="checkbox-input" type="checkbox" :id="'check-cost' + index" :value="cost.id" v-model="filters.costs">
									<label :for="'check-cost' + index">{{cost.name.charAt(0).toUpperCase() + cost.name.slice(1)}}</label>
								</div>
							</div>
						</div>
					</div>
					<div class="apply-filters-btn-container">
						<button class="apply-filters-btn" type="submit" @click="getSearchResults(1, true, true)">Apply filters</button>
					</div>
				</div>
			</div>
		</div>
		<div class="no-recipes-container">
			<span class="no-recipes-found" v-if="!searchResults?.recipeCount">No recipes found.</span>

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
				categories: [],
				diets: [],
				caloriesFrom: null,
				caloriesTo: null,
				portions: null
			},

			allergenOptions: {},
			difficultyOptions: [],
			costOptions: [],
			categoryOptions: {},
			dietOptions: {},
		}
	},

	methods: {
		async getSearchResults(page, closeFilters=false, goToFirstPage=false){
			try {
				window.scroll(0,0);

				const expirationDate = new Date(Date.now() + 24*60*60*1000);
				this.$cookies.set("searchFilters", this.filters, expirationDate);

				let convertedFilters = JSON.parse(JSON.stringify(this.filters));

				convertedFilters.timeFrom.hour = !([null, ""].includes(convertedFilters.timeFrom.hour)) ? Number(convertedFilters.timeFrom.hour) : null;
				convertedFilters.timeFrom.minute = !([null, ""].includes(convertedFilters.timeFrom.minute)) ? Number(convertedFilters.timeFrom.minute) : null;
				convertedFilters.timeTo.hour = !([null, ""].includes(convertedFilters.timeTo.hour)) ? Number(convertedFilters.timeTo.hour) : null;
				convertedFilters.timeTo.minute = !([null, ""].includes(convertedFilters.timeTo.minute)) ? Number(convertedFilters.timeTo.minute) : null;

				for (let i = 0; i < convertedFilters.excludeAllergens.length; i++) {
					convertedFilters.excludeAllergens[i] = Number(convertedFilters.excludeAllergens[i]);
				}

				for (let i = 0; i < convertedFilters.categories.length; i++) {
					convertedFilters.categories[i] = Number(convertedFilters.categories[i]);
				}

				for (let i = 0; i < convertedFilters.diets.length; i++) {
					convertedFilters.diets[i] = Number(convertedFilters.diets[i]);
				}

				for (let i = 0; i < convertedFilters.difficulties.length; i++) {
					convertedFilters.difficulties[i] = Number(convertedFilters.difficulties[i]);
				}

				for (let i = 0; i < convertedFilters.costs.length; i++) {
					convertedFilters.costs[i] = Number(convertedFilters.costs[i]);
				}

				convertedFilters.caloriesFrom = !([null, ""].includes(convertedFilters.caloriesFrom)) ? Number(convertedFilters.caloriesFrom) : null;
				convertedFilters.caloriesTo = !([null, ""].includes(convertedFilters.caloriesTo)) ? Number(convertedFilters.caloriesTo) : null;
				convertedFilters.portions = !([null, ""].includes(convertedFilters.portions)) ? Number(convertedFilters.portions) : null;


				const response = await this.axios.post(`/recipe/getFilteredCards/${this.selectedSortType}/${page}`, {
					search: this.searchTerm,
					filters: convertedFilters,
				});

				this.searchResults = response.data;

				if(closeFilters && document.getElementById("filter-btn").getAttribute("aria-expanded") === true){
					document.getElementById("filter-btn").click();
				}

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


				if(goToFirstPage){
					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === "1"){
							paginateButtons[i].click();
						}
					}
				}
			} catch (error) {
				console.log(error);

			}
		},

		async initAllergens(){
			try {
				const response = await this.axios.get('/recipe/allergens');
				for(const allergen of response.data){
					this.allergenOptions[allergen.id] = allergen.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		async initCategories(){
			try {
				const response = await this.axios.get('/recipe/categories');
				for(const category of response.data){
					this.categoryOptions[category.id] = category.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		async initDiets(){
			try {
				const response = await this.axios.get('/recipe/diets');
				for(const diet of response.data){
					this.dietOptions[diet.id] = diet.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		async initDifficulties(){
			try {
				const response = await this.axios.get('/recipe/difficulties');
				this.difficultyOptions = response.data;
			} catch (err) {
				console.log(err.response.data);
			}
		},

		async initCosts(){
			try {
				const response = await this.axios.get('/recipe/costs');
				this.costOptions = response.data;
			} catch (err) {
				console.log(err.response.data);
			}
		},

		restrictFromHours(){
			if(this.filters.timeFrom.hour > 99){
				this.filters.timeFrom.hour = Math.floor(this.filters.timeFrom.hour / 10) ;
			}
		},

		restrictFromMins(){
			if(this.filters.timeFrom.minute > 59){
				this.filters.timeFrom.minute = Math.floor(this.filters.timeFrom.minute / 10) ;
			}
		},

		restrictToHours(){
			if(this.filters.timeTo.hour > 99){
				this.filters.timeTo.hour = Math.floor(this.filters.timeTo.hour / 10) ;
			}
		},

		restrictToMins(){
			if(this.filters.timeTo.minute > 59){
				this.filters.timeTo.minute = Math.floor(this.filters.timeTo.minute / 10) ;
			}
		},

		setFilters(){
			if(this.$cookies.get("searchFilters") !== null){
				this.filters = this.$cookies.get("searchFilters");
			} else {
				this.clearFilters();
			}
		},

		clearFilters(){
			this.filters = {
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
			};
		},
	},

	watch: {
		'searchTerm'(){
			this.getSearchResults(1, true, true);
		},

		'selectedSortType'(){
			this.getSearchResults(1, true, true);
		},
	},

	async mounted() {
		await this.initAllergens();
		await this.initCategories();
		await this.initDiets()
		await this.initDifficulties();
		await this.initCosts();

		this.setFilters();
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

				.filter-dropdown {
					background-color: var(--lightgreen);
					padding: 30px;
					border-radius: 15px;
					border-color: transparent;
					box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
					-webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
					-moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
					max-height: 55vh;
					overflow-y: scroll;

					.clear-filters-container {
						display: flex;
						justify-content: right;
						margin-bottom: 20px;

						.clear-filters-btn {
							background-color: var(--yellow);
							border: 1px solid var(--lightgrey);
							border-radius: 10px;
							padding: 3px 20px;

							&:hover {
								opacity: 0.8;
							}
						}
					}

					.line-one, .line-two, .line-three, .line-four {
						display: flex;
						gap: 45px;
						justify-content: center;

						.header {
							background-color: var(--darkgreen);
							padding: 5px 15px;
							width: 250px;
							border: 1px solid var(--lightgrey);

							.text {
								font-size: 1.2rem;
							}
						}

						.time-container, .allergens-container, .difficulty-container, .cost-container, .calories-container,
						.portions-container, .categories-container, .diets-container {
							display: flex;
							flex-direction: column;
							align-items: center;
							width: 250px;

							.time-from-container, .time-to-container, .allergens-input-container, .difficulty-inputs,
							.cost-inputs, .calories-from-container, .calories-to-container, .portions-inputs-container,
							.categories-input-container, .diets-input-container{
								width: 210px;
								margin-top: 15px;

								.time-from-inputs, .time-to-inputs, .calories-from-inputs, .calories-to-inputs, .portions-inputs {
									display: flex;
									align-items: center;

								}

								.portions-inputs {
									margin-top: 5px;

									.portions-input {
										border-radius: 10px;
										border: 1px solid var(--lightgrey);
										padding: 3px 5px;
										width: 70px;
										text-align: center;
										margin-right: 10px;

										&:focus {
											outline: var(--darkgreen) solid 3px;
										}

										&::-webkit-outer-spin-button,
										&::-webkit-inner-spin-button {
											-webkit-appearance: none;
											margin: 0;
										}
									}
								}

								.time-from-hour-input, .time-to-hour-input {
									margin-right: 10px;
								}

								.time-from-min-input, .time-to-min-input{
									margin-left: 10px;
								}

								.difficulty-input, .cost-input {
									display: flex;
									align-items: center;
									margin-top: 5px;

									.checkbox-input {
										width: 15px;
										height: 15px;
										accent-color: var(--yellow);
										margin-right: 10px;

										&:hover {
											cursor: pointer;
										}
									}
								}

								.calories-from-input, .calories-to-input {
									width: 100px;
									margin-right: 10px;
									text-align: center;

									&::-webkit-outer-spin-button,
									&::-webkit-inner-spin-button {
										-webkit-appearance: none;
										margin: 0;
									}
								}
							}
						}
					}

					.line-two, .line-three, .line-four {
						margin-top: 30px;
					}

					.apply-filters-btn-container {
						display: flex;
						justify-content: center;
						margin-top: 40px;

						.apply-filters-btn {
							background-color: var(--yellow);
							border: 1px solid var(--lightgrey);
							border-radius: 10px;
							padding: 5px 20px;

							&:hover {
								opacity: 0.8;
							}
						}
					}
				}
			}
		}

		.no-recipes-container {
			display: flex;
			justify-content: center;
			color: var(--mediumgrey);
			margin-top: 30px;
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

	.time-from-hour-input, .time-from-min-input, .time-to-hour-input, .time-to-min-input,
	.calories-from-input, .calories-to-input {
		border-radius: 10px;
		border: 1px solid var(--lightgrey);
		padding: 3px 10px;
		width: 70px;
		text-align: center;

		&:focus {
			outline: var(--darkgreen) solid 3px;
		}

		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}

	@media screen and (max-width: 883px){

		.recipes-found-header {
			display: flex;
			flex-direction: column;

			.sort-filter-container {
				justify-content: left !important;
			}
		}

		.filter-btn {
			padding-top: 5px !important;
			padding-bottom: 5px !important;
		}

		.filter-dropdown {
			width: 100vw !important;
		}
	}

	@media screen and (max-width: 608px){
		.line-one, .line-two, .line-three, .line-four {
			flex-direction: column;
		}

		.sort-filter-container {
			flex-direction: column;
			align-items: normal !important;
			justify-content: left !important;

			.sort-input {
				margin: 10px 0 0 0 !important;
			}

			.filter-btn {
				margin-left: 0 !important;
				margin-top: 10px !important;
				width: 40% !important;
				padding-top: 5px !important;
				padding-bottom: 5px !important;
			}
		}
	}
</style>