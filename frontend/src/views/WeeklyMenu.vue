<!-- Weekly menu page with this week and next week views -->

<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="page-buttons-container">
			<button class="this-week-btn" type="button" v-if="nextWeek === '1'">
				<router-link :to="{name: 'WeeklyMenu', params: {nextWeek: 0}}">
					<img class="this-week-icon" src="@/assets/icons/arrow_left_lightgrey.png" alt="arrow-left"/>
					This week
				</router-link>
			</button>
			<button class="next-week-btn" type="button" v-if="nextWeek === '0'">
				<router-link :to="{name: 'WeeklyMenu', params: {nextWeek: 1}}">
					Next week
					<img class="next-week-icon" src="@/assets/icons/arrow_right_lightgrey.png" alt="arrow-right"/>
				</router-link>
			</button>
		</div>
		<div class="title-container">
			<h1 class="decorated">
				<span v-if="nextWeek === '0'">THIS WEEK</span>
				<span v-if="nextWeek === '1'">NEXT WEEK</span>
			</h1>
		</div>
		<div class="action-buttons-container">
			<img class="add-all-to-shopping-list-icon" src="@/assets/icons/plus_lightgrey.png" alt="add-all-icon" title="Add all to shopping list"
				 data-bs-toggle="modal"
				 data-bs-target="#add-all-shopping-list-modal">
			<router-link :to="{name: 'DontRecommendRecipes'}">
				<img class="dont-recommend-recipes-icon" src="@/assets/icons/blocked_lightgrey.png" alt="block" title="View 'Don't recommend' recipes">
			</router-link>
			<img class="generate-week-icon" src="@/assets/icons/sync_lightgrey.png" alt="generate-week-icon" title="Generate week again"
				 data-bs-toggle="modal"
				 data-bs-target="#generate-week-modal"
			/>
		</div>
		<div class="loader-container"  v-if="showInitLoader">
			<Loader class="initLoader"/>
		</div>
		<div class="week-container" v-else>
			<div class="monday-container menu-section">
				<h2 class="section-title">MONDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="tuesday-container menu-section">
				<h2 class="section-title">TUESDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="wednesday-container menu-section">
				<h2 class="section-title">WEDNESDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="thursday-container menu-section">
				<h2 class="section-title">THURSDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="friday-container menu-section">
				<h2 class="section-title">FRIDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="saturday-container menu-section">
				<h2 class="section-title">SATURDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="sunday-container menu-section">
				<h2 class="section-title">SUNDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.breakfast"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.lunch"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.dinner"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
			<div class="desserts-container menu-section">
				<h2 class="section-title">DESSERT RECOMMENDATIONS</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.desserts[0]"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.desserts[1]"
										  @generate="openGenerateOneModal"
										  @generateByMeal="generateOneByMeal"
										  @dontRecommend="openDontRecommend"
										  @add="openAddOneToShoppingListModal"
										  @remove="openWeeklyMenuModal"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="generate-week-modal" ref="generate-week-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="generate-week-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="generate-week">
					<span>Are you sure you want to generate the recommended menu of this week again?</span><br>
					<button class="generate-btn" @click="generateWeek">Generate</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="add-all-shopping-list-modal" ref="add-all-shopping-list-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-all-shopping-list-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-all-shopping-list">
					<span>Add ingredients of every recipe to your shopping list?</span><br>
					<button class="add-btn" @click="addAllRecipesToShoppingList">Add</button>
					<Loader class="addAllToShoppingListLoader" v-if="showAddAllToShoppingListLoader"/>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="generate-one-modal" ref="generate-one-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="generate-one-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="generate-one">
					<span>Are you sure you want to generate a new recommendation instead of this recipe?</span><br>
					<button class="generate-btn" @click="generateOne">Generate</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>

					<div class="generate-one-alert alert alert-danger" v-if="generateErrors.length !== 0">
						<span>{{generateErrors[0]}}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="dont-recommend-modal" ref="dont-recommend-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="dont-recommend-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="dont-recommend">
					<span>Are you sure you want this recipe to not be recommended to you again?</span><br>
					<button class="dont-recommend-btn" @click="dontRecommend">Don't recommend</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="add-one-to-shopping-list-modal" ref="add-one-to-shopping-list-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-one-to-shopping-list-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-one-to-shopping-list">
					<span>Add the ingredients of this recipe to your shopping list?</span><br>
					<button class="add-one-to-shopping-list-btn" @click="addOneToShoppingList">Add</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="remove-meal-modal" ref="remove-meal-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="remove-meal-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="remove-meal">
					<span>Are you sure you want to remove this meal for the week?</span><br>
					<button class="remove-meal-btn" @click="removeMeal">Remove meal</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import WeeklyMenuRecipeCard from "@/components/WeeklyMenuRecipeCard.vue";
import Loader from "@/components/Loader.vue";
import {Modal} from "bootstrap";
import DontRecommendRecipes from "@/views/DontRecommendRecipes.vue";
export default {
	name: "WeeklyMenu",
	computed: {
		DontRecommendRecipes() {
			return DontRecommendRecipes
		}
	},
	components: {Loader, WeeklyMenuRecipeCard},
	beforeRouteEnter,

	props: {
		nextWeek: Number | String,
	},

	data() {
		return {
			weeklyMenu: {
				monday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				tuesday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				wednesday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				thursday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				friday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				saturday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				sunday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				desserts: [],
			},

			showInitLoader: false,
			showAddAllToShoppingListLoader: false,

			generateOneData: {
				itemId: null,
				meal: null,
				currentRecipeId: null
			},
			dontRecommendRecipeId: null,
			addOneToShoppingListData: {
				categoryName: "",
				items: [],
			},

			generateErrors: [],

			removeMealItem: null,
	 	}
	},

	methods: {
		/**
		 * Initializes weekly menu of currently opened week of user.
		 */
		async initWeeklyMenu(){
			this.showInitLoader = true;
			try {
				// get weekly menu recipe cards of week
				let response = await this.axios.get(`/weeklyMenu/recipeCardsOfCurrentUser/${this.nextWeek}`);

				// get recipe images
				for (let i = 0; i < response.data.length; i++) {
					if(response.data[i].recipe?.photo && response.data[i].recipe?.photo !== "default"){
						try {
							const responseImage = await this.axios.get(`/recipe/recipeImage/${response.data[i].recipe.photo}`);
							response.data[i].recipe.photoImage = responseImage.data;
							response.data[i].recipe.photoExt = response.data[i].recipe.photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}

				// format weekly menu object for easier use
				this.weeklyMenu.desserts = [];

				for (let i = 0; i < response.data.length; i++) {
					let day = "";

					switch (response.data[i].day) {
						case null: this.weeklyMenu.desserts.push(response.data[i]); break;
						case 0: day = "monday"; break;
						case 1: day = "tuesday"; break;
						case 2: day = "wednesday"; break;
						case 3: day = "thursday"; break;
						case 4: day = "friday"; break;
						case 5: day = "saturday"; break;
						case 6: day = "sunday"; break;
					}

					switch (response.data[i].meal){
						case 0: break;
						case 1: this.weeklyMenu[day].breakfast = response.data[i]; break;
						case 2: this.weeklyMenu[day].lunch = response.data[i]; break;
						case 3: this.weeklyMenu[day].dinner = response.data[i]; break;
					}
				}

				this.weeklyMenu.desserts.sort((a,b) => a.meal - b.meal);

				this.showInitLoader = false;

			} catch (error) {
				console.log(error);
			}
		},

		/**
		 * Generate new weekly menu for currently viewed week of user.
		 */
		async generateWeek(){
			try {
				await this.axios.get(`/weeklyMenu/generate/week/${this.nextWeek}`);
				document.getElementById("generate-week-close-button").click();
				await this.initWeeklyMenu();

			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Adds all ingredients of recipes on the weekly menu of currently viewed week to user's shopping list.
		 */
		async addAllRecipesToShoppingList(){
			this.showAddAllToShoppingListLoader = true;

			try {
				// goes through every recipe and adds ingredients to shopping list
				for (const day in this.weeklyMenu) {
					for(const meal in this.weeklyMenu[day]) {
						if(this.weeklyMenu[day][meal].recipe){
							await this.axios.post(`/shoppingList/add/categoryAndItems`, {
								categoryName: this.weeklyMenu[day][meal].recipe.name,
								items: this.weeklyMenu[day][meal].recipe.ingredients,
							});
						}
					}
				}

				this.showAddAllToShoppingListLoader = false;
				document.getElementById("add-all-shopping-list-close-button").click();
			} catch (error) {
				console.log(error);
				console.log(error.response.data);
			}
		},

		/**
		 * Generate one new recommended recipe instead of an already existing recommendation.
		 */
		async generateOne(){
			try {
				await this.axios.post(`/weeklyMenu/generate/one`, this.generateOneData);

				document.getElementById("generate-one-close-button").click();
				await this.initWeeklyMenu();
			} catch (error) {
				if(Array.isArray(error.response.data.errorMessage)){
					this.generateErrors.push(...error.response.data.errorMessage);
				} else {
					this.generateErrors.push(error.response.data.errorMessage);
				}
			}
		},

		/**
		 * Puts recipe on user's "Don't recommend" list and generates new recipes for the slots that recipe was previously in.
		 * @returns {Promise<void>}
		 */
		async dontRecommend(){
			try {
				// put recipe on "Don't recommend" list
				await this.axios.get(`/weeklyMenu/dontRecommend/set/${this.dontRecommendRecipeId}`);

				document.getElementById("dont-recommend-close-button").click();

				this.showInitLoader = true;

				// get weekly menu recipes of both weeks
				let thisWeek = await this.axios.get(`/weeklyMenu/recipeCardsOfCurrentUser/0`);
				thisWeek = thisWeek.data;

				let nextWeek = await this.axios.get(`/weeklyMenu/recipeCardsOfCurrentUser/1`);
				nextWeek = nextWeek.data;

				// if recipe has the same recipeId as the one set as not to recommend, generate new recipe in that slot
				for (const item of thisWeek) {
					console.log(item.recipe?.id);
					console.log(this.dontRecommendRecipeId);

					if (item.recipe?.id === this.dontRecommendRecipeId){
						await this.axios.post(`/weeklyMenu/generate/one`, {
							itemId: item.id,
							meal: item.meal,
							currentRecipeId: item.recipe.id,
						});
					}
				}

				for (const item of nextWeek) {
					if (item.recipe?.id === this.dontRecommendRecipeId){
						await this.axios.post(`/weeklyMenu/generate/one`, {
							itemId: item.id,
							meal: item.meal,
							currentRecipeId: item.recipe.id,
						});
					}
				}

				await this.initWeeklyMenu();
			} catch (error){
				console.log(error);
			}
		},

		/**
		 * Adds the ingredients of the selected recipe to the user's shopping list.
		 */
		async addOneToShoppingList(){
			try {
				await this.axios.post(`/shoppingList/add/categoryAndItems`, this.addOneToShoppingListData);
				document.getElementById("add-one-to-shopping-list-close-button").click();

			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Remove recommended meal for given slot, leaving it empty.
		 */
		async removeMeal(){
			try {
				await this.axios.post(`/weeklyMenu/set/one`, {
					nextWeek: Boolean(Number(this.nextWeek)),
					day: this.removeMealItem.day,
					meal: Number(this.removeMealItem.meal),
					unsetByUser: true,
					recipeId: null,
				});

				document.getElementById("remove-meal-close-button").click();
				await this.initWeeklyMenu();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Generate one new recommended recipe to given slot that's empty because recipe has been manually removed before.
		 * @param item object containing the week, day, and meal of the item to generate
		 */
		async generateOneByMeal(item){
			try {
				await this.axios.post(`/weeklyMenu/generate/oneByMeal`, {
					nextWeek: Boolean(Number(this.nextWeek)),
					day: item.day,
					meal: item.meal,
					unsetByUser: false,
				});

				await this.initWeeklyMenu();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openGenerateOneModal(data){
			let generateOneModal = new Modal(document.getElementById("generate-one-modal"), {});
			generateOneModal.show();

			this.generateOneData = data;
		},

		openDontRecommend(recipeId){
			let dontRecommendModal = new Modal(document.getElementById("dont-recommend-modal"), {});
			dontRecommendModal.show();

			this.dontRecommendRecipeId = recipeId;
		},

		openAddOneToShoppingListModal(data){
			let addOneToShoppingListModal = new Modal(document.getElementById("add-one-to-shopping-list-modal"), {});
			addOneToShoppingListModal.show();

			this.addOneToShoppingListData = data;
		},

		openWeeklyMenuModal(item){
			let removeMealModal = new Modal(document.getElementById("remove-meal-modal"), {});
			removeMealModal.show();

			this.removeMealItem = item;
		},

		clearGenerateOneModal(){
			this.generateErrors = [];
		},

		/**
		 * Add modal clearing functions to the modal closing events.
		 */
		setModalHandlers(){
			const generateOneModal = document.getElementById('generate-one-modal');
			generateOneModal.addEventListener("hidden.bs.modal", () => this.clearGenerateOneModal());
		}
	},

	watch: {
		'nextWeek'(){
			this.initWeeklyMenu();
		},
	},

	mounted() {
		this.setModalHandlers();
		this.initWeeklyMenu();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 40px auto 140px auto;
		font-family: Gotu, serif;

		.page-buttons-container {
			margin-bottom: 40px;

			.this-week-btn, .next-week-btn {
				background-color: white;
				padding: 7px 20px;
				border: solid 1px var(--mediumgrey);
				border-radius: 10px;

				&:hover {
					opacity: 0.8;
				}

				a {
					text-decoration: none;
					color: var(--mediumgrey);
				}

				.this-week-icon, .next-week-icon {
					width: 20px;
					margin-top: -2px;
				}

				.this-week-icon {
					margin-right: 10px;
				}

				.next-week-icon {
					margin-left: 10px;
				}
			}

			.this-week-btn {
				display: block;
				margin-right: auto;
				margin-left: 0;
			}

			.next-week-btn {
				display: block;
				margin-left: auto;
				margin-right: 0;
			}
		}

		.title-container {
			.decorated{
				overflow: hidden;
				text-align: center;
			}
			.decorated > span{
				position: relative;
				display: inline-block;
			}
			.decorated > span:before, .decorated > span:after{
				content: '';
				position: absolute;
				top: 50%;
				border-bottom: 1px solid;
				width: 100vw;
				margin: 0 20px;
				color: var(--mediumgrey);
			}
			.decorated > span:before{
				right: 100%;
			}
			.decorated > span:after{
				left: 100%;
			}
		}

		.action-buttons-container {
			display: flex;
			justify-content: right;
			gap: 30px;
			margin-bottom: 50px;

			.add-all-to-shopping-list-icon, .generate-week-icon, .dont-recommend-recipes-icon {
				width: 22px;

				&:hover {
					cursor: pointer;
					opacity: 0.8;
				}
			}

			.generate-week-icon {
				margin-right: 20px;
			}
		}

		.loader-container {
			display: flex;
			justify-content: center;
			margin-top: 70px;
		}

		.week-container {
			margin-left: auto;
			margin-right: auto;

			.menu-section {
				margin-bottom: 60px;

				.section-title {
					font-family: "ABeeZee Regular",serif;
					margin-bottom: 15px;
				}

				.recipe-cards-container {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
			}
		}
	}

	.modal {
		margin-top: 70px;
	}

	.modal-header {
		border-bottom: none;

		.warning-icon {
			height: 40px;
			margin-top: -50px;
			margin-left: -27px;
			z-index: 1100;
		}
	}

	.generate-week, .add-all-shopping-list, .generate-one, .dont-recommend, .add-one-to-shopping-list, .remove-meal {
		margin: 0 10% 30px 10%;
		font-family: Gotu, serif;
		text-align: center;

		.generate-btn, .add-btn, .cancel-btn, .dont-recommend-btn, .add-one-to-shopping-list-btn, .remove-meal-btn {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;

			&:hover {
				opacity: 0.8;
			}
		}

		.generate-btn, .add-btn, .dont-recommend-btn, .add-one-to-shopping-list-btn, .remove-meal-btn  {
			background-color: var(--yellow);
			margin-right: 40px;
      		width: fit-content;
		}

		.cancel-btn {
			background-color: var(--lightgreen);
      		width: fit-content;
		}

		.addAllToShoppingListLoader {
			height: 25px;
			width: 25px;
			margin-right: 40px;
			margin-left: -30px;
			margin-bottom: -7px;
		}

		.generate-one-alert {
			font-size: 0.8rem;
			margin-top: 20px;
			margin-bottom: 0;
		}
	}

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;
		}
	}

  @media screen and (max-width: 465px){
    .dont-recommend, .remove-meal {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dont-recommend-btn, .remove-meal-btn {
      margin-right: 0 !important;
    }
  }

	@media (hover: none) {
		.modal-header {
			.warning-icon {
				display: none !important;
			}
		}

		.modal {
			margin-top: 0;
		}
	}
</style>